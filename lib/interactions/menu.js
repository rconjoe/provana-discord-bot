const firebase = require('../firebase')
const redis = require('../redis')
module.exports = {
  default: async (bot, interaction) => {
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
}
