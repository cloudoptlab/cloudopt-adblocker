import message from '../core/message'

function search(text: any, sender: any, sendResponse: (something: any) => void) {
    try {
        chrome.bookmarks.search(text.text, (results) => {
            sendResponse(results)
        })
    } catch (e) {
        /* nothing here */
    }
}

message.addListener({
    type: 'bookmark-search',
    callback: search,
})
