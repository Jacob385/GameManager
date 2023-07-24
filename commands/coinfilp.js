const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
  status: 0,
  data: new SlashCommandBuilder()
    .setName('coin')
    .setDescription('flip')
    .addSubcommand(subcommand => subcommand
      .setName('flip')
      .setDescription('flips a coin')
      .addIntegerOption(option => option
        .setName('count')
        .setDescription('How many coins do you want to filp?')
        .setMinValue(1)
        .setMaxValue(10)
      )
    )
    .addSubcommandGroup(subcommandGroup => subcommandGroup
      .setName('flips')
      .setDescription('flip')
      .addSubcommand(subcommand => subcommand
        .setName('until')
        .setDescription('Flips a coin ultil it lands on H/T')
        .addIntegerOption(option => option
          .setName('heads-tails')
          .setDescription('Flips a coin ultil it lands on this')
          .setRequired(true)
          .addChoices(
            { name: 'Heads', value: 1 },
            { name: 'Tails', value: 0 }
          )
        )
      )
    )
  ,
  async execute(interaction) {
    await interaction.deferReply();

    const flip = () => { return Math.floor(Math.random() * 2); }
    var flipCount = interaction.options.getInteger('count') ?? 1;
    var HT = interaction.options.getInteger('heads-tails') ?? 0;
    var output = '';
    let result;
    switch (interaction.options.getSubcommand()) {
      case 'flip':
        let htCount = [0, 0];

        for (let x = 0; x < flipCount; x++) {
          result = flip();
          htCount[result]++;
          output += (result === 1 ? 'Heads' : 'Tails') + '\n';
        }
        if (flipCount === 1) {
          await interaction.editReply(">>>" + ' Fliping **1** coin\n**' + (result === 1 ? 'Heads' : 'Tails') + '**');
        }
        else {
          await interaction.editReply(">>> Fliping **" + flipCount + '** coins' + '\n' + output + '\n**Heads: ' + htCount[1] + ' Tails: ' + htCount[0] + '**');
        }
        break;
      case 'until':
        let streak = -1;
        do {
          streak++;
          result = flip();
          output += (result === 1 ? 'Heads' : 'Tails') + '\n';
        } while (result !== HT);
        await interaction.editReply(">>> Fliping until " + (HT === 1 ? 'Heads' : 'Tails') + '\n' + output + '\n**Streak: ' + streak + '**');
        break;
      default:
        await interaction.editReply('There was an error while locating this command!');
    }


  },
};