import * as message from './message'
import * as tabOp from '../core/tab'
import * as grade from '../core/grade'
import * as config from '../core/config'
import * as store from '../core/store'
import * as logger from '../core/logger'
import * as utils from '../core/utils'
import { geoIp } from '../core/api'
import adguardEngine from './adguardEngine'

async function activateEvent() {
    const activate = await store.get('activate')
    const today = new Date().getDate()
    if (activate === today) {
        return
    }
    utils.sendGA('Daily Activate Units')
    store.set('activate', today)
}

export async function start() {
    config.loadFromCloud()

    message.addListener({
        type: 'open-tab',
        callback: (msg, sender, sendResponse) => {
            tabOp.open(msg.text)
            sendResponse('')
        },
    })

    message.addListener({
        type: 'grade-website',
        callback: async (msg, sender, sendResponse) => {
            sendResponse(await grade.website(msg.text))
        },
    })

    let location = await store.get('location')
    if (location == null) {
        try {
            const result = await geoIp()
            location = result.result.countryCode.toLowerCase()
            store.set('location', location)
        } catch (error) {
            location = 'us'
        }
        logger.debug(`Init Cloudopt core , you location is ${location} (by online)`)
    } else {
        logger.debug(`Init Cloudopt core , you location is ${location} (by cache)`)
    }

    activateEvent()

    config.get().then((cfg) => {
        if (cfg.adblockActivating) {
            adguardEngine.start()
        }
    })
}

start()
