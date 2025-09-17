const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('hello earth')
})

app.listen(3000, () => {
  console.log('Well, it\'s one for the money')
  console.log('Two for the show')
  console.log('Three to get ready')
  console.log('now go! cat! go!')
})

const fs = require('node:fs')
const path = require('node:path')
// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js')
const { userId } = require('./config.json')


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
  }
}

client.cooldowns = new Collection()

const isUndergoingMaintenance = false// toggle this
client.on(Events.InteractionCreate, async interaction => {
  // if (!interaction.isButton()) //TODO consiter handaling buttons over here

  if (!interaction.isChatInputCommand()) return

  // console.log(interaction);

  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  if (isUndergoingMaintenance || command.status !== 0) {
    if (interaction.user.id.toString() !== userId) {
      switch (command.status) {
        case 1:// Maintenance or testing
          await interaction.reply({ content: 'Bot is undergoing maintenance and/or testing.\nPlease try again later.', ephemeral: true })
          return

        case 2:// Comeing soon
          await interaction.reply({ content: 'Comeing soon...', ephemeral: true })
          return
        case 3:// Out of Order
          await interaction.reply({ content: 'This command is temporarily out of order. Our team is working to get this up and running again soon. Thank you for your patience.', ephemeral: true })
          return

        default:// Unknown status
          await interaction.reply({ content: 'This command has an unknown status error.', ephemeral: true })
          return
      }
    }
    console.log('command.status: ' + command.status)
  }

  const { cooldowns } = client

  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection())
  }

  // cooldown check
  const now = Date.now()
  const timestamps = cooldowns.get(command.data.name)
  const defaultCooldownDuration = 0
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000

  if (timestamps.has(interaction.user.id) && interaction.user.id.toString() !== userId) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000)
      return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true })
    }
  }
  timestamps.set(interaction.user.id, now)
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)

  // try to run command
  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  }
})// end interaction event

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
  console.log(`Logged in as ${c.user.tag}`)

  client.user.setActivity('in ' + client.guilds.cache.size + ' servers', { type: ActivityType.Playing })
})

function reverse(input){
  let out =""
  for(let x=input.length-1; x>=0 ;x--){
    out+=input.substring(x,x+1);
  }
  return out;
}

let token = "-1";
// If running on replit, use the token from the token.json file
try {
  token = require('./token.json').token;
}
//else use the token from the cloudflare secrets
catch(err) {
  const { A,B,C}= require('./crypt.json')
  token = reverse(A)+reverse(C)+reverse(B);




  console.log('DEBUG //////////////////////////////////////')
  console.log(typeof token);
  console.log(token.length);
  if(token.length < 20)
    console.log(token)
  else
    console.log(token.substring(0, 10) + '...' + token.substring(token.length - 10, token.length));//TODO remove
}

// Log in to Discord with your client's token
client.login(token)