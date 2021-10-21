const perms = require('./perms')

module.exports = {
  default: async (guild) => {
    await guild.commands.create({
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
    await guild.commands.create({
      name: 'alphacode',
      description: 'Provana.GG Alpha Partners can retrieve their invitation codes here!',
      default_permission: false,
    })
    await guild.commands.create({
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
            {
              name: 'comment',
              description: 'Allows commenting on a dispute, if one is available.',
              type: 1,
              required: false,
              options: [
                {
                  name: 'comment-data',
                  description: 'No more than a paragraph or so, detailing what you think we should know.',
                  type: 3,
                  required: true
                }
              ]
            }
          ]
        }
      ]
    })
    await guild.commands.create({
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
    // const cmds = await guild.commands.fetch()
    await perms.set(guild)
  }
}
