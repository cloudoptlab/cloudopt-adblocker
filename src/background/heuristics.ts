import * as coreConfig from '../core/config'
import * as grade from '../core/grade'
import * as notification from '../core/notification'
import * as i18n from '../core/i18n'
import message from '../core/message'
import * as http from '../core/http'
import * as logger from '../core/logger'
import { Baize } from '../baize/baize'
import { getHost } from '../core/utils'
import { UrlParse } from '../baize/lib/urlparse'
import { tabsBlockCount, updateBadgeText } from '../background/adguardEngine'
import * as statistics from '../background/statistics'

let heuristicsEnabled: boolean = false

let modelVersion = "1.0.0"

let modelUrl = `https://cdn.cloudopt.net/baize/${modelVersion}/baize_model.json`

let baize = new Baize()

async function refreshConfig(): Promise<void> {
    const config = await coreConfig.get()
    heuristicsEnabled = config.safeHeuristics
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

    if (chrome.webRequest) {
        chrome.webRequest.onBeforeRequest.addListener((details) => {
            if (!heuristicsEnabled) {
                return
            }
            let requestUrl = details.url
            try {
                let urlparse = new UrlParse(requestUrl)
                if (requestUrl.startsWith("http") || requestUrl.startsWith("https")) {
                    if (urlparse.getRootDomain() == "cloudopt.net") {
                        return
                    }
                    if(details.initiator && details.initiator.startsWith("chrome-extension://")){
                        return
                    }
                    let requestThirdParty = 1
                    if (details.initiator && new UrlParse(details.initiator).getDomain() != urlparse.getDomain()) {
                        requestThirdParty = 3
                    }
                    let requestType = details.type
                    let predictData = baize.preProcessing(requestUrl, requestThirdParty, requestType);
                    let predictResult = baize.predict(predictData)
                    if (predictResult > 0) {
                        logger.info(`BAIZE Blocked: ${requestUrl}`)
                        tabsBlockCount.get(details.tabId).count = tabsBlockCount.get(details.tabId).count + 1
                        updateBadgeText(details.tabId)
                        statistics.countEvent('adblock')
                        return { cancel: true }
                    }
                }
            } catch (error) {
                return
            }




        }, { urls: ["<all_urls>"] })
    }
}

http.get(modelUrl, { cache: true }).then((data) => {
    logger.info(`Download the model file successfully. Baize version: ${modelVersion}`)
    baize.load(JSON.stringify(data))
    logger.info(`Loaded the model file successfully.`)
}).then(() => {
    initialize()
})
