const AWS_ARTIFACT_REGEX = new RegExp(/amazonaws\.com\/(\w+)-.*?:([\d\w]*)/)
const GITHUB_BUILD_VERSION_REGEX = new RegExp(/([\d\w]+)-.*/)
const COMMIT_HASH_REGEX = new RegExp(/^[\da-z]{4,}$/)
const core = require("@actions/core")

function extractCommitFromArtifact(buildArtifact) {
    // AWS artifact
    let matchingCommitGroup = buildArtifact.match(AWS_ARTIFACT_REGEX)
    if (matchingCommitGroup) {
        const [
            _,
            __,
            commitHash,
        ] = matchingCommitGroup
        core.info(`Extracted commit ${commitHash} from AWS artifact: ${buildArtifact}.`)

        return commitHash
    }

    // GITHUB build version
    matchingCommitGroup = buildArtifact.match(GITHUB_BUILD_VERSION_REGEX)
    if (matchingCommitGroup) {
        const [
            _,
            commitHash
        ] = matchingCommitGroup
        core.info(`Extracted commit ${commitHash} from Github build: ${buildArtifact}.`)

        return commitHash
    }

    // GIT commit hash
    const doesMatchCommitHash = COMMIT_HASH_REGEX.test(buildArtifact)
    if (!doesMatchCommitHash)
        throw 'Build artifact is invalid.'

    core.info(`Extracted commit ${buildArtifact}.`)
    return buildArtifact
}

function extractBranchMetadata() {
    const branch_name = core.getInput('branch_name')
    if (!branch_name)
        throw 'Branch name not found.'

    const RELEASE_BRANCH_REGEX = new RegExp(/release\/([\d\w]+)?\/(\d{4}-\d{2}-\d{2})\/(\d)/),
        releaseMatches = branch_name.match(RELEASE_BRANCH_REGEX);
    if (!releaseMatches)
        throw 'Branch name invalid.'

    const [
        _,
        serviceName,
        releaseDate,
        releaseRevision
    ] = releaseMatches

    return {
        branchName: branch_name,
        serviceName,
        releaseDate,
        releaseRevision
    }
}

function composeSummary(branchMetadata, isHotfix = false) {
    const {
        releaseDate,
        releaseRevision,
        serviceName,
    } = branchMetadata,
        releaseType = isHotfix ? "Hotfix " : "Release"

    return `[${serviceName.toUpperCase()}] ${releaseDate}/${releaseRevision} | ${releaseType}`
}

function extractIssue(issue = {}) {
    const {
        key: issueKey,
        self: issueUrl,
        fields,
    } = issue,
        {
            summary: issueSummary,
            status,
        } = fields

    return {
        issueKey,
        issueUrl,
        issueStatus: status.name,
        issueStatusId: status.id,
        issueSummary,
    }
}

function extractParentTicket() {
    const parent_ticket = core.getInput("parent_ticket");
    if (!parent_ticket)
        throw "Project parent ticket not found."

    const ticketRegex = new RegExp(/([\d\w_]+)-\d+/),
        matches = parent_ticket.match(ticketRegex);

    if (!matches)
        throw `Ticket ${parent_ticket} has an invalid format.`

    return {
        project: matches[1],
        parentTicket: parent_ticket,
    }
}

module.exports = {
    extractIssue,
    composeSummary,
    extractCommitFromArtifact,
    extractBranchMetadata,
    extractParentTicket,
}
