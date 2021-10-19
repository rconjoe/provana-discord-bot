const firebase = require('../../firebase')
const redis = require('../../redis')

module.exports = {
  default: async (bot, interaction) => {
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
