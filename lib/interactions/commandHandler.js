const alphacode = require('./commands/alphacode')
const link = require('./commands/link')
const purchase = require('./commands/purchase')
const partner = require('./commands/partner')
const staff = require('./commands/staff')

module.exports = {
  default: async (bot, interaction) => {
    const { commandName, options } = interaction
    switch (commandName) {
      case 'alphacode':
        return await alphacode.default(bot, interaction)
      case 'link':
        return await link.default(bot, interaction)
      case 'purchase':
        return await purchase.default(bot, interaction)
      case 'partner':
        return await partner.default(bot, interaction)
      case 'staff':
        return await staff.default(bot, interaction)
    }
  }
}
