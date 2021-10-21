const firebase = require('../firebase')
const redis = require('../redis')
const {
  MessageActionRow,
  MessageSelectMenu
} = require('discord.js')
module.exports = {
  default: async (bot, interaction) => {
    if (interaction.customId === 'confirmDispute') {
      await interaction.deferUpdate({ephemeral: true})
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
      return await interaction.update({ content: 'Ok nvm then x_x', components: [] })
    }
    else if (interaction.customId === 'finalConfirm') {
      const dispute = await redis.getDisputeData(interaction.user.id)
      await firebase.fileDispute(dispute)
      return await interaction.update({ content: `Your dispute has been filed. To add comments, use "/dispute comment".`, components: [] })
    }
    else if (interaction.customId === 'finalCancel') {
      return await interaction.update({ content: 'Ok nvm then x_x', components: [] })
    }
    else if (interaction.customId === 'acceptDispute') {
      await interaction.deferUpdate({ephemeral: true})
      const slotToRespond = await redis.getPartnerResponseSlot(interaction.user.id)
      await firebase.respondDispute(slotToRespond.id)
      await interaction.editReply({
        content: `Great, you don't need to take any further action. This dispute claim is resolved and the claimant will not be charged.`,
        components: []
      })
    }
    else if (interaction.customId === 'contestDispute') {
      await interaction.deferUpdate({ephemeral: true})
      // const slotToRespond = await redis.getPartnerResponseSlot(interaction.user.id)

    }
    else if (interaction.customId === 'cancelResponse') {

    }
  }
}
