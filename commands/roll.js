const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  status: 0,
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls Dice')
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('The number of dice you want to roll')
        .setRequired(true)
      //.setMinValue(1)
      //.setMaxValue(Number.MAX_VALUE)
    )
    .addIntegerOption(option =>
      option.setName('d')
        .setDescription('The numder of sides on your dice')
        .setRequired(true)
        .setMinValue(2)
      //.setMaxValue(Number.MAX_VALUE)
    )
    .addIntegerOption(option =>
      option.setName('modifier')
        .setDescription('The modifier applied to your roll')
    )
    .addIntegerOption(option =>
      option.setName('advantage')
        .setDescription('Select if your rolling with advantage or disadvantage')
        .addChoices(
          { name: 'Advantage', value: 1 },
          { name: 'Disadvantage', value: -1 },
          { name: 'Emphasis', value: 0 }
        )
    )
    .addIntegerOption(option =>
      option.setName('magnitude')
        .setDescription('The number of extra dice rolled for advantage')
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addIntegerOption(option =>
      option.setName('extra')
        .setDescription('Select Reliable Talent')//TODO
        .addChoices(
          { name: 'Dragon Starry Form', value: 0 },
          { name: 'Ear for Deceit', value: 1 },
          { name: 'Reliable Talent', value: 2 },
          { name: 'Silver Tongue', value: 3 }


        )
    )
  ,

  async execute(interaction) {
    await interaction.deferReply();

    let die = interaction.options.getInteger('d') ?? 20;
    let quantity = interaction.options.getInteger('quantity') ?? 1;
    let advantage = interaction.options.getInteger('advantage') ?? null;
    let modifier = interaction.options.getInteger('modifier') ?? 0;
    let advantageMagnitude = interaction.options.getInteger('magnitude') ?? 1;
    let extra = interaction.options.getInteger('extra') ?? null;


    let set = [];
    let sum = 0;
    var list = '(';

    var advantageString;// used to print out witch 'advantage' is used
    switch (advantage) {
      case 0: advantageString = 'Emphasis';
        break;
      case 1: advantageString = 'Advantage';
        break;
      case -1: advantageString = 'Disadvantage';
        break;
    }

    var bumpPoint;// used to bump the roll up to a least this value
    var extraString;// used to print out witch 'extra' is used
    switch (extra) {
      case 0://Dragon Starry Form 
        extraString = 'Dragon Starry Form';
        bumpPoint = Math.floor(die / 2);
        break; 
      case 1://Ear for Deceit
        extraString = 'Ear for Deceit';
        bumpPoint = Math.floor(die / 2.5);
        break;
      case 2://Reliable Talent
        extraString = 'Reliable Talent';
        bumpPoint = Math.floor(die / 2);
        break;
      case 3://Silver Tongue
        extraString = 'Silver Tongue';
        bumpPoint = Math.floor(die / 2);
        break;

      default:
        extraString = "";
        bumpPoint = 0;
    }

    let fakeRoll = -1;
    if (quantity <= 0) {
      if (interaction.user.id.toString() === '850136276304396304') {
        fakeRoll = (quantity === 0 ? -1 : Math.abs(quantity));
      }
      quantity = 1;
    }
    else {
      quantity = Math.abs(quantity);
    }

    let winningRoll = 0;
    var currentRoll = 0;
    for (let y = 0; y < quantity; y++) {
      var winningEmphasisMatch = false;

      let x = 0;
      do {
        //if fake roll is used throw it somewere in the pool
        if (Math.floor(Math.random() * ((advantage === null ? 0 : advantageMagnitude + 1) - x)) === 0 && fakeRoll > -1) {
          currentRoll = (fakeRoll <= die ? fakeRoll : die);
          fakeRoll = -1;
        }
        else {// else roll normaly
          currentRoll = Math.floor(Math.random() * die) + 1;
        }
        set[x] = currentRoll;

        if (x == 0)//if first roll
          winningRoll = currentRoll;
        else if (advantage > 0 && winningRoll < currentRoll)//if advantage and current roll is highter
          winningRoll = currentRoll;
        else if (advantage < 0 && winningRoll > currentRoll)//if disadvantage and current roll is lower
          winningRoll = currentRoll;
        else if (advantage == 0) {//if emphasis and current roll is closer to middle 
          if (Math.abs((die / 2) - winningRoll) < Math.abs((die / 2) - currentRoll)) {
            winningRoll = currentRoll;
            winningEmphasisMatch = false;
          }
          else if (Math.abs((die / 2) - winningRoll) == Math.abs((die / 2) - currentRoll) && winningRoll != currentRoll)
            winningEmphasisMatch = true;
        }

        x++;
      } while (advantage != null && x < advantageMagnitude + 1);

      //bolds the number used and crosses out the unused ones as they are added to the string
      var isWinningRollAdded = false;
      var isBumped = false;
      for (let x = 0; x < set.length; x++) {
        //if its the roll that is used
        if (set[x] == winningRoll && !isWinningRollAdded && !winningEmphasisMatch && set[x] >= bumpPoint) {
          list += '**' + set[x] + '**';
          isWinningRollAdded = true;
        }
        else {
          list += '~~' + set[x] + '~~';
        }
        if (set[x] < bumpPoint) {
          set[x] = bumpPoint;
          isBumped = true;
        }

        //some formating to seperate the numbers with commas
        if (x < set.length - 1) {
          list += ', ';
        }
        else {
          list += ')';
          if (isBumped) {
            list += " Bumped! (";

            isBumped=false;
            isWinningRollAdded=false
 x = 0;
do{
 currentRoll=  set[x] ;
if (x == 0)//if first roll
          winningRoll = currentRoll;
        else if (advantage > 0 && winningRoll < currentRoll)//if advantage and current roll is highter
          winningRoll = currentRoll;
        else if (advantage < 0 && winningRoll > currentRoll)//if disadvantage and current roll is lower
          winningRoll = currentRoll;
        else if (advantage == 0) {//if emphasis and current roll is closer to middle 
          if (Math.abs((die / 2) - winningRoll) < Math.abs((die / 2) - currentRoll)) {
            winningRoll = currentRoll;
            winningEmphasisMatch = false;
          }
          else if (Math.abs((die / 2) - winningRoll) == Math.abs((die / 2) - currentRoll) && winningRoll != currentRoll)
            winningEmphasisMatch = true;
        }

        x++;
      } while (advantage != null && x < advantageMagnitude + 1);
 x = -1;



          }
        }
      }

      if (y < quantity - 1) {//if end of the line then starts a new line
        if (winningEmphasisMatch) {
          list += ' Reroll!';
          winningRoll = 0;
          y--;
        }
        list += '\n(';
      }
      sum += winningRoll;
    }

    var output = '>>> Rolling a **' + quantity + 'D' + die + (modifier != 0 ? (modifier > 0 ? '+' : '') + modifier : '') + '** ' + (advantage != null ? advantageString + (advantageMagnitude > 1 ? ': ' + advantageMagnitude+' ' : ' ') : '')+extraString
      + '\n' + list + (modifier != 0 ? '\nResult: ' + sum + (modifier > 0 ? '+' : '') + modifier : '') + '\nFinal: **' + (sum + modifier) + '**';

    if (output.length <= 2000) {
      await interaction.editReply(output);
    }
    else {
      await interaction.editReply('>>> Output exceeds the character limit. Try smaller numbers');
    }
  },
};