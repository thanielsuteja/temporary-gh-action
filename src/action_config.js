const core = require('@actions/core')

const REPOSITORY_CC_DOMAIN_ID_MAPPING = {
    /// BCC
    'cxpboti': '35156',
    'cxpbotm': '35156',
    'cxpmsg': '35156',
    'cxpigw': '35156',
    'cxpivr': '35156',

    /// CRM & Opstools
    'cxpcrmm': '35159',
    'cxpcrmi': '35159',
    'cxpcrmj': '35159',
    'cxprule': '35159',
    'cxptool': '35159',
    'cxpjs': '35159',
}

const GITHUB_USERNAME_JIRA_ACCOUNT_MAPPING = {
    'thanielsuteja': '712020:c4291f87-dc9b-4152-b4c8-9c8bd61da3de',
}

function getJiraAccountId() {
    const triggering_actor = core.getInput('triggering_actor')

    return GITHUB_USERNAME_JIRA_ACCOUNT_MAPPING[triggering_actor];
}

function getCcDomainId(serviceName) {
    return REPOSITORY_CC_DOMAIN_ID_MAPPING[serviceName];
}
module.exports = {
    getJiraAccountId,
    getCcDomainId,
}
