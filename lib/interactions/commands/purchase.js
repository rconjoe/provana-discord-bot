const {
  MessageActionRow,
  MessageButton,
  MessageSelectMenu
} = require('discord.js')
const firebase = require('../../firebase')
const redis = require('../../redis')

module.exports = {
  default: async (bot, interaction) => {
      if (interaction.options.data[0].name === 'dispute') {
        if (interaction.options.data[0].options[0].name === 'create') {
          await interaction.deferReply()
          const requestDispute = await firebase.requestDispute(interaction.user.id)
          if (requestDispute.data.slots.length === 0) {
            await interaction.editReply(`Hi, ${requestDispute.data.username}, it doesn't look like you have any purchases eligible for a dispute claim right now.`)
          }
          else if (requestDispute.data.slots.length > 1) {
            await redis.setUser(interaction.user.id, {
              uid: requestDispute.data.uid,
              username: requestDispute.data.username
            })
            let slotOptions =  []
            requestDispute.data.slots.forEach(slot => {
              let option = {
                label: `${slot.name}`,
                description: 'Dispute this session.',
                value: `${slot.id}`
              }
              slotOptions.push(option)
            })
            const slotToDispute = new MessageActionRow()
              .addComponents(
                new MessageSelectMenu()
                  .setCustomId('slotToDispute')
                  .setPlaceholder('Choose a slot')
                .addOptions(slotOptions)
              )
            await interaction.editReply({
              content: `Which session is this in reference to?`,
              components: [slotToDispute]
            })
          }
          else if (requestDispute.data.slots.length === 1) {
            await redis.setUser(interaction.user.id, {
              uid: requestDispute.data.uid,
              username: requestDispute.data.username
            })
            await redis.setSlot(interaction.user.id, requestDispute.data.slots[0].id)
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
                content: `Hi, ${requestDispute.data.username}! Sorry to hear you're having issues. I see your session "${requestDispute.data.slots[0].name}" should be ongoing...is this what you're looking for help with?`,
                components: [confirmDispute]
              })
            }
          }
      }
  }
}
