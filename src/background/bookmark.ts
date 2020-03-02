import message from '../core/message'
import * as logger from '../core/logger'

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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    message.sendTab(tabId, 'load-complete').then((result: any) => {
        // catch last error of messaging
        if (chrome.runtime.lastError) {
            logger.debug(chrome.runtime.lastError.message);
        }
        return result
    })
})
