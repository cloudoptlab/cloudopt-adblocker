import * as coreConfig from '../core/config'
import * as utils from '../core/utils'
import * as message from '../core/message'
import $ from 'jquery'

const href = $('.block-page a>.block-pre').parent().attr('href')
$('.block-page a>.block-pre').parent().attr('href', '#')
$('.block-page a>.block-pre').parent().click(async () => {
    const config = await coreConfig.get()
    const hrefHost = utils.getHost(href)
    if (config.allowList.indexOf(hrefHost) < 0) {
        config.allowList.push(hrefHost)
        config.blockList.removeByValue(hrefHost)
        coreConfig.set(config).then(() => {
            location.href = href
        })
    } else {
            location.href = href
    }
})

const url = $('.block-button').parent().attr('href')
$('.block-button').parent().attr('href', '#')
$('.block-button').parent().attr('target', '')
$('.block-button').parent().click(() => {
    message.send('open-tab', url)
})
