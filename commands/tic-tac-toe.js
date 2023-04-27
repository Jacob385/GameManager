const {AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('tic-tac-toe')
    .setDescription('Play Tic-Tac-Toe with a friend')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('Sellect a user to challenge')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('gamemode')
        .setDescription('notdone')//TODO
        .addChoices(
          { name: 'Classic', value: 0 },
          { name: '3D', value: 1 },
          { name: 'Compound', value: 2 }
        )
    )
  ,
  async execute(interaction) {
    await interaction.deferReply();
    var player1 = interaction.user.id;// message.author.id TODO wich one?
    var player2 = interaction.options.getUser('opponent').id;
    var gameMode = interaction.options.getInteger('gamemode') ?? 0;

    let currentPlayer = 1;//witch player starts\
    let maxNumOfMoves;
    var board;

    boardToString = board2d => {
      let output = '';
      for (let x = 0; x < board2d.length; x++) {
     
        for (let y = 0; y < board2d[x].length; y++) {
          output += (board2d[x][y]!==0?(board2d[x][y]===1?':o:':':x:'):':black_large_square:') + ' ';
          output += (y < board2d[x].length - 1 ? '| ' : '');
        }
        output+= (x<board.length-1?'\n\u2015 \uD83D \u2015 🞥 \u2015\n':'');       
      }
      return output;
    }

    const ActionRowArray =
      [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('button7').setLabel('7').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('button8').setLabel('8').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('button9').setLabel('9').setStyle(ButtonStyle.Primary)),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('button4').setLabel('4').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('button5').setLabel('5').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('button6').setLabel('6').setStyle(ButtonStyle.Primary)),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('button1').setLabel('1').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('button2').setLabel('2').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('button3').setLabel('3').setStyle(ButtonStyle.Primary))
      ];

    switch (gameMode) {
      case 0://Classic
        board = [[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]];
        maxNumOfMoves = 9;
        break;
      case 1://3D
        board = [
          [[0, 0, 0], [0, 0, 0], [0, 0, 0]]

          [[0, 0, 0], [0, -1, 0], [0, 0, 0]]

          [[0, 0, 0], [0, 0, 0], [0, 0, 0]]];
        maxNumOfMoves = 26;
        break;
      case 2://Compound
        board = new Array();
        for (let x = 0; x < 3; x++) {
          board[x] = new Array();
          for (let y = 0; y < 3; y++) {
            board[x][y] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
          }
        }
        maxNumOfMoves = 81;
    }
    ActionRowArray.at(1).components.at(0).setDisabled(false)
    //.forEach(row => { row.components.forEach(button =>{})})

const canvas = Canvas.createCanvas(250, 250);
		const context = canvas.getContext('2d');

// Set the color of the stroke
	context.strokeStyle = '#000000';
//70 20 70 20 70 
	// Draw a rectangle with the dimensions of the entire canvas
	context.fillRect(0, 70, canvas.width, 20);
    context.fillRect(0, 160, canvas.width, 20);
    context.fillRect(70, 0, 20, canvas.height);
    context.fillRect(160, 0, 20, canvas.height);
	// Select the font size and type from one of the natively available fonts
	context.font = '60px sans-serif';

	// Select the style that will be used to fill the text in
	context.fillStyle = '#FF0000';//red
//context.fillStyle = '#0000FF';//blue
	// Actually fill the text with a solid color
  console.log(  context.measureText('X').width);//43
 console.log(    context.measureText('O').width);
	context.fillText('X', 14, 60);
    context.fillText('X', 104, 60);
    context.fillText('X', 194, 60);
    context.fillText('X', 14, 150);
    context.fillText('X', 14, 240);
    context.fillText('X', 104, 150);
const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'tic-tac-toe_board.png' });
    
    await interaction.editReply({files: [attachment] ,content: '', embeds: [], components: ActionRowArray });
  
    {//buttons
    const filter = i => {return true; }
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: maxNumOfMoves });
    collector.on('collect', async i => {
      await i.deferUpdate();



      await i.editReply({ content: '', embeds: [], components: [ActionRowArray] });
    });
    collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    }


  },
};