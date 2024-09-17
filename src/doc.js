const h3 = (content) => ({
    "type": "heading",
    "attrs": {
        "level": 3
    },
    "content": [text_simple(content)]
})

const ul = (listItems) => ({
    "type": "bulletList",
    "content": listItems,
})

const li = (paragraphContents) => ({
    "type": "listItem",
    "content": [{
        "type": "paragraph",
        "content": paragraphContents
    }]
})

const text_simple = (content) => ({
    "type": "text",
    "text": content,
})

const text_code = (content) => ({
    "type": "text",
    "text": content,
    "marks": [{
        "type": "code"
    }]
})

const text_link = (content, url = content) => ({
    "type": "text",
    "text": content,
    "marks": [{
        "type": "link",
        "attrs": {
            "href": url
        }
    }]
})

const doc = (...docContents) => ({
    "type": "doc",
    "version": 1,
    "content": docContents
})

module.exports = {
    h3,
    ul,
    li,
    text_simple,
    text_code,
    text_link,
    doc,
}
