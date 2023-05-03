const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

module.exports = {
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
    )
  ,
  async execute(interaction) {
    await interaction.deferReply();

    var coolPerson = interaction.options.getMember('user');

   

    const canvas = Canvas.createCanvas(750, 250);
    const context = canvas.getContext('2d');

    context.strokeStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);//20 TODO remove 20


    // Using undici to make HTTP requests for better performance
    const { body } = await request(coolPerson.displayAvatarURL({ extension: 'jpg' }));
    const avatar = await Canvas.loadImage(await body.arrayBuffer());
    context.drawImage(avatar, 25, 25, 200, 200);

 
    context.font = '60px sans-serif';
    context.fillStyle = '#FFFFFF';
    context.fillText(coolPerson.displayName, 250, 85);
    context.fillText('Is a Verified', 250, 150);
    context.fillText('Cool Person', 250, 215);
    
  /*  // Pick up the pen
	context.beginPath();
	// Start the arc to form a circle
	context.arc(680, 190, 30, 0, Math.PI * 2, true);
	// Put the pen down
	context.closePath();
	// Clip off the region you drew on
	context.clip();
    context.fillStyle = '#1877F2';
     context.strokeStyle = '#1877F2';
    context.fillRect(650, 160, 60, 60);
       context.fillText('C', 650, 215);
context.fillStyle = '#000000';
     context.strokeStyle = '#FFFFFF';
    context.fillText(':heavy_check_mark:', 650, 215);*/
const checkmark = await Canvas.loadImage('./pictures/check.png');
context.drawImage(checkmark, 640, 165, 60, 60);
    
    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'cool-person.png' });
    const message = await interaction.editReply({ files: [attachment], content: `${coolPerson}` });


  }
};