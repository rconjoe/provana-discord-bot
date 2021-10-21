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

  getUser: async (discordId) => {
    return await redis.hgetall(`${discordId}:user`)
      .catch(err => console.error(err))
  },

  setSlot: async (discordId, slotId) => {
    await redis.set(`${discordId}:slot`, slotId)
      .catch(err => console.error(err))
  },

  getSlot: async (discordId) => {
    return await redis.get(`${discordId}:slot`)
      .catch(err => console.error(err))
  },

  setReason: async (discordId, reason) => {
    await redis.set(`${discordId}:reason`, reason)
      .catch(err => console.error(err))
  },

  getReason: async (discordId) => {
    return await redis.get(`${discordId}:reason`)
      .catch(err => console.error(err))
  },

  getDisputeData: async (discordId) => {
    const buyer = await module.exports.getUser(discordId)
    const slot = await module.exports.getSlot(discordId)
    const reason = await module.exports.getReason(discordId)
    return {
      buyer: buyer.uid,
      slot: slot,
      reason: reason
    }
  },

  setPartnerResponseSlot: async (discordId, slot) => {
    for (const [key, val] of Object.entries(slot)) {
      await redis.hset(`${discordId}:slot`, key, val)
        .catch(err => console.error(err))
    }
  },

  getPartnerResponseSlot: async (discordId) => {
    return await redis
      .hgetall(`${discordId}:slot`)
      .catch(err => console.error(err))
  },

  setPartnerResponseDispute: async (discordId, slot) => {
    for (const [key, val] of Object.entries(slot)) {
      await redis.hset(`${discordId}:dispute`, key, val)
        .catch(err => console.error(err))
    }
  },

  getPartnerResponseDispute: async (discordId) => {
    return await redis
      .hgetall(`${discordId}:dispute`)
      .catch(err => console.error(err))
  },

  setResolve: async (discordId, slotId) => {
    await redis.set(`${discordId}:resolve`, slotId)
      .catch(err => console.error(err))
  },

  getResolve: async (discordId) => {
    return await redis.get(`${discordId}:resolve`)
  },

}
