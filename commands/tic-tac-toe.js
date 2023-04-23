const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

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


    // await i.editReply({ content: ':trophy: '+(currentPlayer===2? `<@${player1}>.`: `<@${player2}>.`)+" Wins!     
    //:trophy:", embeds: [embed.setDescription(boardBuilder(columnIndex))], components: [] });
    await interaction.editReply({ content: boardToString(board), embeds: [], components: ActionRowArray });

    const filter = i => { }
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: maxNumOfMoves });
    collector.on('collect', async i => {
      await i.deferUpdate();



      await i.editReply({ content: '', embeds: [], components: [row, row2] });
    });
    collector.on('end', collected => console.log(`Collected ${collected.size} items`));



  },
};