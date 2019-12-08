import * as message from '../core/message'
import * as coreConfig from '../core/config'
import * as utils from '../core/utils'
import * as logger from '../core/logger'
import * as grade from '../core/grade'

coreConfig.get().then((config) => {
    if (!config.safeCloud) {
        return
    }

    message.send('grade-website', window.location.href).then((result: grade.Result) => {
        if (result.safe) {
            return
        }
        message.send('countEvent', 'site-block')
        window.location.href = `https://www.cloudopt.net/block/${encodeURIComponent(utils.getHost(window.location.href))}`
    }).catch((reason) => {
        logger.error(reason)
    })
})
