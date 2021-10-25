const firebase = require('../../firebase')

module.exports = {
  default: async (bot, interaction) => {
    console.log(bot.user.id)
    await interaction.deferReply({ephemeral: true})
    const inv = await firebase.getInvite(interaction.user.id)
    return await interaction.editReply(`Your invitation code is ${inv}. It's only good once, so don't share it with anyone!`)
  }
}
