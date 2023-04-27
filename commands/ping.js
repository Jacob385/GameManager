const {AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

var testArray = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    await interaction.deferReply();
    if (interaction.user.id.toString() !== '850136276304396304') {
      await interaction.editReply('Pong!');
    }
    else {

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('testbutton')
          .setLabel('button')
          .setStyle(ButtonStyle.Primary));

      /////////////////////////////////////////////////
const canvas = Canvas.createCanvas(700, 250);
		const context = canvas.getContext('2d');

//const background = await Canvas.loadImage('./wallpaper.jpg');

	// This uses the canvas dimensions to stretch the image onto the entire canvas
	//context.drawImage(background, 0, 0, canvas.width, canvas.height);

	

	
      
// Using undici to make HTTP requests for better performance
	const { body } = await request(interaction.user.displayAvatarURL({ extension: 'jpg' }));
	const avatar = await Canvas.loadImage(await body.arrayBuffer());
      context.drawImage(avatar, 25, 0, 200, 200);
      
      // Use the helpful Attachment class structure to process the file for you
	const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-image.png' });
     const message = await interaction.editReply({ files: [attachment],content: 'admin Pong!', components: [row] });
      await message.channel.send(message.id);
      


      const filter = i => { return true; };
      const collector = interaction.channel.createMessageComponentCollector({ filter, max: 10});
      collector.on('collect', async i => {
        await i.deferUpdate();

        testArray[testArray.length] = testArray.length + 1;
        console.log(testArray);

        
        await i.editReply({ content: '' + testArray, components: [row] });
      })
    }
  },
};