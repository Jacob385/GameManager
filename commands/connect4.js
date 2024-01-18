const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { clientId } = require('../config.json')

module.exports = {
  status: 0,
  data:
    new SlashCommandBuilder()
      .setName('connect4')
      .setDescription('Play connect4 with a friend')
      .addUserOption(option =>
        option
          .setName('opponent')
          .setDescription('Sellect a user to challenge')
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option.setName('first')
          .setDescription('Who do you want to go first?')
          .addChoices(
            { name: 'Me', value: 1 },
            { name: 'Them', value: 0 }
          )
      ), /* .addIntegerOption(option =>
          option.setName('difficulty')
            .setDescription('Only applicable when faceing GameManager')
            .addChoices(
              { name: 'Easy', value: 0 },
              // { name: 'Medium', value: 1 },// TODO
              { name: 'Hard', value: 2 }
            )
        ) */

  async execute (interaction) {
    await interaction.deferReply()

    // if opponent is a different bot
    if (interaction.options.getUser('opponent').bot && interaction.options.getUser('opponent').id.toString() !== clientId) {
      return await interaction.editReply({ content: 'You cant challenge bots other than GameManager' })
    }

    let player1
    let player2
    // sets players according to the 'first' and 'opponent' parameters.
    // if 'first' is not specified, the player who used the command will be player 1
    if (interaction.options.getInteger('first') ?? 0) {
      player1 = interaction.user.id
      player2 = interaction.options.getUser('opponent').id
    } else {
      player2 = interaction.user.id
      player1 = interaction.options.getUser('opponent').id
    }

    if ( interaction.options.getUser('opponent').id === clientId) { // TODO
      return await interaction.editReply({ content: 'Challengeing GameManager comeing soon...' })
    }

    const currentGame = new Game()

    const boardBuilder = function (lastMove, board) {
      let boardString = ''

      for (let x = 0; x < board[0].length; x++) { boardString += (lastMove === x ? ':arrow_down_small: ' : ':record_button: ') }// :blue_square:TODO clear up emogis
      // boardString += '\u25BC\n';//\u3000
      boardString += '\n'

      for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
          switch (board[y][x]) {
            case 2:
              boardString += ':red_circle: '
              break
            case 1:
              boardString += ':blue_circle: '
              break
            case 0:
            default:
              boardString += ':black_circle: '
          }
        }
        boardString += '\n'
      }
      return boardString + ':one: :two: :three: :four: :five: :six: :seven:'
    }

    // adding buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('column1').setLabel('1').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('column2').setLabel('2').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('column3').setLabel('3').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('column4').setLabel('4').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('column5').setLabel('5').setStyle(ButtonStyle.Primary)
    )
    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('column6').setLabel('6').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('column7').setLabel('7').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('column-1').setLabel('Quit').setStyle(ButtonStyle.Danger)
    )

    const embed = new EmbedBuilder()
      .setColor((currentGame.currentPlayer === 1 ? 0x0099FF : 0xFF0000))
      .setTitle('Connect 4')
      .setDescription(boardBuilder(-1, currentGame.board))

    const message = await interaction.editReply({ content: `You challenged <@${interaction.options.getUser('opponent').id}>.`, embeds: [embed], components: [row, row2] })
    
    //    await message.channel.send(message.id);//TODO remove debug

    const filter = i => {
      // if wrong command return false
      if (i.customId.split('n')[0] !== 'colum') {
        console.log('wrong game')
        return false
      }

      // if wrong player id return false
      if (i.user.id !== (currentGame.player === 1 ? player1 : player2)) {
        console.log('wrong player')
        return false
      }

      return true
    }

    const collector = message.createMessageComponentCollector({ filter, max: 42 })
    // console.log(await collector.message);///TODO remove debug
    collector.on('collect', async i => {
      console.log('passed filter')/// TODO remove debug

      await i.deferUpdate()

      console.log('inside collector')/// TODO remove debug

      const columnIndex = Number(i.customId.split('n')[1]) - 1

      if (columnIndex < 0) { // if someone quit
        console.log('quit game')/// TODO remove debug
        collector.stop()
        // TODO fix who is listed as the winner
        return await i.editReply({
          content: ':trophy: ' + (currentGame.currentPlayer === 2 ? `<@${player1}>.` : `<@${player2}>.`) + ' Wins! :trophy:', embeds: [embed], components: []
        })
      }

      if (currentGame.placePiece(columnIndex) > 0) { // if someone won
        console.log('game won')/// TODO remove debug
        collector.stop()
        return await i.editReply({ content: ':trophy: ' + (currentGame.currentPlayer === 2 ? `<@${player1}>.` : `<@${player2}>.`) + ' Wins! :trophy:', embeds: [embed.setDescription(boardBuilder(columnIndex, currentGame.board))], components: [] })
      } else {
        console.log('place piece');/// TODO remove debug
        // locks buttons on full rows
        (columnIndex <= 5 ? row : row2).components.at(columnIndex % 5).setDisabled(currentGame.isColumnFull(columnIndex))

        if (currentGame.currentPlayer === 1) { embed.setColor(0x0099FF) } else { embed.setColor(0xFF0000) }
        await i.editReply({ content: '', embeds: [embed.setDescription(boardBuilder(columnIndex, currentGame.board))], components: [row, row2] })
      }
    })// end collector

    collector.on('end', collected => console.log(`Collected ${collected.size} items`))
  }

}

class Game {
  constructor () {
    this.player = 1
    this.board = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]]
  }

  placePiece (columnNum) {
    for (let y = this.board.length - 1; y >= 0; y--) {
      if (this.board[y][columnNum] === 0) {
        this.board[y][columnNum] = this.player
        this.changePlayer()
        return this.checkWin(columnNum, y)
      }
    }
    console.log('move not found///////////////////////////////')// TODOcheck
  }

  checkWin (x, y) {
    x = Number(x)
    y = Number(y)

    const color = this.board[y][x]
    const inARow = []
    // vectorArray is set up with [direction][y/x value]
    const vectorArray = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]]
    const currentCell = { x: -1, y: -1 }
    for (let direction = 0; direction < vectorArray.length; direction++) {
      currentCell.x = x
      currentCell.y = y
      inARow[direction] = 0
      for (let step = 0; step < 3; step++) {
        currentCell.y += vectorArray[direction][0]
        currentCell.x += vectorArray[direction][1]

        console.log('current cell: ' + currentCell.y + ' ' + currentCell.x)// TODOremove

        try {
          console.log(this.board[currentCell.y][currentCell.x])// TODOremove
          if (this.board[currentCell.y][currentCell.x] === color) { inARow[direction]++ } else { step = 3 }
        } catch (error) {
          console.log('catch error')// TODOremove

          step = 3
        }
      }
    }
    console.log(inARow)// TODOremove
    for (let test = 0; test < 4; test++) {
      if (inARow[test] + (test === 3 ? 0 : inARow[test + 4]) >= 3) {
        return color
      }
    }
    return -1
  }

  isColumnFull (columnNum) { return this.board[0][columnNum] !== 0 }

  getValidMoves () {
    const validMoves = []
    for (let x = 0; x < this.board[0].length; x++) {
      if (this.board[0][x] === 0) {
        validMoves.push(x)
      }
    }
    return validMoves
  }

  changePlayer () {
    // swaps 1 for 2 and 2 for 1
    this.player = 3 - this.player
    return this.player
  }

  /* printBoard () {
    console.log('\n\n | 0 1 2 3 4 5 6\n |______________')
    for (let y = 0; y < this.board.length; y++) {
      console.log(y + '| ' +
          dot(this.board[y][0]) + ' ' +
          dot(this.board[y][1]) + ' ' +
          dot(this.board[y][2]) + ' ' +
          dot(this.board[y][3]) + ' ' +
          dot(this.board[y][4]) + ' ' +
          dot(this.board[y][5]) + ' ' +
          dot(this.board[y][6]))
    }
    console.log(' |--------------\n | 1 2 3 4 5 6 7')
  } */

  copy () {
    const copy = new Game()
    copy.player = this.player
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) { copy.board[y][x] = this.board[y][x] }
    }
    return copy
  }
}// end game class
