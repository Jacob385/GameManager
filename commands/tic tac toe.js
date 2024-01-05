const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const Canvas = require('@napi-rs/canvas')
const { clientId } = require('../config.json')

module.exports = {
  status: 0,
  data: new SlashCommandBuilder()
    .setName('tic')
    .setDescription('Play Tic with a friend')
    .addSubcommandGroup(subcommandGroup => subcommandGroup
      .setName('tac')
      .setDescription('Play Tic-Tac with a friend')
      .addSubcommand(subcommand => subcommand
        .setName('toe')
        .setDescription('Play Tic-Tac-Toe with a friend')
        .addUserOption(option =>
          option.setName('opponent')
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
        )
        /* .addIntegerOption(option =>
          option.setName('gamemode')
            .setDescription('Only \"Classic\" is available right now')//TODO
            .addChoices(
              { name: 'Classic', value: 0 },
              { name: '3D', value: 1 },
              { name: 'Compound', value: 2 }
            )
        ) */
        .addIntegerOption(option =>
          option.setName('difficulty')
            .setDescription('Only applicable when faceing GameManager')
            .addChoices(
              { name: 'Easy', value: 0 },
              // { name: 'Medium', value: 1 },// TODO
              { name: 'Hard', value: 2 }
            )
        )
      )
    ),
  async execute (interaction) {
    await interaction.deferReply()

    const canvas = Canvas.createCanvas(250, 250)
    const context = canvas.getContext('2d')

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

    const gameMode = interaction.options.getInteger('gamemode') ?? 0
    const difficulty = interaction.options.getInteger('difficulty') ?? 2
    let turnCount = 1
    let maxNumOfMoves
    let board
    const SCORE_WIEGHT = 9

    const ActionRowArray =
      [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tictactoe7').setLabel('7').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tictactoe8').setLabel('8').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tictactoe9').setLabel('9').setStyle(ButtonStyle.Primary)),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tictactoe4').setLabel('4').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tictactoe5').setLabel('5').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tictactoe6').setLabel('6').setStyle(ButtonStyle.Primary)),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tictactoe1').setLabel('1').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tictactoe2').setLabel('2').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tictactoe3').setLabel('3').setStyle(ButtonStyle.Primary))
      ]

    switch (gameMode) {
      case 0:// Classic
        board = new Game(0, 0, 250, 250)
        maxNumOfMoves = 9
        break
      case 1:// 3D
        board = [
          [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
          [[0, 0, 0], [0, -1, 0], [0, 0, 0]],
          [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
        maxNumOfMoves = 26
        break
      case 2:// Compound
        board = []
        for (let x = 0; x < 3; x++) {
          board[x] = []
          for (let y = 0; y < 3; y++) {
            board[x][y] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
          }
        }
        maxNumOfMoves = 81
    }

    // 70 20 70 20 70
    context.fillRect(0, 70, canvas.width, 20)
    context.fillRect(0, 160, canvas.width, 20)
    context.fillRect(70, 0, 20, canvas.height)
    context.fillRect(160, 0, 20, canvas.height)

    let attachment = await boardPicBuilder()

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('Tic Tac Toe')
      .setImage('attachment://tic-tac-toe_board.png')

    // if bot goes first make a move
    if (player1 === clientId) {
      const tile = getBotMove()
      const y = Math.floor(-tile / 3 + 3)
      const x = (tile - 1) % 3
      attachment = await boardPicBuilder(x, y)
      ActionRowArray[y].components.at(x).setDisabled(true)
      embed.setColor((board.player === 1 ? 0x0099FF : 0xFF0000))
      board.placePiece(tile)
    }
    const message = await interaction.editReply({ files: [attachment], content: '', embeds: [embed], components: ActionRowArray })

    // buttons
    const filter = i => {
      // if wrong command return false
      if (i.customId.split('e')[0] !== 'tictacto') {
        console.log('wrong game')// TODOremove
        return false
      }

      // if wrong player id return false
      if (i.user.id !== (board.player === 1 ? player1 : player2)) {
        console.log('wrong player')// TODOremove
        return false
      }

      return true
    }

    const collector = message.createMessageComponentCollector({ filter, max: maxNumOfMoves })
    collector.on('collect', async i => {
      await i.deferUpdate()

      let tile = Number(i.customId.split('e')[1])
      do {
        // convert tile number to x and y coords
        const y = Math.floor(-tile / 3 + 3)
        const x = (tile - 1) % 3

        attachment = await boardPicBuilder(x, y)
        ActionRowArray[y].components.at(x).setDisabled(true)
        embed.setColor((board.player === 1 ? 0x0099FF : 0xFF0000))

        // place piece at the spot that matches the button number
        const outcome = board.placePiece(tile)

        // if there is a winner end the game
        if (outcome) {
          return await i.editReply({ content: ':trophy: ' + (board.player === 2 ? `<@${player1}>` : `<@${player2}>`) + ' Wins! :trophy:', embeds: [embed], components: [], files: [attachment] })
        }
        if (board.getValidMoves().length === 0) { return await i.editReply({ content: 'Draw!', embeds: [embed], components: [], files: [attachment] }) }

        turnCount++

        // if bot moves next get bot move and loop else break loop
        if ((board.player === 1 ? player1 : player2) === clientId) { tile = getBotMove() } else { break }
      } while (true)
      await i.editReply({ files: [attachment], content: '', embeds: [embed], components: ActionRowArray })
    })
    collector.on('end', collected => console.log(`Collected ${collected.size} items`))

    /// /////////////////////////////////////////////////////////////////////////////
    /// /////////////////////////////////////////////////////////////////////////////
    async function boardPicBuilder (x = -1, y = -1) {
      if (x < 0 ^ y < 0) {
        console.log('Error one invalid cord')// TODO address (should not be reachable)
        return
      }
      if (x >= 0 && y >= 0) {
        if (board.player === 1) {
          context.fillStyle = '#FF0000'// red

          const a = 1; const b = 0; const c = 0.65; const d = 1; const e = 0; const f = 0
          const xcord = 90 * x + 3; const ycord = 90 * y + 3; const w = 20; const h = 64

          context.setTransform(a, b, c, d, e, f)
          context.fillRect(xcord - (c * ycord), ycord, w, h)
          context.setTransform(a, b, -c, d, e, f)
          context.fillRect(xcord + (c * ycord) + 44, ycord, w, h)

          // clear Transform
          context.setTransform(1, 0, 0, 1, 0, 0)
        } else {
          context.strokeStyle = '#0000FF'// blue

          context.lineWidth = 15
          context.beginPath()
          context.arc(90 * x + 35, 90 * y + 35, 25, 0, 2 * Math.PI)
          context.stroke()
        }
      }

      // const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'tic-tac-toe_board.png' });
      return new AttachmentBuilder(await canvas.encode('png'), { name: 'tic-tac-toe_board.png' })
    }

    function getBotMove () {
      let tile
      if (difficulty === 0) {
        tile = babyBot()
      } else if (difficulty === 1) {
        tile = mediumBot()
      } else if (difficulty === 2) {
        tile = perfectBot()
      }
      return tile

      function babyBot () { // plays randomly
        const validMoves = board.getValidMoves()
        const availableTileCount = validMoves.length
        return validMoves[Math.floor(Math.random() * availableTileCount)]
      }

      function mediumBot () {
      // TODO
        console.log('TODO')
        return -1
      }

      function perfectBot () { // plays perfectly
        const bestMoves = alphabetaStart(board)
        const bestMoveCount = bestMoves.length
        return bestMoves[Math.floor(Math.random() * bestMoveCount)]
      }
    }

    function alphabetaStart (node) {
      let bestValue = -Infinity
      const validMoves = node.getValidMoves()
      const availableTileCount = validMoves.length
      const myPiece = (clientId === player1 ? 'X' : 'O')

      // used to show scores for debuging
      const moveScores = new Game()
      for (let y = 0; y < moveScores.board.length; y++) {
        for (let x = 0; x < moveScores.board[y].length; x++) { moveScores.board[x][y] = '-' }
      }

      let bestMoves = []
      for (let x = 0; x < availableTileCount; x++) {
        const newNode = node.copy()
        const state = newNode.placePiece(validMoves[x])

        let value
        if (state === myPiece) { value = SCORE_WIEGHT - turnCount } else { value = alphabeta(newNode, turnCount, -Infinity, Infinity, false) }

        if (value > bestValue) {
          bestMoves = []
          bestValue = value
        }
        if (value === bestValue) {
          bestMoves.push(validMoves[x])
        }

        moveScores.board[Math.floor(-validMoves[x] / 3 + 3)][(validMoves[x] - 1) % 3] = value
      }
      // console.log('Moves scores are\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')// TODOremove
      // moveScores.printBoard()
      // console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

      if (availableTileCount < 1) {
        console.log('out of moves')// TODOremove
        process.exit()
      }
      return bestMoves
    }

    function alphabeta (node, depth, alpha, beta, maximizingPlayer) {
      if (depth > 9) {
        console.log('this aint right')// TODOremove
        // return minimax(depth, alpha, beta, maximizingPlayer);
      }

      const myPiece = (clientId === player1 ? 'X' : 'O')
      const theirPiece = (clientId === player1 ? 'O' : 'X')
      const validMoves = node.getValidMoves()
      const availableTileCount = validMoves.length

      if (availableTileCount === 0) { return null }

      if (maximizingPlayer) {
        let value = -Infinity
        for (let x = 0; x < availableTileCount; x++) {
          const newNode = node.copy()
          const state = newNode.placePiece(validMoves[x])

          if (state === myPiece) { return SCORE_WIEGHT - depth }

          value = Math.max(value, alphabeta(newNode, depth + 1, alpha, beta, !maximizingPlayer))

          if (value > beta) { break }

          alpha = Math.max(alpha, value)
        }
        return value
      } else {
        let value = Infinity
        for (let x = 0; x < availableTileCount; x++) {
          const newNode = node.copy()
          const state = newNode.placePiece(validMoves[x])

          if (state === theirPiece) { return depth - SCORE_WIEGHT }

          value = Math.min(value, alphabeta(newNode, depth + 1, alpha, beta, !maximizingPlayer))

          if (value < alpha) { break }

          beta = Math.min(beta, value)
        }
        return value
      }
    }
  }// end execute

}

/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

class Game {
  constructor (newX, newY, newW, newH) {
    this.bounds = {
      x: newX,
      y: newY,
      width: newW,
      height: newH
    }
    this.player = 1
    this.board = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]]
  }

  placePiece (tile) {
    const y = Math.floor(-tile / 3 + 3)
    const x = (tile - 1) % 3
    if (this.board[y][x] === 'X' || this.board[y][x] === 'O') {
      console.log('tile ' + x + ' ' + y + ' already taken//////////////////////')// TODO adress this
    }
    this.board[y][x] = (this.player === 1 ? 'X' : 'O')
    this.changePlayer()

    return this.checkWin()
  }

  checkWin () {
    if (this.board[0][0] !== 0 && this.board[0][0] === this.board[0][1] && this.board[0][0] === this.board[0][2]) { return this.board[0][0] }
    if (this.board[1][0] !== 0 && this.board[1][0] === this.board[1][1] && this.board[1][0] === this.board[1][2]) { return this.board[1][0] }
    if (this.board[2][0] !== 0 && this.board[2][0] === this.board[2][1] && this.board[2][0] === this.board[2][2]) { return this.board[2][0] }

    if (this.board[0][0] !== 0 && this.board[0][0] === this.board[1][0] && this.board[0][0] === this.board[2][0]) { return this.board[0][0] }
    if (this.board[0][1] !== 0 && this.board[0][1] === this.board[1][1] && this.board[0][1] === this.board[2][1]) { return this.board[0][1] }
    if (this.board[0][2] !== 0 && this.board[0][2] === this.board[1][2] && this.board[0][2] === this.board[2][2]) { return this.board[0][2] }

    if (this.board[0][0] !== 0 && this.board[0][0] === this.board[1][1] && this.board[0][0] === this.board[2][2]) { return this.board[0][0] }
    if (this.board[0][2] !== 0 && this.board[0][2] === this.board[1][1] && this.board[0][2] === this.board[2][0]) { return this.board[0][2] }

    return 0
  }

  getValidMoves () {
    const validMoves = []
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) {
        if (this.board[y][x] !== 'X' && this.board[y][x] !== 'O') { validMoves.push(x - (3 * y) + 7) }
      }
    }
    return validMoves
  }

  changePlayer () {
    // swaps 1 for 2 and 2 for 1
    this.player = 3 - this.player
    return this.player
  }

  printBoard () {
    console.log(this.board[0][0] + ' | ' + this.board[0][1] + ' | ' + this.board[0][2])
    console.log('------------')
    console.log(this.board[1][0] + ' | ' + this.board[1][1] + ' | ' + this.board[1][2])
    console.log('------------')
    console.log(this.board[2][0] + ' | ' + this.board[2][1] + ' | ' + this.board[2][2])
  }

  copy () {
    const copy = new Game()
    copy.player = this.player
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) { copy.board[x][y] = this.board[x][y] }
    }
    return copy
  }
}
