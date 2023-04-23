const { SlashCommandBuilder } = require('discord.js');

var testArray = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    await interaction.deferReply();

    

testArray[testArray.length] = testArray.length+1;
console.log(testArray);

    
    await interaction.editReply('Pong!');
  },
};