export function open(url: string) {
    chrome.tabs.create({
        url,
        active: true,
        pinned: false,
    })
}
