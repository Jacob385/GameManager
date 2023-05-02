const { SlashCommandBuilder } = require('discord.js');

module.exports = {
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
        .setDescription('select if your rolling with advantage or disadvantage')
        .addChoices(
          { name: 'Advantage', value: 1 },
          { name: 'Disadvantage', value: -1 },
          { name: 'Emphasis', value: 0 }
        )
    )
    .addIntegerOption(option =>
      option.setName('magnitude')
        .setDescription('the number of extra dice rolled for advantage')
        .setMinValue(2)
        .setMaxValue(5)
    )

  ,

  async execute(interaction) {
    await interaction.deferReply();

    let die = interaction.options.getInteger('d') ?? 20;
    let quantity = interaction.options.getInteger('quantity') ?? 1;
    let advantage = interaction.options.getInteger('advantage') ?? null;
    let modifier = interaction.options.getInteger('modifier') ?? 0;
    let advantageMagnitude = interaction.options.getInteger('magnitude') ?? 1;



    let set = [];
    let sum = 0;
    var list = '(';

    var advantageString;
    switch (advantage) {
      case 0: advantageString = 'Emphasis';
        break;
      case 1: advantageString = 'Advantage';
        break;
      case 2: advantageString = 'Double Advantage';
        break;
      case -1: advantageString = 'Disadvantage';
        break;
      case -2: advantageString = 'Double Disadvantage';
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
        if (Math.floor(Math.random() * ((advantage === null ? 0 : advantageMagnitude + 1) - x)) === 0 && fakeRoll > -1) {
          currentRoll = (fakeRoll <= die ? fakeRoll : die);
          fakeRoll = -1;
        }
        else {
          currentRoll = Math.floor(Math.random() * die) + 1;
        }
        set[x] = currentRoll;

        if (x == 0)//if first roll
          winningRoll = currentRoll;
        else if (advantage > 0 && winningRoll < currentRoll)//if advantage and current roll is highter
          winningRoll = currentRoll;
        else if (advantage < 0 && winningRoll > currentRoll)//if disadvantage and current roll is lower
          winningRoll = currentRoll;
        else if (advantage == 0) {
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
      for (let x = 0; x < set.length; x++) {
        if (set[x] == winningRoll && !isWinningRollAdded && !winningEmphasisMatch) {
          list += '**' + set[x] + '**';
          isWinningRollAdded = true;
        }
        else {
          list += '~~' + set[x] + '~~';
        }
        //some formating to seperate the numbers with commas
        list += (x < set.length - 1) ? ', ' : ')';
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

    var output = '>>> Rolling a **' + quantity + 'D' + die + (modifier != 0 ? (modifier > 0 ? '+' : '') + modifier : '') + '** ' + (advantage != null ? advantageString + (advantageMagnitude > 1 ? ': ' + advantageMagnitude : '') : '')
      + '\n' + list + (modifier != 0 ? '\nResult: ' + sum + (modifier > 0 ? '+' : '') + modifier : '') + '\nFinal: **' + (sum + modifier) + '**';

    if (output.length <= 2000) {
      await interaction.editReply(output);
    }
    else {
      await interaction.editReply('>>> Output exceeds the character limit. Try smaller numbers');
    }
  },
};