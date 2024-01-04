const { REST, Routes } = require('discord.js')
const { clientId, guildId, token } = require('./config.json')
const fs = require('node:fs')
const path = require('node:path')

const commands = []
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token)

console.log('got this far')

// for ONE guild-based commands
/* rest.delete(Routes.applicationGuildCommand(clientId, guildId, '1092241743757451367'))
  .then(() => console.log('Successfully deleted guild command'))
  .catch(console.error); */

// for All guild-based commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
  .then(() => console.log('Successfully deleted all guild commands.'))
  .catch(console.error)
