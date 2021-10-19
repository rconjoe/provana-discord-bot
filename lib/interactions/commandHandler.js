const firebase = require('../firebase')
const redis = require('../redis')
const alphacode = require('./commands/alphacode')
const link = require('./commands/link')
const partner = require('./commands/partner')
const purchase = require('./commands/purchase')
const staff = require('./commands/staff')

module.exports = {
  default: async (bot, interaction) => {
    const { commandName, options } = interaction
    switch (commandName) {
      case 'alphacode':
        return await alphacode.default(bot, interaction)
      case 'link':
        return await alphacode.default(bot, interaction)
      case 'purchase':
        return await purchase.default(bot, interaction)
    }
  }
}
