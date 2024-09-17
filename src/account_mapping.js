const core = require('@actions/core')

const GITHUB_USERNAME_JIRA_ACCOUNT_MAPPING = {
    'thanielsuteja': '712020:c4291f87-dc9b-4152-b4c8-9c8bd61da3de',
}

function getJiraAccountId() {
    const triggering_actor = core.getInput('triggering_actor')

    return GITHUB_USERNAME_JIRA_ACCOUNT_MAPPING[triggering_actor];
}

module.exports = {
    getJiraAccountId
}
