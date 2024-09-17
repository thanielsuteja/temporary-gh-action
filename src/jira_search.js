const core = require('@actions/core')
const util = require('./util')

async function searchPreviousReleaseMetadata(serviceName) {
    const payload = await callJiraAPI(serviceName)

    return extractReleaseTicketMetadata(payload)
}

async function callJiraAPI(serviceName) {
    const {
        project,
        parentTicket
    } = util.extractParentTicket(),
        requestBody = {
            jql: `summary ~ \"${serviceName}\" AND project = \"${project}\" AND parent = \"${parentTicket}\" ORDER BY created DESC`,
            maxResults: 1,
            fields: [
                "customfield_21571",
                "customfield_21572",
            ]
        }

    const resp = await fetch("https://29022131.atlassian.net/rest/api/3/search", {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${core.getInput('jira_secret')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })

    if (resp.status !== 200)
        throw 'An error occurred while searching for the latest release ticket.'

    return resp.json()
}

function extractReleaseTicketMetadata(payload) {
    const previousReleaseTicketUrl = `https://29022131.atlassian.net/browse/${payload.issues[0].key}`,
        {
            customfield_21571: prevBranch,
            customfield_21572: prevArtifact,
        } = payload.issues[0].fields


    core.info(`Previous release ticket found at ${previousReleaseTicketUrl}`)
    core.notice(previousReleaseTicketUrl, {title: "Previous Release Ticket"})

    if (!prevArtifact || !prevBranch)
        throw '"Release Branch" and/or "Artifact" wasn\'t found in the latest ticket.'

    return {
        prevBranch,
        prevArtifact,
    }
}

module.exports = {
    searchPreviousReleaseMetadata
}
