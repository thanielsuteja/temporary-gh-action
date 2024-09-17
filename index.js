const core = require('@actions/core')
const jira_search = require('./src/jira_search')
const jira_create = require('./src/jira_create')
const github = require('./src/github')
const util = require('./src/util')

async function run() {
    try {
        const HEAD_COMMIT_HASH = core.getInput('head_commit', { required: true })

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
            commitComparison = await github.compareCommits(previousCommitHash, HEAD_COMMIT_HASH, serviceName)

        const releaseMetadata = {
            oldReleaseBranch: prevBranch,
            oldCommitHash: previousCommitHash,
            newReleaseBranch: currentBranch,
            newCommitHash: HEAD_COMMIT_HASH,
        },
            newReleaseTicket = await jira_create.createReleaseTicket(releaseMetadata, commitComparison, currBranchMetadata)
        core.info(newReleaseTicket)

        core.setOutput('rlsTicketUrl', newReleaseTicket.url)
    } catch (error) {
        core.setFailed(error)
    }
}

run()
