import * as message from './message'

function search(text: string, sender: any, sendResponse: (something: any) => void) {
    try {
        chrome.bookmarks.search(text, (results) => {
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
