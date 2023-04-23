const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

var gameHolder = [];

function game(player1,player2)
{
this.player1=player1,
  this.player2=player2,
   currentPlayer = 1,//witch player starts
 
  //[X][]is row [][X]is column
     board = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]];
  
}


module.exports = {
  data:
    new SlashCommandBuilder()
      .setName('connect4')
      .setDescription('Play connect4 with a friend')
      .addUserOption(option =>
        option
          .setName('opponent')
          .setDescription('Sellect a user to challenge')
          .setRequired(true)
      )
  /*  new ContextMenuCommandBuilder()
     .setName('connect4')
     .setType(ApplicationCommandType.User)*/  //TODO ContextMenu
  ,


  async execute(interaction) {
    await interaction.deferReply();
    var player1 = interaction.user.id;// message.author.id TODO wich one?
var player2 = interaction.options.getUser('opponent').id;
    
     //checks if user already has a game
    let currentGame =null;
  for(let x=0;x<gameHolder.length;x++)
    {
      if(gameHolder[x].player1 === player1 ||gameHolder[x].player2 === player2)
      {
        //TODO user has a game already
        currentGame = gameHolder[x];
        x=gameHolder.length;//break
      }
    }
    if( currentGame ===null)
    {    
    //adds new game to holder
gameHolder[gameHolder.length]=new game(player1,player2);
    } 
    
    
    boardBuilder = function(lastMove) {
      var boardString = '';

      for (let x = 0; x < board[0].length; x++)
        boardString += (lastMove == x ? ':arrow_down_small: ' : ':record_button: ');//:blue_square:TODO clear up emogis 
      // boardString += '\u25BC\n';
      boardString += '\n';


      for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
          switch (board[y][x]) {
            case 2:
              boardString += ':red_circle: ';
              break;
            case 1:
              boardString += ':blue_circle: ';
              break;
            case 0:
            default:
              boardString += ':black_circle: ';
          }
        }
        boardString += '\n';
      }
      return boardString + ':one: :two: :three: :four: :five: :six: :seven:';
    }

    isColumnFull = function(columnNum) { return board[0][columnNum] != 0; }

    placePiece = function(columnNum) {
      for (let x = board.length - 1; x >= 0; x--) {
        if (board[x][columnNum] == 0) {
          board[x][columnNum] = currentPlayer;
          currentPlayer = 3 - currentPlayer;//swaps 1 for 2 and 2 for 1
         return checkWin(x, columnNum);         
        }
      }
    }

    checkWin = (x, y) => {
      x= Number(x);
      y=Number(y);
      let color = board[x][y];
      let inARow = [];
      //[direction][x/y value]
      let vectorArray = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
      let currentCell = { x: -1, y: -1 };
      for (let direction = 0; direction < vectorArray.length; direction++) {
        currentCell.x = x;
        currentCell.y = y;
        inARow[direction] = 0;
        for (let step = 0; step < 3; step++) {
          currentCell.x += vectorArray[direction][0];
          currentCell.y += vectorArray[direction][1];

          try{
          if (board[currentCell.x][currentCell.y] === color)
            inARow[direction]++;
          else
            step = 3;
          }catch(error)
          {step = 3;}
        }
      }
     console.log(inARow);
      for (let test = 0; test < 4; test++) {
         console.log(inARow[test] +", "+ (test === 3 ? 0 : inARow[test + 4]));
        if (inARow[test] + (test === 3 ? 0 : inARow[test + 4]) >= 3) {
          return color;
        }
      }
      return -1;
    }

    //adding buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('column1')
        .setLabel('1')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('column2')
        .setLabel('2')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('column3')
        .setLabel('3')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('column4')
        .setLabel('4')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('column5')
        .setLabel('5')
        .setStyle(ButtonStyle.Primary)
    );
    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('column6')
        .setLabel('6')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('column7')
        .setLabel('7')
        .setStyle(ButtonStyle.Primary)
    );

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Connect 4')
      .setDescription(boardBuilder(-1));

    await interaction.editReply({ content: `You challenged <@${player2}>.`, embeds: [embed], components: [row, row2] });

    {//buttons 
      const wait = require('node:timers/promises').setTimeout;
     


      const filter = i => {
       var columnIndex = Number(i.customId.split("n")[1]) - 1;
        ['column1', 'column2', 'column3', 'column4', 'column5', 'column6', 'column7'].some(buttonID => i.customId === buttonID)
          && !isColumnFull(columnIndex) 
          && i.user.id === (currentPlayer === 1 ? player1 : player2);
      };


      const collector = interaction.channel.createMessageComponentCollector({ filter, max: 42 });
      collector.on('collect', async i => {
        await i.deferUpdate();

        if(placePiece(columnIndex)>0)
        {
         
          collector.stop();
          await i.editReply({ content: ':trophy: '+(currentPlayer===2? `<@${player1}>.`: `<@${player2}>.`)+" Wins! :trophy:", embeds: [embed.setDescription(boardBuilder(columnIndex))], components: [] });
        }
        else
        {
          
        //locks buttons on full rows
        (columnIndex <= 5 ? row : row2).components.at(columnIndex % 5).setDisabled(isColumnFull(columnIndex));

          if(currentPlayer==1)
          embed.setColor(0x0099FF);
        else
             embed.setColor(0xFF0000);
        await i.editReply({ content: '', embeds: [embed.setDescription(boardBuilder(columnIndex))], components: [row, row2] });
        }
        
      });
    
      collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    }
  },
};