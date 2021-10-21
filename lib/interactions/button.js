const firebase = require('../firebase')
const redis = require('../redis')
const {
  MessageActionRow,
  MessageSelectMenu,
} = require('discord.js')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const tz = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.tz.setDefault('America/New_York')
module.exports = {
  default: async (bot, interaction) => {
    if (interaction.customId === 'confirmDispute') {
      await interaction.deferUpdate({ephemeral: true})
      const chooseIssue = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('chooseIssue')
            .setPlaceholder('Nothing selected')
          .addOptions([
            {
              label: "No Show",
              description: "The Creator never came to the session!!!",
              value: 'no_show'
            },
            {
              label: "Bad Interaction",
              description: "I had a bad interaction with this Creator.",
              value: 'bad_interaction'
            },
            {
              label: "Other Issue",
              description: "For some other reason, I don't feel like I got what I paid for.",
              value: 'other_issue'
            }
          ])
        )
        await interaction.editReply({ content: 'Which of these best describes the issue?', components: [chooseIssue] })
    }
    else if (interaction.customId === 'cancelDispute') {
      return await interaction.update({ content: 'Ok nvm then x_x', components: [] })
    }
    else if (interaction.customId === 'finalConfirm') {
      const dispute = await redis.getDisputeData(interaction.user.id)
      await firebase.fileDispute(dispute)
      return await interaction.update({ content: `Your dispute has been filed. To add comments, use "/dispute comment".`, components: [] })
    }
    else if (interaction.customId === 'finalCancel') {
      return await interaction.update({ content: 'Ok nvm then x_x', components: [] })
    }
    else if (interaction.customId === 'acceptDispute') {
      await interaction.deferUpdate({ephemeral: true})
      const slotToRespond = await redis.getPartnerResponseSlot(interaction.user.id)
      await firebase.respondDispute(slotToRespond.id)
      await interaction.editReply({
        content: `Great, you don't need to take any further action. This dispute claim is resolved and the claimant will not be charged.`,
        components: []
      })
    }
    else if (interaction.customId === 'contestDispute') {
      await interaction.deferUpdate({ephemeral: true})
      const slotToRespond = await redis.getPartnerResponseSlot(interaction.user.id)
      let dispute = await redis.getPartnerResponseDispute(interaction.user.id)
      let disputeThread = await interaction.channel.threads.create({
        name: `[dispute]${slotToRespond.sellerUid}`,
        reason: `Staff resolution of dispute #${slotToRespond.id}`
      })
      await disputeThread.members.add(interaction.user.id)
      await disputeThread.members.add('119891230107631616')
      await disputeThread.members.add('86289691875237888')
      await disputeThread.members.add('296737174227779594')
      const disputeEmbed = {
        color: '#8B0000',
        fields: [
          {
            name: 'Session Name:',
            value: `${slotToRespond.name}`,
          },
          { name: 'Scheduled Time:',
            value: `${dayjs(new Date(slotToRespond.start * 1000)).tz('America/New_York')}`,
          },
          {
            name: 'Dispute Reason:',
            value: `${dispute.details}`,
            inline: false
          },
          {
            name: 'SID:',
            inline: true,
            value: `${slotToRespond.sellerUid}`
          },
          {
            name: 'BID:',
            inline: true,
            value: `${slotToRespond.buyerUid}`
          },
          {
            name: 'SUID:',
            inline: true,
            value: `${slotToRespond.sellerUid}`
          },
        ],
        timestamp: new Date()
      }
      await disputeThread.send({ embeds: [disputeEmbed] })
    }
    else if (interaction.customId === 'cancelResponse') {
      await interaction.deferUpdate()
      await interaction.editReply({ content: 'Ok later x_x', components: [] })
    }
    else if (interaction.customId === 'resolve-refund') {
      await interaction.deferUpdate({ephemeral: true})
      const resolved = await redis.getResolve(interaction.user.id)
      await firebase.resolveDispute(interaction.user.id, resolved, 'resolved-refunded')
      await interaction.editReply({
        content: 'Ok, everything has been taken care of.',
        components: []
      })
    }
    else if (interaction.customId === 'resolve-capture') {
      await interaction.deferUpdate({ephemeral: true})
      const resolved = await redis.getResolve(interaction.user.id)
      await firebase.resolveDispute(interaction.user.id, resolved, 'resolved-captured')
      await interaction.editReply({
        content: 'Ok, everything has been taken care of.',
        components: []
      })
    }
    else if (interaction.customId === 'cancelResolve') {
      await interaction.deferUpdate()
      await interaction.editReply({ content: 'Ok later x_x', components: [] })
    }
  }
}
