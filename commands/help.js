const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
  status: 2,
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with the bot'),

  async execute (interaction) {
    await interaction.deferReply()

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Some title')
      .setDescription('welcome')
      // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    // .setTimestamp()
      .setFooter({ text: 'Some footer text here' })

    const select = new StringSelectMenuBuilder()
      .setCustomId('commandSelecter')
      .setPlaceholder('Get help with a command')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Coin Flip')
          // .setDescription('The dual-type Grass/Poison Seed Pokémon.')
          .setValue('coinflip'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Connect 4')
          // .setDescription('The Fire-type Lizard Pokémon.')
          .setValue('connect4'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Lights Out')
          // .setDescription('The Water-type Tiny Turtle Pokémon.')
          .setValue('lightsout'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Tic Tac Toe')
        // .setDescription('The Water-type Tiny Turtle Pokémon.')
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
          embed.setDescription('it works')// TODO update
          break
        case 'connect4':
          embed.setDescription('asdfghjkl')// TODO update
          break

        case 'lightsout':
          embed.setDescription('asdfghjkl')// TODO update
          break
        case 'tictactoe':
          embed.setDescription('**Tic Tac Toe**\nPlay the classic game of Tic Tac Toe against anyone on the server. You can challenge a friend, yourself, or even the bot.\n\n**Difficulty**\nWhen playing against GameManager you can select different difficulties to play against. If no option is picked it will default to medium. This option has no effect when playing against another player.')
          break
      }

      await i.editReply({ embeds: [embed], components: [row] })
    })
  }// end execute
}
