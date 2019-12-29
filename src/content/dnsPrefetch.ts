import * as coreConfig from '../core/config'
import * as utils from '../core/utils'
import * as message from '../core/message'
import $ from 'jquery'
import {sanitize} from 'dompurify'

coreConfig.get().then((config) => {
    if (!config.dnsSpeed) {
        return
    }

    const hosts = new Array<string>()
    $('a').each((index, element: HTMLElement) => {
        const href = sanitize($(element).attr('href'))
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
        const tags = hosts.map((host) => {
            const tag = document.createElement('link')
            tag.rel = 'dns-prefetch'
            tag.href = `//${host}`
            return tag
        })
        
        $('head')[0].append(...tags)
        if (!window._cloudopt_accelerated) {
            message.send('countEvent', 'web-accelerate')
            window._cloudopt_accelerated = true
        }
    }
})
