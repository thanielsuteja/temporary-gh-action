const search = require('./search.js')

async function run() {
    try {
        const whatevs = search.searchPreviousReleaseMetadata('CXPMSG')

        // Set outputs for other workflow steps to use
        core.setOutput('whatever', `${whatevs.project} and ${whatevs.parentTicket}`)
    } catch (error) {
        // Fail the workflow run if an error occurs
        core.setFailed(error.message)
    }
}

run()
