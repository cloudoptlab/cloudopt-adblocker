import * as store from './store'
import * as utils from './utils'
import * as api from './api'
import * as notification from './notification'
import * as i18n from './i18n'
import * as message from './message'
import * as loginState from './loginState'

export class Config {
    public safeCloud: boolean
    public safeDownload: boolean
    public safeCoin: boolean
    public safePrivacy: boolean
    public safePotential: boolean
    public adblockActivating: boolean
    public adblockDisplay: boolean
    public allowList: string[]
    public blockList: string[]
    public allowListAds: string[]
    public labBookmarkSearch: boolean
    public labSafeTips: boolean
    public labKeyboard: boolean
    public memoryOptimize: boolean
    public dataCollection: boolean
    public dnsSpeed: boolean
    public webPrerendering: boolean
    public customRule: string[]
    public customSubscription: string[]
}

let configObject: Config = {
    safeCloud: true,
    safeDownload: true,
    safeCoin: true,
    safePrivacy: true,
    safePotential: false,
    adblockActivating: false,
    adblockDisplay: true,
    allowList: [],
    blockList: [],
    allowListAds: [],
    labBookmarkSearch: true,
    labSafeTips: true,
    labKeyboard: false,
    memoryOptimize: false,
    dataCollection: true,
    dnsSpeed: true,
    webPrerendering: true,
    customRule: [],
    customSubscription: [],
} as Config

export enum AddListResult {
    SUCCESS,
    DUPLICATED,
    EMPTY_URL,
    WRONG_FORMAT,
}

export function fireAddListErrorNotification(result: AddListResult): void {
    switch (result) {
        case AddListResult.DUPLICATED:
            notification.info(i18n.get('optionTipsDontDuplicate'))
            break
        case AddListResult.EMPTY_URL:
            notification.error(i18n.get('optionTipsInputUrlisNull'))
            break
        case AddListResult.WRONG_FORMAT:
            notification.error(i18n.get('optionTipsInputUrlisError'))
            break
        default:
            break
    }
}

export let country: string = 'us'

export async function set(config: Config): Promise<void> {
    await store.set('config', config)
    await store.set('config_update-time', new Date().getTime())
    saveToCloud()
}

export async function get(): Promise<Config> {
    return await refresh()
}

export async function refresh(): Promise<Config> {
    const config = await store.get('config')
    if (config == null) { // undefined or null
        set(configObject)
        return configObject
    }
    let updated = false
    for (const key in configObject) {
        if (config[key] == null) {
            config[key] = configObject[key]
            updated = true
        }
    }
    if (updated) {
        set(config)
    }
    configObject = config
    return configObject
}

export async function fastAddAllowList(url: string): Promise<AddListResult> {
    if (!url) {
        return AddListResult.EMPTY_URL
    } else if (!utils.URL_REGEX.test(url)) {
        return AddListResult.WRONG_FORMAT
    } else if (configObject.allowList.some((item) => item === url)) {
        return AddListResult.DUPLICATED
    }

    configObject.allowList.push(utils.getHost(url))
    set(configObject).then(() => {
        message.send('refresh-config')
    })
    return AddListResult.SUCCESS
}

export async function fastAddAllowListAds(url: string) {
    if (!url) {
        return AddListResult.EMPTY_URL
    } else if (!utils.URL_REGEX.test(url)) {
        return AddListResult.WRONG_FORMAT
    } else if (configObject.allowListAds.some((item) => item === url)) {
        return AddListResult.DUPLICATED
    }

    configObject.allowListAds.push(utils.getHost(url))
    set(configObject).then(() => {
        message.send('refresh-config')
    })
    return AddListResult.SUCCESS
}

export async function fastAddBlockList(url: string) {
    if (!url) {
        return AddListResult.EMPTY_URL
    } else if (!utils.URL_REGEX.test(url)) {
        return AddListResult.WRONG_FORMAT
    } else if (configObject.blockList.some((item) => item === url)) {
        return AddListResult.DUPLICATED
    }

    configObject.blockList.push(utils.getHost(url))
    set(configObject).then(() => {
        message.send('refresh-config')
    })
    return AddListResult.SUCCESS
}

async function saveToCloud() {
    if (!loginState.loggedIn()) {
        return
    }
    api.saveConfig(configObject).catch((rej) => {
        if (rej && rej.error !== 401) {
            notification.error(i18n.get('updateConfigFailure'))
        }
    })
}

export function loadFromCloud(): Promise<void> {
    if (!loginState.loggedIn()) {
        return
    }
    return api.downloadConfig().then(async (res) => {
        const localUpdateTime = new Date(await store.get('config_update-time')).getTime()
        if (new Date(res.result.update).getTime() > localUpdateTime) {
            const resConfig = res.result.config
            Object.keys(resConfig).map((key) => {
                if (configObject.hasOwnProperty(key)) {
                    configObject[key] = resConfig[key]
                }
            })
        }
        message.send('refresh-config')
    }).catch((rej) => {
        /* tslint:disable:triple-equals */
        if (rej.error == 404) {
            saveToCloud()
        }
        /* tslint:enable:triple-equals */
    })
}
