import * as coreConfig from './config'
import * as i18n from './i18n'

function notyFactory(iconUrl: string): (message: string) => void {
    return (message: string) => {
        if (chrome && chrome.notifications) {
            chrome.notifications.create('', {
                type: 'basic',
                title: 'Cloudopt AdBlocker',
                message,
                iconUrl,
            }, (id) => {
                setTimeout(() => { chrome.notifications.clear(id, () => undefined) }, 6000)
            })
        }
    }
}

export function info(message: string) {
    notyFactory('/image/icon/default/icon512.png')(message)
}

export function success(message: string) {
    notyFactory('/image/icon/green/icon512.png')(message)
}

export function error(message: string) {
    notyFactory('/image/icon/red/icon512.png')(message)
}

let isCreateNoty = false
const noRepeatNotyTime = 1000 * 60 * 5
export async function labSafeTipsNoty(type: string) {
    const config = await coreConfig.get()
    if (config.labSafeTips && isCreateNoty === false) {
        switch (type) {
            case 'BANK':
                info(i18n.get('bankSafeTips'))
                break
            case 'SHOP':
                info(i18n.get('shopSafeTips'))
                break
            case 'GAME':
                info(i18n.get('gameSafeTips'))
                break
            case 'HOSPITAL':
                info(i18n.get('hospitalSafeTips'))
                break
            default:
                break
        }
        setTimeout(() => { isCreateNoty = false }, noRepeatNotyTime)
    }
    isCreateNoty = true
}
