const alphacode = [
  {
    id: '713524402033131641',
    type: 1,
    permission: true
  }
]

const purchase = [
  {
    id: '713524402033131641',
    type: 1,
    permission: true
  }
]

module.exports = {
  set: async (guild) => {
    const cmds = await guild.commands.fetch()
    cmds.forEach(async cmd => {
      switch(cmd.id) {
        // alphacode
        case '896836068836528149':
          await cmd.permissions.add({ permissions: alphacode })
          console.log(`perms set for ${cmd.id}`)
          break
        // purchase
        case '898280952650936401':
          await cmd.permissions.add({ permissions: purchase })
          console.log(`perms set for ${cmd.id}`)
          break
        }
    })
  }
}
