const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js')
// const Canvas = require('@napi-rs/canvas')
// const { request } = require('undici')
const { userId } = require('../config.json')

module.exports = {
  status: 1,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute (interaction) {
    await interaction.deferReply()

    if (interaction.user.id.toString() !== userId) {
      await interaction.editReply('Pong!')
      return
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('testbutton')
        .setLabel('button')
        .setStyle(ButtonStyle.Primary))

    const testArray = []

    const message = await interaction.editReply({ content: 'admin Pong!', components: [row] })

    const filter = i => { return true }
    const collector = message.createMessageComponentCollector({ filter, max: 10 })
    collector.on('collect', async i => {
      await i.deferUpdate()

      testArray[testArray.length] = testArray.length + 1
      console.log(testArray)

      await i.editReply({ content: '' + testArray, components: [row] })
    })
  }// end execute
}