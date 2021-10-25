const firebase = require('../firebase')
const redis = require('../redis')
const {
  MessageActionRow,
  MessageButton,
} = require('discord.js')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const tz = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.tz.setDefault('America/New_York')

module.exports = {
  default: async (bot, interaction) => {
    if (interaction.customId === 'chooseIssue') {
      await interaction.deferUpdate({ephemeral: true})
      if (!interaction.values[0]) return
      await redis.setReason(interaction.user.id, interaction.values[0])
      const finalConfirmation = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('finalConfirm')
            .setLabel('Yes, submit my dispute claim')
            .setStyle('DANGER')
        )
        .addComponents(
          new MessageButton()
            .setCustomId('finalCancel')
            .setLabel('No')
            .setStyle('SECONDARY')
        )
      await interaction
        .editReply({
          content: `Alright, I've gathered all the necessary information. Submitting this claim is irreversable and subject to the Provana.GG Terms of Service - are you sure you'd like to continue?`,
          components: [finalConfirmation]
        })
    }
    else if (interaction.customId === 'slotToDispute') {
      await interaction.deferUpdate({ephemeral: true})
      if (!interaction.values[0]) return
      await redis.setSlot(interaction.user.id, interaction.value[0])
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
    else if (interaction.customId === 'disputeToRespond') {
      await interaction.deferUpdate({ephemeral: true})
      if (!interaction.values[0]) return
      const disputedSlot = await firebase.fetchDisputedSlot(interaction.values[0])
      await redis.setPartnerResponseSlot(interaction.user.id, disputedSlot.data.slot)
      await redis.setPartnerResponseDispute(interaction.user.id, disputedSlot.data.dispute)
      const _start = disputedSlot.data.slot.start * 1000
      const start = dayjs(new Date(_start * 1000)).tz('America/New_York')
      const disputeResponse = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('acceptDispute')
            .setLabel('Yes, I accept this dispute claim.')
            .setStyle('PRIMARY')
        )
        .addComponents(
          new MessageButton()
            .setCustomId('contestDispute')
            .setLabel(`I disagree with this claim. Please get me a staff member.`)
            .setStyle('DANGER')
        )
        .addComponents(
          new MessageButton()
            .setCustomId('cancelResponse')
            .setLabel(`Cancel (You can start this process again)`)
            .setStyle('SECONDARY')
        )
      await interaction
        .editReply({
          content: `You had a dispute claim filed on an instance of session "${disputedSlot.data.name}" which started at ${start}. You can either acknowledge this dispute, accepting responsibility for the claim therein, or have staff contacted immediately if you believe this is a fraudulent claim. **If you contact staff, please note they will be pinged and respond immediately,** as funds capture is time-sensitive.`,
          components: [disputeResponse]
        })
    }
    else if (interaction.customId === 'disputeToResolve') {
      await interaction.deferUpdate({ephemeral: true})
      if (!interaction.values[0]) return
      await redis.setResolve(interaction.user.id, interaction.values[0])
      const _slotToResolve = await firebase.fetchDisputedSlot(interaction.values[0])
      const disputeResolve = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('resolve-refund')
            .setLabel('Accept claim and refund buyer.')
            .setStyle('PRIMARY')
        )
        .addComponents(
          new MessageButton()
            .setCustomId('resolve-capture')
            .setLabel(`Deny claim and capture this paymentIntent.`)
            .setStyle('DANGER')
        )
        .addComponents(
          new MessageButton()
            .setCustomId('cancelResolve')
            .setLabel(`Cancel (You can start this process again)`)
            .setStyle('SECONDARY')
        )
      await interaction
        .editReply({
          content: `How would you like to resolve claim ${_slotToResolve.data.id} by buyer ${_slotToResolve.data.buyerUid}?`,
          components: [disputeResolve]
        })
    }
  }
}
