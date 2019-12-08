import * as utils from '../core/utils'
import $ from 'jquery'

$(document).ready(() => {

    try {
        const paramStr = utils.getQueryString('p')
        const paramObj = JSON.parse(decodeURIComponent(atob(paramStr)))

        let favicon
        if (!paramObj.i) {
            favicon = (new URL(paramObj.u)).origin + '/favicon.ico'
        } else if (paramObj.i.startsWith('/')) {
            favicon = (new URL(paramObj.u)).origin + paramObj.i
        } else {
            favicon = paramObj.i
        }

        $('<link />', {
            href: favicon,
            rel: 'shortcut icon',
        }).appendTo('head')

        document.title = $('text[i18n="memoryOptimizedIcon"]').attr('placeholder') + paramObj.t

        $('#return').click(() => {
            window.location.replace(paramObj.u)
        })

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message !== 'wake-up') {
                return
            }

            window.location.replace(paramObj.u)
        })
    } catch (e) {
        // Can't do anything if the params were broken
    }
})
