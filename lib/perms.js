const purchase = [
  {
    id: process.env.PARTNER_ROLE,
    type: 1,
    permission: true
  },
  {
    id: process.env.SUPPORTER_ROLE,
    type: 1,
    permission: true
  },
  {
    id: process.env.DEV_ROLE,
    type: 1,
    permission: true
  }
]

const partner = [
  {
    id: process.env.PARTNER_ROLE,
    type: 1,
    permission: true
  },
  {
    id: process.env.DEV_ROLE,
    type: 1,
    permission: true
  }
]

const staff = [
  {
    id: process.env.STAFF_ROLE,
    type: 1,
    permission: true
  },
  {
    id: process.env.DEV_ROLE,
    type: 1,
    permission: true
  }
]

module.exports = {
  set: async (guild) => {
    const cmds = await guild.commands.fetch()
    cmds.forEach(async cmd => {
      switch(cmd.name) {
        // alphacode
        case 'alphacode':
          await cmd.permissions.add({ permissions: partner })
          console.log(`perms set for ${cmd.id}`)
          break
        // purchase
        case 'purchase':
          await cmd.permissions.add({ permissions: purchase })
          console.log(`perms set for ${cmd.id}`)
          break
        // partner
        case 'partner':
          await cmd.permissions.add({ permissions: partner })
          console.log(`perms set for ${cmd.id}`)
        // staff
        case 'staff':
          await cmd.permissions.add({ permissions: staff })
          console.log(`perms set for ${cmd.id}`)
        // report
        case 'report':
          await cmd.permissions.add({ permissions: staff })
          console.log(`perms set for ${cmd.id}`)
        case 'link':
          return
        }
    })
  }
}
