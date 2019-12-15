import * as coreConfig from '../../core/config'
import * as utils from '../../core/utils'
import * as logger from '../../core/logger'
import * as http from '../../core/http'
import * as store from '../../core/store'
import * as message from '../message'
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

function getAdguardConfig(config: coreConfig.Config): any {
    const allowList = config.allowListAds.slice()
    allowList.push('*.cloudopt.net')
    let filters = [101]
    if (config.safePrivacy) {
        filters.push(3)
    }
    switch (utils.language()) {
        case 'zh-CN':
            filters.push(104)
            break
        case 'zh-TW':
            filters.push(104)
            break
        case 'ru':
            filters.push(1)
            break
        case 'ja':
            filters.push(7)
            break
        case 'de':
            filters.push(6)
            break
        case 'fr':
            filters.push(16)
            break
        case 'nl':
            filters.push(8)
            break
        case 'et':
            filters.push(9)
            break
        case 'tr':
            filters.push(13)
            break
        case 'ko':
            filters.push(227)
            break
    }
    if (!config.adblockActivating) {
        filters = []
    }
    if (config.safeCoin) {
        filters.push(242)
    }
    if (config.safeCloud) {
        filters.push(208)
        filters.push(210)
    }
    logger.debug(`Adblock filter list: ${filters}`)
    return {
        filters,
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
            fileName = '/allowlist/cn.json'
            break
    }
    if (fileName) {
        const config = await coreConfig.get()
        $.getJSON(fileName, (data) => {
            $.each(data, (index, obj) => {
                config.allowListAds.push(obj.host)
            })
            coreConfig.set(config).then(() => message.send('refresh-config'))
        })
    }
}

class AdguardEngine implements IAdblockEngine {
    public name: string = 'adguard'
    private tabsBlockCount: Map<number, TabRecord> = new Map<number, TabRecord>()
    private config: coreConfig.Config
    private state: EngineState = EngineState.NOT_STARTED

    public start(): boolean {
        if (this.state === EngineState.STARTED) {
            return true
        } else if (this.state === EngineState.NOT_STARTED) {
            message.addListener({
                type: 'assistant-create-rule',
                async callback(msg) {
                    this.config = await coreConfig.get()
                    this.config.customRule.push(msg.ruleText)
                    await coreConfig.set(this.config)
                    this.refresh()
                },
            })

            message.addListener({
                type: 'refresh-config',
                callback: () => {
                    this.refresh()
                },
            })

            message.addListener({
                type: 'check-filters-update',
                callback(msg, sender, sendResponse) {
                    window.adguardApi.checkFiltersUpdates(() => {
                        store.set('latest_filters_updated_at', Date.now())
                        sendResponse('true')
                    }, () => {
                        sendResponse('false')
                    })
                },
            })

            this.startTabsBlockCount()
        }

        window.adguardApi.onFilterDownloadSuccess.addListener(() => {
            store.set('latest_filters_updated_at', Date.now())
        })

        store.get('firstAutoAddAllowList').then((isFirst) => {
            if (!isFirst) {
                autoAddallowListAds()
                store.set('firstAutoAddAllowList', 'true')
            }
        })

        this.state = EngineState.STARTED
        this.refresh()
        return true
    }

    public async refresh(): Promise<boolean> {
        this.config = await coreConfig.get()
        if (!this.config.adblockActivating && this.state === EngineState.STARTED) {
            return this.stop()
        }
        if (this.state === EngineState.NOT_STARTED) {
            return this.start()
        }
        window.adguardApi.stop()
        const adguardConfig = getAdguardConfig(this.config)
        if (adguardConfig.filters.length > 0) {
            window.adguardApi.start(adguardConfig, () => {
                logger.debug('Adguard api started.')
                window.adguardApi.configure(adguardConfig, () => {
                    logger.debug('Adguard re-configurationed.')
                    this.customSubscription()
                })
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

    private updateBadgeText(tabId: number): void {
        if (this.config && this.config.adblockActivating && this.config.adblockDisplay) {
            try {
                chrome.browserAction.setBadgeText({
                    text: this.tabsBlockCount.get(tabId).count.toString(),
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

    private customSubscription(): void {
        const adguardConfig = getAdguardConfig(this.config)
        this.config.customSubscription.forEach((url) => {
            logger.info(`A custom rule file is being loaded: ${url}`)
            http.get(url).then((data) => {
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
                    logger.debug(`Custom rules from ${url} configured`)
                })
                store.set('latest_filters_updated_at', Date.now())
            })
        })
    }

    private startTabsBlockCount() {
        chrome.tabs.onCreated.addListener((tab) => {
            this.tabsBlockCount.set(tab.id, {url: tab.url, count: 0})
        })
        chrome.tabs.onRemoved.addListener((tabId) => {
            this.tabsBlockCount.delete(tabId)
        })
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (!this.tabsBlockCount.get(tabId) || tab.url !== this.tabsBlockCount.get(tabId).url) {
                this.tabsBlockCount.set(tabId, {url: tab.url, count: 0})
            }
            this.updateBadgeText(tabId)
        })
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.updateBadgeText(activeInfo.tabId)
        })

        window.adguardApi.onRequestBlocked.addListener((details) => {
            const tabRecord = this.tabsBlockCount.get(details.tabId)
            if (tabRecord) {
                tabRecord.count++
            }
            this.updateBadgeText(details.tabId)
            statistics.countEvent('adblock')
        })
    }
}

export default AdguardEngine
