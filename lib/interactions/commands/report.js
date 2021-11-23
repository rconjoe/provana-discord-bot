const {
  MessageActionRow,
  MessageSelectMenu
} = require('discord.js')

module.exports = {
  default: async (bot, interaction) => {
    await interaction.deferReply({ephemeral: true})
    const issueTypes = [
      {
        label: 'Registration',
        description: `When trying to sign up`,
        value: `registration`
      },
      {
        label: 'Login',
        description: `When trying to sign in`,
        value: `auth`
      },
      {
        label: 'Dashboard: Home',
        description: 'Something is wrong on the dashboard homepage',
        value: 'dashboard-home'
      },
      {
        label: 'Dashboard: Account',
        description: 'Dashboard: account section',
        value: 'dashboard-account'
      },
      {
        label: 'Dashboard: Services',
        description: 'Issues adding or listing services/sessions',
        value: 'dashboard-services'
      },
      {
        label: 'Storefront/Profile',
        description: 'Partner Storefront UI',
        value: 'profile'
      },
      {
        label: 'Purchasing Sessions',
        description: 'Checkout, purchase flows, booking sessions',
        value: 'purchase'
      },
      {
        label: 'Other',
        description: 'Something that is not listed here',
        value: 'other-reported'
      }
    ]
    const issueType = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('issueType')
          .setPlaceholder('Choose a type')
          .addOptions(issueTypes)
      )
    await interaction.editReply({
      content: `Which part of the site does this best relate to?`,
      components: [issueType]
    })
  }
}
