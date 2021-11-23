const { Octokit } = require('octokit')

const octokit = new Octokit({ auth: process.env.GH_TOKEN })

module.exports = {

  octokit: octokit,

  async user() {
    return await octokit.rest.users.getAuthenticated()
  },

  async createIssue(tag, reporter, body) {
    const now = new Date()
    const tags = ['report', tag]
    let issue = await octokit.rest.issues.create({
      owner: 'provana-developers',
      repo: 'db-abstract',
      title: `[Report from ${reporter}]: ${tag}`,
      body: `${body} \n \n _Reported by ${reporter} via discord bot at ${now.toLocaleDateString()}: ${now.toLocaleTimeString()} local time`,
      labels: tags
    })
    .catch(err => console.error(err))
    console.log(issue)
  },

}
