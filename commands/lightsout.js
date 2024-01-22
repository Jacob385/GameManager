const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js')

module.exports = {
  status: 0,
  data: new SlashCommandBuilder()
    .setName('lightsout')
    .setDescription('Play Lights Out')
    .addIntegerOption(option =>
      option.setName('difficulty')
        .setDescription('Select difficulty. Defaults to easy')
        .addChoices(
          { name: 'Easy', value: 3 }, // 3 by 3
          { name: 'Medium', value: 4 }, // 4 by 4
          { name: 'Hard', value: 5 }// 5 by 5
        )),

  async execute (interaction) {
    await interaction.deferReply()

    const boardSize = interaction.options.getInteger('difficulty') ?? 3
    const grid = Array.from({ length: boardSize }, () => Array(boardSize).fill(false))
var contentText = ''
    
    // makes a 2d array of buttons. discord limits biggest size to 5 per row
    const ActionRowArray = Array.from({ length: boardSize }, () => new ActionRowBuilder())
    for (let idnumber = 1; idnumber <= boardSize * boardSize; idnumber++) {
      ActionRowArray[Math.floor((idnumber - 1) / boardSize)]
        .addComponents(new ButtonBuilder()
          .setCustomId('lightsout' + idnumber.toString()).setLabel(idnumber.toString()).setStyle(ButtonStyle.Secondary))
    }
    // '•'

    populateBoard()

    const message = await interaction.editReply({ components: ActionRowArray })

    const filter = i => {
      // if wrong player id return false
      if (i.user.id !== interaction.user.id) {
        console.log('wrong player')
        return false
      }
      return true
    }
    const collector = message.createMessageComponentCollector({ filter })
    collector.on('collect', async i => {
      await i.deferUpdate()

      const tile = Number(i.customId.split('t')[2])

      select(Math.floor((tile - 1) / boardSize), (tile - 1) % boardSize)

      if (
        (() => {
          for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
              if (grid[x][y] !== false) {
                return false
              }
            }
          } return true
        }
        )()
      ) { // if all tiles are false
        collector.stop()
          contentText = `:trophy: <@${interaction.user.id}>. Wins! :trophy:`
      }

      await i.editReply({content: contentText, components: ActionRowArray })
    })

    function select (x, y) { // swap a tile and its orthogonal neighbors
      swap(x, y)
      swap(x - 1, y)
      swap(x + 1, y)
      swap(x, y - 1)
      swap(x, y + 1)
    }

    function swap (x, y) { // swaps a tile from off to on or vice versa
      x = Number(x)
      y = Number(y)

      if (x < 0 || x >= grid.length || y < 0 || y >= grid.length) {
        return
      }

      grid[x][y] = !grid[x][y]

      ActionRowArray[x].components.at(y).setStyle((grid[x][y] ? ButtonStyle.Primary : ButtonStyle.Secondary))
    }

    function populateBoard () {// populates the board with random moves
      // makes an array of numbers from 1 to boardSize^2
      const openTiles = Array.from({ length: boardSize * boardSize }, (_, i) => i + 1)

      for (let x = 0; x < boardSize * boardSize / 2; x++) {
        const index = Math.floor(Math.random() * openTiles.length)
        const tile = openTiles[index]

        //console.log(tile)//prints answer key

        openTiles.splice(index, 1)

        select(Math.floor((tile - 1) / boardSize), (tile - 1) % boardSize)
      }
    }
  }// end execute
}
