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
      if (interaction.options.data[0].options[0].name === 'resolve') {
        await interaction.deferReply({ephemeral: true})
        const contestedDisputes = await firebase.fetchContested()
        if (contestedDisputes.data.length === 0) {
          return await interaction.editReply(`There aren't any disputes open right now. Good.`)
        }
        let contestedOptions = []
        contestedDisputes.data.forEach(slot => {
          let option = {
            label: `${slot.name}`,
            description: 'Choose this dispute.',
            value: `${slot.id}`
          }
          contestedOptions.push(option)
        })
        const disputeToResolve = new MessageActionRow()
          .addComponents(
            new MessageSelectMenu()
              .setCustomId('disputeToResolve')
              .setPlaceholder('Choose a dispute claim')
              .addOptions(contestedOptions)
          )
        await interaction.editReply({
          content: `Which claim would you like to resolve?`,
          components: [disputeToResolve]
        })
      }
    }
  }
}
