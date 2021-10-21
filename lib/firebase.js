const firebase = require('firebase').default

const app = firebase.initializeApp({
  apiKey: "AIzaSyBBBrVHVYBo4Hrc3rtsdOaCjN33R-9ypjY",
  authDomain: "db-abstract.firebaseapp.com",
  projectId: "db-abstract",
  storageBucket: "db-abstract.appspot.com",
  messagingSenderId: "902848736944",
  appId: "1:902848736944:web:08907137e5729b1701d575",
  measurementId: "G-L4S17NL4QE"
})
const auth = firebase.auth()
const functions = firebase.functions()
if (process.env.NODE_ENV !== 'production') {
  auth.useEmulator('http://localhost:9099')
  functions.useEmulator('localhost', 5001)
}

module.exports = {

  app: app,
  auth: auth,
  functions: functions,

  login: async () => {
    const user = await auth.signInWithEmailAndPassword(process.env.PV_EMAIL, process.env.PV_PW)
    console.log(`Logged into Provana.GG as ${user.user.email}`)
    return user
  },

  getInvite: async (id) => {
    const getOrCreateInvitation = functions.httpsCallable('getOrCreateInvitation')
    const inv = await getOrCreateInvitation({ discordUserID: id })
    return inv.data
  },

  linkSupporter: async (code, discordId) => {
    const linkDiscord = functions.httpsCallable('linkDiscord')
    return await linkDiscord({ code: code, discordId: discordId })
  },

  requestDispute: async (id) => {
    const _request = functions.httpsCallable('requestDispute')
    const disputeResponse = await _request({ discordId: id })
    return disputeResponse
  },

  fileDispute: async (dispute) => {
    const _fileDispute = functions.httpsCallable('dispute')
    await _fileDispute({
      slot: dispute.slot,
      buyer: dispute.buyer,
      details: dispute.reason
    })
    .catch(err => console.log(err))
  },

  fetchDisputesBySeller: async (discordId) => {
    const _fetchDisputesBySeller = functions.httpsCallable('fetchDisputesBySeller')
    return await _fetchDisputesBySeller({ discordId: discordId })
  },

  fetchDisputedSlot: async (slotId) => {
    const _fetchDisputedSlot = functions.httpsCallable('fetchDisputedSlot')
    return await _fetchDisputedSlot({ slotId: slotId })
  },

  respondDispute: async (slotId) => {
    const resolveDisputeSeller = functions.httpsCallable('resolveDisputeSeller')
    await resolveDisputeSeller({ slotId: slotId })
  },

}
