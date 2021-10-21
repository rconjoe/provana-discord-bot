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
      if (interaction.options.data[0].options[0].name === 'manage') {
        await interaction.deferReply({ephemeral: true})
        const disputeList = await firebase.fetchDisputesBySeller(interaction.user.id)
        if (disputeList.data.slots.length === 0) {
          await interaction.editReply(`Hey ${disputeList.data.name}, it doesn't look like you have any open dispute claims. That's a good thing, though.`)
        }
        else if (disputeList.data.slots.length > 0) {
          await redis.setUser(interaction.user.id, {
            uid: disputeList.data.uid,
            username: disputeList.data.username
          })
          let disputeOptions = []
          disputeList.data.slots.forEach(slot => {
            let option = {
              label: `${slot.name}`,
              description: 'Choose this dispute.',
              value: `${slot.id}`
            }
            disputeOptions.push(option)
          })
          const disputeToRespond = new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('disputeToRespond')
                .setPlaceholder('Choose a dispute claim')
                .addOptions(disputeOptions)
            )
          await interaction.editReply({
            content: `Which claim would you like to respond to?`,
            components: [disputeToRespond]
          })
        }
      }
    }
  }
}
