const core = require('@actions/core')

const ALL_SERVICE_REGEX = new RegExp(/\[[\w ]*ALL[\w ]*\]/)

async function compareCommits(baseCommit, serviceName) {
    const headCommit = core.getInput('head_commit', { required: true })

    const payload = await callGithubApi(baseCommit, headCommit)

    return extractDiffCommits(serviceName, payload)
}

async function callGithubApi(baseHash, headHash) {
    const url = `https://api.github.com/repos/traveloka/${core.getInput('repository_name')}/compare/${baseHash}...${headHash}`

    const resp = await fetch(url, {
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${core.getInput('github_secret')}`,
            "X-Github-Api-Version": "2022-11-28",
        },
    })

    if (resp.status !== 200)
        throw 'An error occurred while comparing commits.'


    return resp.json()
}

function extractDiffCommits(serviceName, payload) {
    serviceName = serviceName.toUpperCase()

    const SERVICE_REGEX = new RegExp(`\[[\\w\| ]*${serviceName}[\\w\| ]*\]`),
        {
            commits: rawCommits,
            html_url: comparisonUrl,
        } = payload,
        commits = rawCommits.map(commitObj => {
            const {
                commit,
                html_url: url,
            } = commitObj,
                { message } = commit,
                newLineIndex = message.indexOf('\n')

            let summary = message

            // ignore everyting after a new line
            if (newLineIndex !== -1)
                summary = summary.slice(0, newLineIndex)

            return {
                summary,
                url,
            }
        }).filter(commit => {
            return true
            // TODO: uncomment
            // const commitSummary = commit.summary.toUpperCase()
            //
            // return SERVICE_REGEX.test(commitSummary) || ALL_SERVICE_REGEX.test(commitSummary)
        })

    if (!commits.length)
        throw `No commits belonging to ${serviceName} were found.`

    return {
        commits,
        comparisonUrl,
    }
}

module.exports = {
    compareCommits
}
