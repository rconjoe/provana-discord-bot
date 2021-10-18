const Redis = require('ioredis')
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

module.exports = {
  redis: redis,

  setUser: async (discordId, user) => {
    for (const [key, val] of Object.entries(user)) {
      await redis.hset(`${discordId}:user`, key, val)
        .catch(err => console.error(err))
    }
  },

  setDisputeData: async (discordId, uid, username, slot) => {
    let id = slot.id
    await redis.hset(`${discordId}:dispute`, 'uid', uid)
      .catch(err => console.error(err))
    await redis.hset(`${discordId}:dispute`, 'username', username)
      .catch(err => console.error(err))
    await redis.hset(`${discordId}:dispute`, 'slotId', id)
      .catch(err => console.error(err))
    for (const [key, val] of Object.entries(slot)) {
      await redis.hset(`${id}:dispute`, key, val)
        .catch(err => console.error(err))
    }
    await redis.expire(`${discordId}:dispute`, 900)
      .catch(err => console.error(err))
    await redis.expire(`${id}:dispute`, 900)
      .catch(err => console.error(err))
  },

  getDisputeData: async discordId => {
    const user = await redis.hgetall(`${discordId}:dispute`)
      .catch(err => console.error(err))
    const slot = await redis.hgetall(`${user.slotId}:dispute`)
      .catch(err => console.error(err))
    return { user, slot }
  },

  delDisputeData: async (discordId) => {
    const user = await redis.hgetall(`${discordId}:dispute`)
      .catch(err => console.error(err))
    await redis.del(`${user.slotId}:dispute`)
      .catch(err => console.error(err))
    await redis.del(`${user.slotId}:comments`)
      .catch(err => console.error(err))
    await redis.del(discordId)
      .catch(err => console.error(err))
  },

  setComment: async (slotId, comment) => {
    await redis.lpush(`${slotId}:comments`, comment)
      .catch(err => console.error(err))
  },

  getComments: async (slotId) => {
    return await redis.lrange(`${slotId}:comments`, 0, -1)
  },

  setReason: async (slotId, reason) => {
    await redis.hset(`${slotId}:dispute`, 'reason', reason)
      .catch(err => console.error(err))
  },

  getReason: async (slotId) => {
    return await redis.hget(`${slotId}:dispute`, 'reason')
      .catch(err => console.error(err))
  },

  disputeExists: async (slotId) => {
    return await redis.exists(`${slotId}:dispute`)
  }
}
