import * as coreConfig from '../../core/config'
import * as utils from '../../core/utils'
import * as logger from '../../core/logger'
import * as http from '../../core/http'
import * as store from '../../core/store'
import message from '../../core/message'
import * as statistics from '../statistics'
import $ from 'jquery'
import IAdblockEngine from '../../adblockEngine/adblockerEngine'

class TabRecord {
    public count: number
    public url: string
    public constructor() {
        this.count = 0
        this.url = ''
    }
}

enum EngineState {
    NOT_STARTED,
    STARTED,
    STOPPED,
}

export var tabsBlockCount: Map<number, TabRecord> = new Map<number, TabRecord>()

export async function updateBadgeText(tabId: number): Promise<void> {
    const config = await coreConfig.get()
    if (config && config.adblockActivating && config.adblockDisplay) {
        try {
            chrome.browserAction.setBadgeText({
                text: tabsBlockCount.get(tabId).count.toString(),
                tabId,
            })
        } catch (e) {
            chrome.browserAction.setBadgeText({
                text: '0',
                tabId,
            })
        }
    } else {
        chrome.browserAction.setBadgeText({
            text: '',
            tabId,
        })
    }
}

function getAdguardConfig(config: coreConfig.Config) {
    const allowList = config.allowListAds.slice()
    allowList.push('*.cloudopt.net')
    let filterUrls: string[] = ['https://cdn.cloudopt.net/filters/chromium/easylist.txt']
    if (config.safePrivacy) {
        filterUrls.push('https://cdn.cloudopt.net/filters/chromium/3.txt')
    }
    switch (utils.language()) {
        case 'zh-CN':
        case 'zh-TW':
            filterUrls.push('https://cdn.cloudopt.net/filters/chromium/easylistchina.txt')
            break
        case 'ru':
            filterUrls.push('https://cdn.cloudopt.net/filters/chromium/1.txt')
            break
        case 'ja':
            filterUrls.push('https://cdn.cloudopt.net/filters/chromium/7.txt')
            break
        case 'de':
            filterUrls.push('https://cdn.cloudopt.net/filters/chromium/6.txt')
            break
        case 'fr':
            filterUrls.push('https://cdn.cloudopt.net/filters/chromium/16.txt')
            break
        case 'nl':
            filterUrls.push('https://cdn.cloudopt.net/filters/chromium/8.txt')
            break
        case 'et':
            filterUrls.push('https://cdn.cloudopt.net/filters/chromium/9.txt')
            break
        case 'tr':
            filterUrls.push('https://cdn.cloudopt.net/filters/chromium/13.txt')
            break
        case 'ko':
            filterUrls.push('https://github.com/List-KR/List-KR/raw/master/filter.txt')
            break
    }
    if (!config.adblockActivating) {
        filterUrls = []
    }
    if (config.safeCoin) {
        filterUrls.push('https://cdn.cloudopt.net/filters/chromium/nocoin.txt')
    }
    if (config.safeCloud) {
        filterUrls.push('https://cdn.cloudopt.net/filters/chromium/malwaredomains_full.txt')
        filterUrls.push('https://cdn.cloudopt.net/filters/chromium/adblock-list.txt')
    }
    logger.debug(`Adblock filter list: ${filterUrls}`)
    return {
        filterUrls,
        filters: [],
        whitelist: allowList,
        rules: config.customRule,
        filtersMetadataUrl: 'https://cdn.cloudopt.net/filters/chromium/filters.json',
        filterRulesUrl: 'https://cdn.cloudopt.net/filters/chromium/{filter_id}.txt',
    }
}

async function autoAddallowListAds() {
    let fileName = null
    switch (utils.language()) {
        case 'zh-CN':
            fileName = '/lib/defaultAllowAds.cn.json'
            break
    }
    if (fileName) {
        const config = await coreConfig.get()
        $.getJSON(fileName, (data) => {
            $.each(data, (index, obj) => {
                if (!config.allowListAds.inArray(obj.host)) {
                    config.allowListAds.push(obj.host)
                }
            })
            coreConfig.set(config).then(() => message.send('refresh-config'))
        })
    }
}

class AdguardEngine implements IAdblockEngine {
    public name: string = 'adguard'
    private config: coreConfig.Config
    private state: EngineState = EngineState.NOT_STARTED

    constructor() {
        const _this = this
        message.addListener({
            type: 'refresh-config',
            callback: (msg, sender, sendResponse) => {
                _this.refresh()
                sendResponse({})
                return true
            },
        })

        message.addListener({
            type: 'assistant-create-rule',
            async callback(msg) {
                _this.config = await coreConfig.get()
                _this.config.customRule.push(msg.ruleText)
                await coreConfig.set(_this.config)
                _this.refresh()
            },
        })

        message.addListener({
            type: 'check-filters-update',
            async callback(msg, sender, sendResponse) {
                _this.startAdguardApi((succeeded: boolean) => {
                    if (succeeded) {
                        sendResponse('true')
                    } else {
                        sendResponse('false')
                    }
                }, false)
                _this.refresh()
            },
        })
    }

    public start(): boolean {
        if (this.state === EngineState.STARTED) {
            return true
        } else if (this.state === EngineState.NOT_STARTED) {
            this.startTabsBlockCount()
        }

        store.get('autoAddedAllowList').then((autoAdded) => {
            if (!autoAdded) {
                autoAddallowListAds()
                store.set('autoAddedAllowList', 'true')
            }
        })

        this.state = EngineState.STARTED
        this.refresh()
        return true
    }

    private startAdguardApi(loadRulesCallback = (str) => {}, useCache: boolean = true): void {
        const adguardConfig = getAdguardConfig(this.config)
        window.adguardApi.start(adguardConfig, () => {
            logger.debug('Adguard api started.')

            // load all default and custom rule files
            let promises = adguardConfig.filterUrls.map(url => {
                logger.info(`A default rule file is being loaded: ${url}`)
                return this.loadRulesFromUrl(url, adguardConfig, useCache)
            }).concat(this.config.customSubscription.map((url) => {
                if (this.config.disabledCustomSubs.inArray(url)) {
                    return
                }
                logger.info(`A custom rule file is being loaded: ${url}`)
                return this.loadRulesFromUrl(url, adguardConfig, useCache)
            }))

            Promise.all(promises).then(() => loadRulesCallback(true)).catch(() => loadRulesCallback(false))
        })
    }

    public async refresh(): Promise<boolean> {
        this.config = await coreConfig.get()
        if (!this.config.adblockActivating) {
            if (this.state === EngineState.STARTED) {
                return this.stop()
            } else {
                return true
            }
        }

        if (this.state === EngineState.NOT_STARTED) {
            this.start()
        } else { // started, reconfigure adugard
            window.adguardApi.stop(() => {
                this.startAdguardApi()
            })
        }

        this.state = EngineState.STARTED
        return true
    }

    public stop(): boolean {
        if (this.state !== EngineState.STARTED) {
            return true
        }
        window.adguardApi.stop()
        this.state = EngineState.STOPPED
        return true
    }

    private async loadRulesFromUrl(url: string, adguardConfig: any, useCache: boolean = true): Promise<void> {
        return http.get(url, {cache: useCache}).then((data) => {
                let list = data.split('\n')
                if (list.length <= 1) {
                    list = data.split('\r\n')
                }
                list.forEach((value) => {
                    if (value.indexOf('!') < 0 && value.indexOf('#%#') < 0) {
                        adguardConfig.rules.push(value)
                    }
                })
                window.adguardApi.configure(adguardConfig, () => {
                    logger.debug(`Rules from ${url} configured`)
                })
            }).then(() => {
                store.set('latest_filters_updated_at', Date.now())
            })
    }

    private startTabsBlockCount() {
        chrome.tabs.onCreated.addListener((tab) => {
            tabsBlockCount.set(tab.id, {url: tab.url, count: 0})
        })
        chrome.tabs.onRemoved.addListener((tabId) => {
            tabsBlockCount.delete(tabId)
        })
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (!tabsBlockCount.get(tabId) || tab.url !== tabsBlockCount.get(tabId).url) {
                tabsBlockCount.set(tabId, {url: tab.url, count: 0})
            }
            updateBadgeText(tabId)
        })
        chrome.tabs.onActivated.addListener((activeInfo) => {
            updateBadgeText(activeInfo.tabId)
        })

        window.adguardApi.onRequestBlocked.addListener((details) => {
            const tabRecord = tabsBlockCount.get(details.tabId)
            if (tabRecord) {
                tabRecord.count++
            }
            updateBadgeText(details.tabId)
            statistics.countEvent('adblock')
        })
    }
}

export default AdguardEngine