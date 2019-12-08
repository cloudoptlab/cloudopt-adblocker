import * as coreConfig from '../core/config'
import * as logger from '../core/logger'

const DNT_HEADER = {name: 'dnt', value: '1'}
let dntEnabled: boolean = true
let listenerAdded: boolean = false

export async function start() {
    const config = await coreConfig.get()
    dntEnabled = config.safePrivacy
    /* tslint:disable */
    if (chrome.privacy && chrome.privacy.websites['doNotTrackEnabled']) {
        chrome.privacy.websites['doNotTrackEnabled'].get({}, (details) => {
            if (details.levelOfControl === 'controllable_by_this_extension') {
                chrome.privacy.websites['doNotTrackEnabled'].set({value: dntEnabled}, () => {
                    if (chrome.runtime.lastError) {
                        logger.error(chrome.runtime.lastError.message)
                    }
                })
            }
        })
    } else if (!listenerAdded) {
        chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
            if (dntEnabled && !listenerAdded) {
                details.requestHeaders.push(DNT_HEADER)
            }
        },
        {urls: ['<all_urls>']},
        ['blocking', 'requestHeaders'])
        listenerAdded = true
    }
    /* tslint:enable */
}

start()
