require('dotenv').config()
const { Client, Intents } = require('discord.js')
const firebase = require('./lib/firebase')
const registerCommands = require('./lib/registerCommands')
const commands = require('./lib/interactions/commandHandler')
const button = require('./lib/interactions/button')
const menu = require('./lib/interactions/menu')

const bot = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
})

bot.on('ready', async () => {
  console.log(`\n ${bot.user.tag} ready. Logging into Provana.GG...`)
  await firebase.login()
  const guild = bot.guilds.cache.get('630611816048885808')
  await registerCommands.default(guild)
})

bot.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    await commands.default(bot, interaction)
  }
  else if (interaction.isButton()) {
    await button.default(bot, interaction)
  }
  else if (interaction.isSelectMenu()) {
    await menu.default(bot, interaction)
  }
})

bot.login(process.env.TOKEN)
