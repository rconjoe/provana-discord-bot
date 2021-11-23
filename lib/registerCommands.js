const perms = require('./perms')

module.exports = {
  default: async (guild) => {
    let link = await guild.commands.create({
      name: 'link',
      description: 'Link Discord and Provana.GG using the code found on your Dashboard.',
      default_permission: true,
      options: [
        {
          name: 'code',
          description: 'The link code found on your Provana.GG Dashboard.',
          type: 3,
          required: true
        }
      ]
    })
    console.log(`${link.name} registered`)
    let alphacode = await guild.commands.create({
      name: 'alphacode',
      description: 'Provana.GG Alpha Partners can retrieve their invitation codes here!',
      default_permission: false,
    })
    console.log(`${alphacode.name} registered`)
    let purchase = await guild.commands.create({
      name: 'purchase',
      description: 'Commands to use for managing purchases made on Provana.GG',
      default_permission: false,
      options: [
        {
          name: 'dispute',
          description: 'File and manage dispute claims.',
          type: 2,
          options: [
            {
              name: 'create',
              description: 'Using this command allows a buyer to file a dispute claim if they have an eligible purchase.',
              type: 1
            },
          ]
        }
      ]
    })
    console.log(`${purchase.name} registered`)
    let partner = await guild.commands.create({
      name: 'partner',
      description: 'Commands for use by Provana.GG Alpha Partners',
      default_permission: false,
      options: [
        {
          name: 'dispute',
          description: 'View and respond to dispute claims.',
          type: 2,
          options: [
            {
              name: 'manage',
              description: 'Using this command acknowledges a dispute claim as valid and refunds the buyer.',
              type: 1,
            },
          ]
        }
      ]
    })
    console.log(`${partner.name} registered`)
    let staff =  await guild.commands.create({
      name: 'staff',
      description: 'Commands used by Provana.GG staff.',
      default_permission: false,
      options: [
        {
          name: 'dispute',
          description: 'Manage disputes.',
          type: 2,
          options: [
            {
              name: 'resolve',
              description: 'Resolve claims.',
              type: 1
            },
          ]
        }
      ]
    })
    console.log(`${staff.name} registered`)
    let report = await guild.commands.create({
      name: 'report',
      description: 'Bug reporting (currently staff only)',
      default_permission: false,
    })
    console.log(`${report.name} registered`)
    await perms.set(guild)
  }
}
