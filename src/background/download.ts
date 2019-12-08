import * as coreConfig from '../core/config'
import * as grade from '../core/grade'
import * as notification from '../core/notification'
import * as i18n from '../core/i18n'

let listenerAdded: boolean = false
let downloadSafetyEnabled: boolean = false

export async function refresh() {
    const config = await coreConfig.get()
    downloadSafetyEnabled = config.safeDownload

    if (!listenerAdded && chrome.downloads) {
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
                chrome.downloads.cancel(downloadItem.id)
            }
        })
        listenerAdded = true
    }
}

refresh()
