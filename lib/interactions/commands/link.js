const firebase = require('../../firebase')

module.exports = {
  default: async (bot, interaction) => {
    const code = interaction.options.getString('code')
    await interaction.deferReply({ephemeral: true})
    const linkedSupporter = await firebase.linkSupporter(code, interaction.user.id)
    if (linkedSupporter.data === 'NOTFOUND') {
      return await interaction.editReply(`I can't find that code...register at https://provana.gg/register`)
    }
    else return await interaction.editReply(`${linkedSupporter.data.username}...is that you?`)
  }
}
