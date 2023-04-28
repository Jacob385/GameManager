const {AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

var testArray = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coin flip')
    .setDescription('flip'),
    
.addSubcommand(subcommand =>
		subcommand
			.setName('user')
			.setDescription('Info about a user')
			.addUserOption(option => option.setName('target').setDescription('The user')))

  .addIntegerOption(option =>
      option.setName('flip until')
        .setDescription('Flips a coin ultil the streak is broken')
  .addChoices(
          { name: 'Heads', value: 1 },
          { name: 'Tails', value: 0 }   )
    )


  async execute(interaction) {





    
  },
};