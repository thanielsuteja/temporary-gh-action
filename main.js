const core = require('@actions/core')
const jira_search = require('./src/jira_search')
const jira_create = require('./src/jira_create')
const github = require('./src/github')
const util = require('./src/util')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
    try {
        const head_commit_hash = core.getInput('head_commit')

        const currBranchMetadata = util.extractBranchMetadata(),
            {
                branchName: currentBranch,
                serviceName
            } = currBranchMetadata,
            {
                prevArtifact,
                prevBranch,
            } = await jira_search.searchPreviousReleaseMetadata(serviceName)

        const previousCommitHash = util.extractCommitFromArtifact(prevArtifact),
            commitComparison = await github.compareCommits(previousCommitHash, head_commit_hash, serviceName)

        const releaseMetadata = {
            oldReleaseBranch: prevBranch,
            oldCommitHash: previousCommitHash,
            newReleaseBranch: currentBranch,
            newCommitHash: head_commit_hash,
        },
            newReleaseTicket = await jira_create.createReleaseTicket(releaseMetadata, commitComparison, currBranchMetadata, serviceName)

        core.notice(`${newReleaseTicket.url}`)

        core.setOutput('rlsTicketUrl', newReleaseTicket.url)
    } catch (error) {
        core.setFailed(error)
    }
}

module.exports = {
    run
}
