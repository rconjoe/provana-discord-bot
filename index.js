require('dotenv').config()
const firebase = require('./lib/firebase')
const redis = require('./lib/redis')
const {
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu
} = require('discord.js')
const perms = require('./lib/perms')

const bot = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
})

bot.on('ready', async () => {
  console.log(`${bot.user.tag} ready. Logging into Provana.GG...`)
  const user = await firebase.login()
  const guild = bot.guilds.cache.get('630611816048885808')
  guild.commands.create({
    name: 'link',
    description: 'Link Discord and Provana.GG using the code found on your Dashboard.',
    default_permission: true,
    options: [
      {
        name: 'code',
        description: 'The link code found on your Provana.GG Dashboard.',
        type: 3,
        required: true
      }
    ]
  })
  guild.commands.create({
    name: 'alphacode',
    description: 'Provana.GG Alpha Partners can retrieve their invitation codes here!',
    default_permission: false,
  })
  guild.commands.create({
    name: 'purchase',
    description: 'Commands to use for managing purchases made on Provana.GG',
    default_permission: false,
    options: [
      {
        name: 'dispute',
        description: 'File and manage dispute claims.',
        type: 2,
        options: [
          {
            name: 'create',
            description: 'Using this command allows a buyer to file a dispute claim if they have an eligible purchase.',
            type: 1
          },
          {
            name: 'comment',
            description: 'Allows commenting on a dispute, if one is available.',
            type: 1,
            required: false,
            options: [
              {
                name: 'comment-data',
                description: 'No more than a paragraph or so, detailing what you think we should know.',
                type: 3,
                  required: true
              }
            ]
          }
        ]
      }
    ]
  })
  // const cmds = await guild.commands.fetch()
  await perms.set(guild)
})


bot.on('interactionCreate', async (interaction) => {

  // command interaction listeners
  if (interaction.isCommand()) {
    const { commandName, options } = interaction
    if (commandName === 'alphacode') {
      console.log(bot.user.id)
      await interaction.deferReply()
      const inv = await firebase.getInvite(interaction.user.id)
      return await interaction.editReply(`Your invitation code is ${inv}. It's only good once, so don't share it with anyone!`)
    }
    if (commandName === 'link') {
      const code = options.getString('code')
      await interaction.deferReply({ephemeral: true})
      const linkedSupporter = await firebase.linkSupporter(code, interaction.user.id)
      await interaction.editReply(`${linkedSupporter.data.username}...is that you?`)
    }
    if (commandName === 'purchase') {
      if (interaction.options.getSubcommandGroup() === 'dispute') {
        if (interaction.options.getSubCommand() === 'create') {
          await interaction.deferReply()
          const provanaUser = await firebase.fetchUser(interaction.user.id)
            if (provanaUser.data.slots.length === 0) {
              await interaction.editReply(`Hi, ${provanaUser.data.username}, it doesn't look like you have any purchases eligible for a dispute claim right now.`)
            }
            else {
              await redis.setDisputeData(interaction.user.id, provanaUser.data.uid, provanaUser.data.username, provanaUser.data.slots[0])
              const confirmDispute = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('confirmDispute')
                    .setLabel('Yes')
                    .setStyle('PRIMARY')
                )
                .addComponents(
                  new MessageButton()
                    .setCustomId('cancelDispute')
                    .setLabel('No')
                    .setStyle('SECONDARY')
                )
              await interaction
                .editReply({
                  content: `Hi, ${provanaUser.data.username}! Sorry to hear you're having issues. I see your session "${provanaUser.data.slots[0].name}" should be ongoing...is this what you're looking for help with?`,
                  components: [confirmDispute]
                })
            }
          }
          else if (interaction.options.getSubCommand() === 'comment') {
            await interaction.deferReply()
            const data = await redis.getDisputeData(interaction.user.id)
            if (await redis.disputeExists(data.slot.id) === 0) {
              return await interaction.editReply(`You must have a dispute claim open in order to comment.`)
            }
            else {
              const comment = interaction.options.getString('comment-data', true)
              await redis.setComment(data.slot.id, comment)
              return await interaction.editReply(`Your comment has been added.`)
            }
        }
      }
    }
  }

  // button interaction listeners
  else if (interaction.isButton()) {
    if (interaction.customId === 'confirmDispute') {
      await interaction.deferUpdate()
      const chooseIssue = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('chooseIssue')
            .setPlaceholder('Nothing selected')
          .addOptions([
            {
              label: "No Show",
              description: "The Creator never came to the session!!!",
              value: 'no_show'
            },
            {
              label: "Bad Interaction",
              description: "I had a bad interaction with this Creator.",
              value: 'bad_interaction'
            },
            {
              label: "Other Issue",
              description: "For some other reason, I don't feel like I got what I paid for.",
              value: 'other_issue'
            }
          ])
        )
        await interaction.editReply({ content: 'Which of these best describes the issue?', components: [chooseIssue] })
    }
    else if (interaction.customId === 'cancelDispute') {
      await redis.delDisputeData(interaction.user.id)
      return await interaction.update({ content: 'Ok nvm then x_x', components: [] })
    }
    else if (interaction.customId === 'finalConfirm') {
      const data = await redis.getDisputeData(interaction.user.id)
      const reason = await redis.getReason(data.slot.id)
      await firebase.fileDispute({
        slot: data.slot.id,
        buyer: data.user.uid,
        reason: reason
      })
      return await interaction.update({ content: `Your dispute has been filed. To add comments, use "/dispute comment".`, components: [] })
    }
    else if (interaction.customId === 'finalCancel') {
      await redis.delDisputeData(interaction.user.id)
      return await interaction.update({ content: 'Ok nvm then x_x', components: [] })
    }
  }


  // select menu interaction listeners
  else if (interaction.isSelectMenu()) {
    if (interaction.customId === 'chooseIssue') {
      await interaction.deferUpdate()
      if (!interaction.values[0]) return
      const data = await redis.getDisputeData(interaction.user.id)
      await redis.setReason(data.slot.id, interaction.values[0])
      const finalConfirmation = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('finalConfirm')
            .setLabel('Yes, submit my dispute claim')
            .setStyle('DANGER')
        )
        .addComponents(
          new MessageButton()
            .setCustomId('finalCancel')
            .setLabel('No')
            .setStyle('SECONDARY')
        )
      await interaction
        .editReply({
          content: `Alright, I've gathered all the necessary information. Submitting this claim is irreversable and subject to the Provana.GG Terms of Service - are you sure you'd like to continue?`,
          components: [finalConfirmation]
        })
    }
  }
})

bot.login(process.env.TOKEN)
