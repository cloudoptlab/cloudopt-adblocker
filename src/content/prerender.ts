import * as coreConfig from '../core/config'
import * as utils from '../core/utils'
import * as message from '../core/message'
import $ from 'jquery'
import { sanitize } from 'dompurify'

coreConfig.get().then((config) => {
    if (!config.webPrereading) {
        return
    }

    $('a').map(() => {
        const href = sanitize($(this).attr('href'))
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
        $(this).hover(() => {
            timer = setTimeout(() => {
                const linkTag = `<link rel="prerender" href="${href}" />`
                $('head')[0].append(linkTag)
                message.send('countEvent', 'prerender')
            }, 2000)
        }, () => {
            window.clearTimeout(timer)
        })
    })
})
