import * as utils from '../core/utils'
import * as store from '../core/store'
import * as i18n from '../core/i18n'
import * as tab from '../core/tab'
import * as coreConfig from '../core/config'
import Push from 'push.js'
import $ from 'jquery'

async function checkUpdated() {
    const currentVersion = utils.getVersion()
    let beforeVersion = (await store.get('version')) as string|null
    if (beforeVersion == null) {
        beforeVersion = '0.0.0'
    }
    if (currentVersion === beforeVersion) {
        return
    }
    Push.create(i18n.get('updateTipsTitle'), {
        body: `${i18n.get('updateTips1')}${utils.getVersion()}${i18n.get('updateTips2')}`,
        icon: '/image/icon/default/icon128.png',
        timeout: 10000,
    })
    utils.sendGA('Update Version')
    store.set('version', utils.getVersion())
    $.getJSON('https://cdn.cloudopt.net/extensions/update/updates.json', (data) => {
        try {
            if (utils.language() === 'zh-CN') {
                tab.open(data[utils.getVersion()].cn)
            } else {
                tab.open(data[utils.getVersion()].us)
            }
        } catch (error) {
            /* nothing here */
        }
    })
    const config = await coreConfig.get()
    const intBeforeVersion = parseInt(beforeVersion.replace(/[&\|\\\*^%$#@\-,.，。\s]/g, '').substring(0, 3), 10)
    if (intBeforeVersion < 110) {
        config.customRule = []
        coreConfig.set(config)
    }
    if (intBeforeVersion < 122) {
        config.safePotential = false
        coreConfig.set(config)
    }
    Push.create(i18n.get('adblockInitTitle'), {
        body: i18n.get('adblockInitTips'),
        icon: '/image/icon/default/icon128.png',
        timeout: 10000,
    })
}

checkUpdated()
