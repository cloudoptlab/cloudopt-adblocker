import * as coreConfig from '../core/config'
import * as grade from '../core/grade'
import * as notification from '../core/notification'
import * as i18n from '../core/i18n'
import message from '../core/message'

let downloadSafetyEnabled: boolean = false

async function refreshConfig(): Promise<void> {
    const config = await coreConfig.get()
    downloadSafetyEnabled = config.safeDownload
}

export async function initialize() {
    refreshConfig()
    message.addListener({
        type: 'refresh-config',
        callback: async (msg, sender, sendResponse) => {
            refreshConfig()
            sendResponse({})
            return true
        },
    })

    if (chrome.downloads) {
        chrome.downloads.onCreated.addListener(async (downloadItem) => {
            if (!downloadSafetyEnabled) {
                return
            }

            let url = downloadItem.url
            if (downloadItem.finalUrl) {
                url = downloadItem.finalUrl
            }

            const result = await grade.website(url)
            if (!result.safe) {
                notification.error(i18n.get('dangDownTitle'))
                chrome.downloads.pause(downloadItem.id)
            }
        })
    }
}

initialize()
