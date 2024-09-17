const action_config = require('./action_config')
const util = require('./util')
const { doc, h3, ul, li, text_link, text_simple, text_code } = require('./doc')
const core = require('@actions/core')

async function createReleaseTicket(releaseMetadata, commitComparison, branchMetadata, serviceName) {
    const {
        newReleaseBranch,
        newCommitHash,
    } = releaseMetadata

    const summary = util.composeSummary(branchMetadata),
        description = composeDescription(releaseMetadata, commitComparison)

    const requestBody = composeRequestBody(summary, description, newReleaseBranch, newCommitHash, serviceName),
        newReleaseTicket = await callJiraIssueCreationApi(requestBody)

    return {
        ...newReleaseTicket,
        url: `https://29022131.atlassian.net/browse/${newReleaseTicket.key}`
    }
}

async function callJiraIssueCreationApi(body) {
    const resp = await fetch("https://29022131.atlassian.net/rest/api/3/issue", {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${core.getInput('jira_secret')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (resp.status !== 201)
        throw 'An error occurred while creating a ticket.'

    return resp.json()
}

function composeRequestBody(summary, description, newReleaseBranch, newCommitHash, serviceName) {
    const {
        project,
        parentTicket
    } = util.extractParentTicket(),
        triggeringActorAccountId = action_config.getJiraAccountId()

    return {
        fields: {
            summary,
            description,
            customfield_21571: newReleaseBranch,
            customfield_21572: newCommitHash,
            issuetype: {
                id: "10100"
            },
            ...(
                triggeringActorAccountId && {
                    assignee: {
                        id: triggeringActorAccountId
                    }
                }
            ),
            priority: {
                id: "3"
            },
            project: {
                key: project
            },
            components: [{
                id: "18508" // "BACKEND"
            }],
            parent: {
                key: parentTicket
            },
            customfield_20971: [{ // CC Domain
                id: action_config.getCcDomainId(serviceName)
            }],
        }
    }
}

function composeDescription(releaseVersionObj, releaseNoteObj) {
    const {
        oldReleaseBranch,
        oldCommitHash,
        newReleaseBranch,
        newCommitHash,
    } = releaseVersionObj,
        {
            commits,
            comparisonUrl,
        } = releaseNoteObj

    const descriptionDoc = doc(
        h3('Release Notes'),
        ul(
            commits.map(commit => li([text_link(commit.summary, commit.url)]))
        ),
        h3('Dependencies'),
        ul([
            li([text_simple("N/A")])
        ]),
        h3('Risk Category'),
        ul(
            composeRiskCategoryListItems()
        ),
        h3('Release Version'),
        ul([
            li([
                text_simple('Old release branch / commit: '), text_code(oldReleaseBranch), text_simple(' / '), text_code(oldCommitHash)
            ]),
            li([
                text_simple('New release branch / commit: '), text_code(newReleaseBranch), text_simple(' / '), text_code(newCommitHash)
            ]),
        ]),
        h3('Release Time'),
        ul([
            li([text_simple("Start Time: ")]),
            li([text_simple("End Time: ")]),
        ]),
        h3('Change Log'),
        ul([
            li([text_link(comparisonUrl)])
        ]),
        h3('Rollback Plan'),
        ul([
            li([text_simple('Release the previous version')])
        ]),
    )

    return descriptionDoc
}

function composeRiskCategoryListItems(riskCategory = null) {
    if (!riskCategory)
        return [
            li([text_simple("Small")]),
            li([text_simple("Medium")]),
            li([text_simple("High")])
        ]

    return [li([text_simple(riskCategory)])]
}

module.exports = {
    createReleaseTicket,
}
