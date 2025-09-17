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

     const channel = interaction.client.channels.cache.get('1352109995650584616');
   // let channel = interaction.client.guilds.fetch('1053562836707725342').channels.fetch('1352109995650584616');
   
    const server = interaction.client.fetchGuildPreview('1118223835364331627')
   
    server.then(
      function(value) {
        console.log('Found server!')
        console.log(value.iconURL())
        channel.send(value.iconURL());
        //channel.send('<:'+value.emojis.at(0).name +':'+value.emojis.at(0).id+'>')
        
        value.emojis.each(emoji => {
          channel.send('<:'+emoji.name +':'+emoji.id+'>';
          channel.send(emoji.url)
        }))
      },
      function(error) {console.log('Could not find server') }
    )



    
    
   
  
    //channel.send('A Unicode emoji: \:thumbsup:' + '\nA Discord emoji: :thumbsup:');

    
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