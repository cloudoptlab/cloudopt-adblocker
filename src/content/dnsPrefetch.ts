import * as coreConfig from '../core/config'
import * as utils from '../core/utils'
import $ from 'jquery'
import {sanitize} from 'dompurify'

coreConfig.get().then((config) => {
    if (!config.dnsSpeed) {
        return
    }

    const hosts = new Array<string>()
    $('a').each(() => {
        const href = sanitize($(this).attr('href'))
        if (!href) {
            return
        }

        if (href.startsWith('http') || href.startsWith('https')) {
            const host = utils.getHost(href)
            if (['', ' ', 'javascript'].inArray(host)) {
                return
            }

            if (!hosts.inArray(host)) {
                hosts.push(host)
            }
        }
    })

    if (hosts.length > 0) {
        const tags = hosts.map((host) => `<link rel="dns-prefetch" href="//${host}">`).join('')
        $('head')[0].append(tags)
    }
})
