const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

var gameHolder = [];


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
/*
    let currentGame = null;

    let player1 = interaction.user.id;
    let player2 = interaction.options.getUser('opponent');
    let interactionID = interaction.id;//TODO remove if not used

    console.log(player2.id);///TODO remove debug


    if (player2.id.toString() === '1090044796845957180') {
      await interaction.editReply({ content: 'Challengeing GameManager comeing soon...' });
    }
    else if (!player2.bot) {

      player2 = player2.id;

      //checks if user already has a game
      for (let x = 0; x < gameHolder.length; x++) {
        if (gameHolder[x].player1 === player1 || gameHolder[x].player2 === player1) {
          currentGame = gameHolder[x];
          x = gameHolder.length;//break
          console.log("game already exist");///TODO remove debug
        }
      }
      if (currentGame === null) {
        //adds new game to holder
        let game = {
          player1: player1,
          player2: player2,
          currentPlayer: 1,//witch player starts
          //[X][]is row [][X]is column
          board: [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]]
        }

        gameHolder[gameHolder.length] = game;
        currentGame = game;
        console.log("\ngame added: " + Number(gameHolder.length - 1));///TODO remove debug

      }


      boardBuilder = function(lastMove, board) {
        var boardString = '';

        for (let x = 0; x < board[0].length; x++)
          boardString += (lastMove == x ? ':arrow_down_small: ' : ':record_button: ');//:blue_square:TODO clear up emogis 
        // boardString += '\u25BC\n';//\u3000
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

      isColumnFull = function(columnNum, board) { return board[0][columnNum] != 0; }

      placePiece = function(columnNum, game) {
        for (let x = game.board.length - 1; x >= 0; x--) {
          if (game.board[x][columnNum] == 0) {
            game.board[x][columnNum] = game.currentPlayer;
            game.currentPlayer = 3 - game.currentPlayer;//swaps 1 for 2 and 2 for 1
            return checkWin(x, columnNum, game);
          }
        }
      }

      checkWin = (x, y, game) => {
        x = Number(x);
        y = Number(y);
        let color = game.board[x][y];
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

            try {
              if (game.board[currentCell.x][currentCell.y] === color)
                inARow[direction]++;
              else
                step = 3;
            } catch (error) { step = 3; }
          }
        }

        for (let test = 0; test < 4; test++) {
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
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('column-1')
          .setLabel('Quit')
          .setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setColor((currentGame.currentPlayer === 1 ? 0x0099FF : 0xFF0000))
        .setTitle('Connect 4')
        .setDescription(boardBuilder(-1, currentGame.board));



      const message = await interaction.editReply({ content: `You challenged <@${currentGame.player2}>.`, embeds: [embed], components: [row, row2] });
      currentGame.gameID = message.id;//TODO check id
      console.log(message.id);///TODO remove debug
      //    await message.channel.send(message.id);//TODO remove debug

      {//buttons 

        const filter = i => {
          var columnIndex = Number(i.customId.split("n")[1]) - 1;

          /* //get last message
          const messages = i.channel.messages.fetch({ limit: 2 });//needs to be async
          console.log(messages);
          const lastMessage = messages.last();
  
          console.log(lastMessage.content);
          /////////////////////////////////////////////////////////////TODO:* /

          //console.log(i);///TODO remove debug


          //console.log('\nmessage.interaction.id: ' + i.message.interaction.id);///TODO remove debug
          //    console.log('\nmessage.id :' + i.message.id);///TODO remove debug

          for (let x = 0; x < gameHolder.length; x++) {
            //TODO  I need the id of the message (?) to match the id of the message that had a button pressed(i.message.id)
            if (i.message.id === gameHolder[x].gameID) {
              console.log("found game :" + x);///TODO remove debug
              if (gameHolder[x].player1 === i.user.id || gameHolder[x].player2 === i.user.id) {

                console.log("player match");///TODO remove debug

                //if a user hits quit
                if (i.customId === 'column-1' && (i.user.id === gameHolder[x].player1 || i.user.id === gameHolder[x].player2))
                  return true;

                let buttonList = ['column1', 'column2', 'column3', 'column4', 'column5', 'column6', 'column7'];
                return buttonList.some(buttonID => i.customId === buttonID)
                  && !isColumnFull(columnIndex, gameHolder[x].board)
                  && i.user.id === (gameHolder[x].currentPlayer === 1 ? gameHolder[x].player1 : gameHolder[x].player2);


              }
            }
          }
          return false;
        };

        //time limit 5 min
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 42, time: 300000 });
        // console.log(await collector);///TODO remove debug
        // console.log('///////////////////////////////////////');///TODO remove debug
        // console.log(await collector.message);///TODO remove debug
        collector.on('collect', async i => {
          console.log("passed filter");///TODO remove debug


          await i.deferUpdate();

          console.log("inside collector");///TODO remove debug

          var columnIndex = Number(i.customId.split("n")[1]) - 1;
          var currentGame = null;
          let x;
          for (x = 0; x < gameHolder.length; x++) {
            if (i.message.id === gameHolder[x].gameID) {
              if (gameHolder[x].player1 === i.user.id || gameHolder[x].player2 === i.user.id) {
                currentGame = gameHolder[x];
                break;
              }
            }
          }
          if (currentGame === null) {
            await i.editReply({ content: 'There was an error while looking for this game!' });
          }


          if (columnIndex < 0) {//if someing quit
            console.log("quit game");///TODO remove debug
            collector.stop();
            gameHolder.splice(x, 1);
            //TODO fix who is listed as the winner
            await i.editReply({
              content: ':trophy: ' + (currentGame.currentPlayer === 2 ? `<@${currentGame.player1}>.` : `<@${currentGame.player2}>.`) + " Wins! :trophy:", embeds: [embed], components: []
            });

          } else if (placePiece(columnIndex, currentGame) > 0) {//if someone won
            console.log("game won");///TODO remove debug
            collector.stop();
            gameHolder.splice(x, 1);
            await i.editReply({ content: ':trophy: ' + (currentGame.currentPlayer === 2 ? `<@${currentGame.player1}>.` : `<@${currentGame.player2}>.`) + " Wins! :trophy:", embeds: [embed.setDescription(boardBuilder(columnIndex, currentGame.board))], components: [] });
          }
          else {
            console.log("place piece");///TODO remove debug
            //locks buttons on full rows
            (columnIndex <= 5 ? row : row2).components.at(columnIndex % 5).setDisabled(isColumnFull(columnIndex, currentGame.board));

            if (currentGame.currentPlayer == 1)
              embed.setColor(0x0099FF);
            else
              embed.setColor(0xFF0000);
            await i.editReply({ content: '', embeds: [embed.setDescription(boardBuilder(columnIndex, currentGame.board))], components: [row, row2] });
          }

        });

        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
      }
    }
    else {
      await interaction.editReply({ content: 'You cant challenge bots other than GameManager' });
    }
  */
  
    await interaction.editReply({ content: 'Comeing Soon...' });
  }
};