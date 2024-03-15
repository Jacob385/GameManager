const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
  status: 0,
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with the bot'),

  async execute (interaction) {
    await interaction.deferReply()

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('GameManager')
      .setDescription('Welcome')// TODOupdate
      // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      // .setTimestamp()
      // .setFooter({ text: 'Some footer text here' })

    const select = new StringSelectMenuBuilder()
      .setCustomId('commandSelecter')
      .setPlaceholder('Get help with a command')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Coin Flip')
          .setValue('coinflip'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Connect 4')
          .setValue('connect4'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Cool')
          .setValue('cool'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Lights Out')
          .setValue('lightsout'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Roll')
          .setValue('roll'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Tic Tac Toe')
          .setValue('tictactoe')
      )

    const row = new ActionRowBuilder()
      .addComponents(select)

    const message = await interaction.editReply({ embeds: [embed], components: [row] })

    const filter = i => { return true }
    const collector = message.createMessageComponentCollector({ filter, time: 15000 })
    collector.on('collect', async i => {
      await i.deferUpdate()

      const selection = i.values[0]

      switch (selection) {
        case 'coinflip':
          embed.setDescription('**Coin Flip**\nFilp some coins and see the results. Pick how many coins you want to flip and GameManager will show what each coin landed on and tally of the number of heads and tails. If a number is not selected one coin will be filped by default\n\n**Coin Flip Until**\nFilp a coin until the selected side lands up. GameManager will show what the coin lands on each time. once the streak ends it will show how many flips it took to end the streak.')
          break
        case 'connect4':
          embed.setDescription('this has not yet been filled in')// TODO update
          break
        case 'cool':
          embed.setDescription('**Cool**\nLet everyone know how cool someone is. However don\'t call yourself cool that would be weird.')
          break
        case 'lightsout':
          embed.setDescription('**Lightsout**\nPlay the classic singe player game of Lightsout. The game is played on a grid of lights, with each light being either on or off. The goal of the game is to turn off all the lights in the grid. Click on a light to toggle its state and its orthogonal neighbors. The game ends when all the lights are off.\n\n**Difficulty**\nEach difficulty level uses a bigger board than the last.Easy is 3x3, Medium is 4x4, Hard is 5x5. If no difficulty is selected, Easy will be used by default.')
          break
        case 'roll':
          embed.setDescription('this has not yet been filled in')// TODO update
          break
        case 'tictactoe':
          embed.setDescription('**Tic Tac Toe**\nPlay the classic game of Tic Tac Toe against anyone on the server. You can challenge a friend, yourself, or even the bot.\n\n**Rules**\nTic Tac Toe is a classic two-player game played on a 3x3 grid where players take turns placing their marks (X or O) in empty cells. The objective is to be the first to achieve a row of three marks horizontally, vertically, or diagonally. Players make moves by selecting numbered buttons corresponding to the grid\'s cells. The game ends when a player wins or when the grid is full, resulting in a draw.\n\n**Difficulty**\nWhen playing against GameManager you can select different difficulties to play against. If no option is picked it will default to medium. This option has no effect when playing against another player.')
          break
      }

      await i.editReply({ embeds: [embed], components: [row] })
    })// end collector

    collector.on('end', collected => interaction.editReply(
      { embeds: [embed], components: [] }
    ))
  }// end execute
}
