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
    const branchName = core.getInput('branch_name')
    if (!branchName)
        throw 'Branch name not found.'

    const RELEASE_BRANCH_REGEX = new RegExp(/release\/([\d\w]+)?\/(\d{4}-\d{2}-\d{2})\/(\d)/),
        releaseMatches = branchName.match(RELEASE_BRANCH_REGEX);
    if (!releaseMatches)
        throw 'Branch name invalid.'

    const [
        _,
        serviceName,
        releaseDate,
        releaseRevision
    ] = releaseMatches

    return {
        branchName,
        serviceName,
        releaseDate,
        releaseRevision
    }
}

function composeSummary(branchMetadata, isHotfix) {
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
    const parentTicket = core.getInput("parent_ticket");
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
    extractIssue,
    composeSummary,
    extractCommitFromArtifact,
    extractBranchMetadata,
    extractParentTicket,
}
