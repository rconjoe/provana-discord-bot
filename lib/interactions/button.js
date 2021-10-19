const firebase = require('../firebase')
const redis = require('../redis')
module.exports = {
  default: async (bot, interaction) => {
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
}
