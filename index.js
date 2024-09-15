const core = require('@actions/core')
const search = require('./search.js')

async function run() {
    try {
        const whatevs = await search.searchPreviousReleaseMetadata('CXPMSG')

        // Set outputs for other workflow steps to use
        core.setOutput('whatever', `${whatevs.prevArtifact} and ${whatevs.prevBranch}`)
    } catch (error) {
        // Fail the workflow run if an error occurs
        core.setFailed(error.message)
    }
}

run()
