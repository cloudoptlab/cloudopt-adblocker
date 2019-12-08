import * as browserIconChange from '../core/browserIconChange'
import * as grade from '../core/grade'
import * as notification from '../core/notification'

export async function changeBrowserIcon(result: grade.Result) {
    const level = result.classify()
    if (result.safe === false) {
        browserIconChange.danger()
    } else if (level === 3 || level === 5) {
        browserIconChange.gray()
    } else if (level === 2) {
        browserIconChange.normal()
    } else {
        browserIconChange.green()
    }
}

export function start() {
    chrome.tabs.onActivated.addListener((activeInfo) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabArray) => {
            const result = await grade.website(tabArray.last().url)
            changeBrowserIcon(result)
        })
    })

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status !== 'loading') {
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabArray) => {
                const result = await grade.website(tabArray.last().url)
                changeBrowserIcon(result)
                notification.labSafeTipsNoty(result.type)
            })
        }
    })
}

start()
