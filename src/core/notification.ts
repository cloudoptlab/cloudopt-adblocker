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

let suppressBankNoty = false
let suppressShopNoty = false
let suppressGameNoty = false
let suppressHospitalNoty = false

const noRepeatNotyTime = 1000 * 60 * 5
export async function labSafeTipsNoty(type: string) {
    const config = await coreConfig.get()
    if (!config.labSafeTips) {
        return
    }

    switch (type) {
        case 'BANK':
            if (!suppressBankNoty) {
                info(i18n.get('bankSafeTips'))
                suppressBankNoty = true
                setTimeout(() => {
                    suppressBankNoty = false
                }, noRepeatNotyTime);
            }
            break
        case 'SHOP':
            if (!suppressShopNoty) {
                info(i18n.get('shopSafeTips'))
                suppressShopNoty = true
                setTimeout(() => {
                    suppressShopNoty = false
                }, noRepeatNotyTime);
            }
            break
        case 'GAME':
            if (!suppressGameNoty) {
                info(i18n.get('gameSafeTips'))
                suppressGameNoty = true
                setTimeout(() => {
                    suppressGameNoty = false
                }, noRepeatNotyTime);
            }
            break
        case 'HOSPITAL':
            if (!suppressHospitalNoty) {
                info(i18n.get('hospitalSafeTips'))
                suppressHospitalNoty = true
                setTimeout(() => {
                    suppressHospitalNoty = false
                }, noRepeatNotyTime);
            }
            break
    }
}
