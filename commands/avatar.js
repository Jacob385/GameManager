
const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js')

module.exports = {
  status: 2,
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('grabs the avatar of a user or discord server')
    .addSubcommand(subcommand => subcommand
      .setName('user')
      .setDescription('grabs the avatar of a user')
      .addUserOption(option => option
          .setName('user')
          .setDescription('Sellect a user to see their avatar')
          .setRequired(true)
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName('server')
      .setDescription('grabs the avatar of a discord server')
      .addStringOption(option =>
        option.setName('serverid')
          .setDescription('Sellect a Server to see their avatar')
          .setRequired(true)
        //.setMinValue(1)
        //.setMaxValue(Number.MAX_VALUE)
      )
    )
    
    ,
  async execute (interaction) {
    await interaction.deferReply()
    switch (interaction.options.getSubcommand()) {
      case 'user':
        const user = interaction.options.getUser('user');
        if (user ?? 0) {
          await interaction.editReply({ content: user.displayAvatarURL() });
        } else {
          await interaction.editReply('Could not find user')
        }
        break
      case 'server':
        const serverId = interaction.options.getString('serverid');
        const preView = interaction.client.fetchGuildPreview(serverId)
        preView.then(
          function(value) {
             interaction.editReply({ content: value.iconURL()})
          },
          function(error) {interaction.editReply('Could not find server\nMake sure you have the correct server id and that the server is either discoverable or that this bot is in the server')}
        );
        break
      default:
          await interaction.editReply('There was an error while locating this subcommand!')
    }
    
  }// end execute
}

