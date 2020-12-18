export function open(url: string) {
    chrome.tabs.create({
        url,
        active: true,
        pinned: false,
    })
}

export function closeCurrentTab() {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.remove(tabs[0].id)
        }
    })
}

export function closeTabByTitle(title: string) {
    chrome.tabs.query({ title: title }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.remove(tabs[0].id)
        }
    })
}