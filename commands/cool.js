const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js')
const Canvas = require('@napi-rs/canvas')
const { request } = require('undici')

module.exports = {
  status: 0,
  cooldown: 3600, // one hour
  data: new SlashCommandBuilder()
    .setName('cool')
    .setDescription('Let everyone know you thing this person is cool')
    .addSubcommand(subcommand => subcommand
      .setName('person')
      .setDescription('Let everyone know you thing this person is cool')
      .addUserOption(option => option
        .setName('user')
        .setDescription('Sellect a cool person')
        .setRequired(true)
      )
    ),
  async execute (interaction) {
    await interaction.deferReply()

    const coolPerson = interaction.options.getMember('user')

    // if user calls themselfs cool
    if (interaction.user === interaction.options.getUser('user') && interaction.user.id.toString() !== '850136276304396304') {
      await interaction.editReply({ content: 'Did you really just try to call yourself cool?\nThat is so sad.' })
    } else {
      const canvas = Canvas.createCanvas(750, 250)
      const context = canvas.getContext('2d')

      context.strokeStyle = '#000000'
      context.fillRect(0, 0, canvas.width, canvas.height)// 20 TODO remove 20

      // Using undici to make HTTP requests for better performance
      const { body } = await request(coolPerson.displayAvatarURL({ extension: 'jpg' }))
      const avatar = await Canvas.loadImage(await body.arrayBuffer())
      context.drawImage(avatar, 25, 25, 200, 200)

      context.font = '60px sans-serif'
      context.fillStyle = '#FFFFFF'
      context.fillText(coolPerson.displayName, 250, 85)
      context.fillText('Is a Verified', 250, 150)
      context.fillText('Cool Person', 250, 215)

      const checkmark = await Canvas.loadImage('./pictures/check.png')
      context.drawImage(checkmark, 640, 165, 60, 60)

      const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'cool-person.png' })
      const message = await interaction.editReply({ files: [attachment], content: `${coolPerson}` })
    }
  }
}
