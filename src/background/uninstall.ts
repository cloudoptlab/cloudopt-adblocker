import * as tabs from '../core/tab'
chrome.runtime.onInstalled.addListener((details) => {
    tabs.open('/guide.html')
})
chrome.runtime.setUninstallURL('https://wj.qq.com/s2/3072248/dc7c/')
