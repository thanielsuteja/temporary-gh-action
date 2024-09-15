const core = require('@actions/core')

async function searchPreviousReleaseMetadata(serviceName) {
    const payload = await callJiraAPI(serviceName)

    const prevReleaseMetadata = extractMetadata(payload)

    return prevReleaseMetadata
}

async function callJiraAPI(serviceName) {
    const url = `https://29022131.atlassian.net/rest/api/3/search`,
        { project, parentTicket } = extractParentTicket(),
        requestBody = {
            jql: `summary ~ \"${serviceName}\" AND project = \"${project}\" AND parent = \"${parentTicket}\" ORDER BY created DESC`,
            maxResults: 1,
            fields: [
                "customfield_21571",
                "customfield_21572",
            ]
        }

    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${core.getInput('JR')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })

    if (resp.status !== 200)
        throw {
            error: 'An error occurred while searching for the latest release ticket.',
            status: resp.status,
        }

    return resp.json()
}

function extractMetadata(payload) {
    const {
        customfield_21571: prevBranch,
        customfield_21572: prevArtifact,
    } = payload.issues[0].fields

    if (!prevArtifact || !prevBranch)
        throw {
            error: '"Release Branch" and/or "Artifact" wasn\'t found in the latest ticket.',
        }

    return {
        prevBranch,
        prevArtifact,
    }
}

function extractParentTicket() {
    const parentTicket = core.getInput("parentTicket");
    if (!parentTicket)
        throw "Project parent ticket not found."

    const ticketRegex = new RegExp(/([\d\w_]+)-\d+/),
        matches = parentTicket.match(ticketRegex);

    if (!matches)
        throw `Ticket ${parentTicket} has an invalid format.`

    return {
        project: matches[1],
        parentTicket,
    }
}

module.exports = {
    searchPreviousReleaseMetadata
}
