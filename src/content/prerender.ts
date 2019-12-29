import * as coreConfig from '../core/config'
import * as utils from '../core/utils'
import * as message from '../core/message'
import $ from 'jquery'
import { sanitize } from 'dompurify'

coreConfig.get().then((config) => {
    if (!config.webPrereading) {
        return
    }

    $('a').map((index, domElement: HTMLElement) => {
        const href = sanitize($(domElement).attr('href'))
        if (!href) {
            return
        }

        if (!(href.startsWith('http') || href.startsWith('https'))) {
            return
        }

        const host = utils.getHost(href)
        if (['', ' ', 'javascript'].inArray(host)) {
            return
        }

        let timer: NodeJS.Timeout
        $(domElement).hover(() => {
            timer = setTimeout(() => {
                const linkTag = document.createElement('link')
                linkTag.rel = 'prerender'
                linkTag.href= href
                $('head')[0].append(linkTag)
                if (!window._cloudopt_accelerated) {
                    message.send('countEvent', 'web-accelerate')
                    window._cloudopt_accelerated = true
                }
            }, 2000)
        }, () => {
            window.clearTimeout(timer)
        })
    })
})
