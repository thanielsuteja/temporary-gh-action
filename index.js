const core = require('@actions/core')
const jira_search = require('./src/jira_search.js')
const github = require('./src/github.js')
const util = require('./src/util.js')

async function run() {
    try {
        const {
            branchName: currentBranch,
            serviceName,
            releaseDate,
            releaseRevision,
        } = util.extractBranchMetadata(),
            {
                prevArtifact,
                prevBranch,
            } = await jira_search.searchPreviousReleaseMetadata(serviceName)

        const previousCommitHash = util.extractCommitFromArtifact(prevArtifact),
            commitComparison = await github.compareCommits(previousCommitHash, serviceName)

        // Set outputs for other workflow steps to use
        core.setOutput('whatever', `${prevArtifact} and ${commitComparison.comparisonUrl}`)
    } catch (error) {
        // Fail the workflow run if an error occurs
        core.setFailed(error)
    }
}

run()
