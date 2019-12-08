import * as coreConfig from '../core/config'
import * as utils from '../core/utils'
import * as message from '../core/message'
import { open as openTab } from '../core/tab'
import { debug as debugLog } from '../core/logger'
import { website as gradeWebsite } from '../core/grade'
import { translateCurrentPage } from '../core/i18n'
import DataSet from '@antv/data-set'
import G2 from '@antv/g2'
import $ from 'jquery'
import './popup.scss'

class G2Model {
    private container: string
    private axis: number[] = []

    constructor(container: string) {
        this.container = container

        const now = Date.now()
        let startOfDay = now - (now % 86400000);
        for (let i = 0; i < 7; i++) {
            this.axis.unshift(startOfDay)
            startOfDay = startOfDay - 86400000
        }
    }

    public renderAxis(): string {
        return `<ul>
        ${this.axis.map((time) => {
            let day = (new Date(time)).getDate()
            return `<li>${day < 10 ? '0' + day : day}</li>`
        }).join('')}
            </ul>`
    }

    public async renderChart() {
        const adblockName = '广告拦截'
        const siteBlockName = '恶意网站拦截'
        const adblockCountsInDays = utils.deserializeMapNumNum(await message.send('getAdblockCountsInDays'))
        const siteBlockCountsInDays = utils.deserializeMapNumNum(await message.send('getSiteBlockCountsInDays'))
        const data = this.axis.map((time) => {
            const adblockCount = adblockCountsInDays.has(time) ? adblockCountsInDays.get(time) : 0
            const siteBlockCount = siteBlockCountsInDays.has(time) ? siteBlockCountsInDays.get(time) : 0
            const obj = {
                day: (new Date(time)).getDate(),
            }
            obj[adblockName] = adblockCount
            obj[siteBlockName] = siteBlockCount
            return obj
        })

        const dv = new DataSet.View().source(data)
        dv.transform({
            type: 'fold',
            fields: [adblockName, siteBlockName],
            key: 'type',
            value: 'value',
        })
        const chart = new G2.Chart({
            container: this.container,
            width: 413,
            height: 350,
            legend: false,
        } as Partial<G2.ChartProps>)
        chart.axis('day', {
            tickLine: null,
            label: null,
            line: null,
        })
        chart.source(dv, {
            day: {
                type: 'linear',
                formatter: (val) => {
                    return val < 10 ? '0' + val : val
                },
                range: [0.04, 0.96],
            },
        })
        chart.tooltip({
            crosshairs: true,
        } as G2.HtmlTooltipConfig)
        chart.area().position('day*value').color('#f3f8fd').tooltip(null).shape('smooth')
        chart.line().position('day*value').color('type', (value) => {
            if (value === adblockName) {
                return '#2993F9'
            } else if (value === siteBlockName) {
                return '#68D0B5'
            }
            return '#68D0B5'
        }).size(1).shape('smooth')
        chart.render()
    }
}

async function currentActiveTab(): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve)
    }).then((tabArray: chrome.tabs.Tab[]) => tabArray.last())
}

function toggleSwitch(id: string, b?: boolean) {
    if (b === null) {
        $(id).prop('checked', !$(id).prop('checked'))
    } else {
        $(id).prop('checked', b)
    }
}

async function initialize() {
    const config = await coreConfig.get()
    const url = (await currentActiveTab()).url
    const host = utils.getHost(url)
    const isSystemPage = !utils.URL_REGEX.test(url)

    if (utils.getUa() === 'firefox') {
        $('.popup .mdl-list__item-avatar.material-icons').css('padding-top', '6px')
    }

    const g2Model = new G2Model('g2mountNode')
    $('.time-range').html(g2Model.renderAxis())
    g2Model.renderChart()

    $('#moreSet').click(() => {
        openTab('option.html')
    })

    utils.sendGA('Open Popup Page')

    if (isSystemPage) {
        console.log('中文国际化需要修改')
        $('#safeProtect input').prop('disabled', true).prop('checked', true)
        $('#safeProtect .sub-title').text('安全防护在此页面无需启动')
        $('#adsIntercept input').prop('disabled', true).prop('checked', true)
        $('#adsIntercept .sub-title').text('广告拦截在此页面无需启动')
        $('#credibilityScore .sub-title').text('此页面无需评分')
        $('#manualIntercept .sub-title').text('广告拦截在此页面无需启动')
        return
    }

    $('#safeProtect').click(async (event) => {
        if (event.target.tagName === 'LABEL' || event.target.tagName === 'INPUT') {
            // For the wired event
            return
        }
        $('#safeProtect input').click()
    })
    $('#safeProtect input').click(async () => {
        Promise.all([currentActiveTab(), coreConfig.get()]).then(async ([curTab, curConf]) => {
            const curHost = utils.getHost(curTab.url)
            if (curConf.allowList.some((u) => u === curHost)) {
                curConf.allowList = curConf.allowList.removeByValue(curHost)
                await coreConfig.set(curConf)
                // toggleSwitch('#safeProtect-label', true)
                message.send('refresh-config')
            } else {
                coreConfig.fastAddAllowList(curTab.url).then((result) => {
                    switch (result) {
                        case coreConfig.AddListResult.DUPLICATED:
                        case coreConfig.AddListResult.SUCCESS:
                            // toggleSwitch('#safeProtect-label', false)
                            break
                    }
                })
            }
        })
    })

    $('#adsIntercept').click(async (event) => {
        if (event.target.tagName === 'LABEL' || event.target.tagName === 'INPUT') {
            // For the wired event
            return
        }
        $('#adsIntercept input').click()
    })
    $('#adsIntercept input').click(async () => {
        Promise.all([currentActiveTab(), coreConfig.get()]).then(async ([curTab, curConf]) => {
            const curHost = utils.getHost(curTab.url)
            if (curConf.allowListAds.some((u) => u === curHost)) {
                curConf.allowListAds = curConf.allowListAds.removeByValue(curHost)
                await coreConfig.set(curConf)
                // toggleSwitch('#adsIntercept-label', true)
                message.send('refresh-config')
            } else {
                coreConfig.fastAddAllowListAds(curTab.url).then((result) => {
                    if (result === coreConfig.AddListResult.SUCCESS) {
                        // toggleSwitch('#adsIntercept-label', false)
                    } else {
                        coreConfig.fireAddListErrorNotification(result)
                    }
                })
            }
        })
    })

    $('#credibilityScore').click(async () => {
        const tab = await currentActiveTab()
        if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
            openTab(`https://www.cloudopt.net/report/${utils.getHost(tab.url)}`)
        }
    })

    $('#manualIntercept').click(async () => {
        const tab = await currentActiveTab()
        debugLog(`Opening Assistant UI for tab id=${tab.id}url=${tab.url}`)
        const backgroundPage = chrome.extension.getBackgroundPage()
        const adguardApi = backgroundPage.adguardApi
        adguardApi.openAssistant(tab.id)
        window.close()
    })

    let contains = config.allowList.some((u) => u === host)
    toggleSwitch('#safeProtect-label', !contains)
    contains = config.allowListAds.some((u) => u === host)
    toggleSwitch('#adsIntercept-label', !contains)

    gradeWebsite(url).then((result) => {
        const countNode = $('#credibilityScore .score-count')
        countNode.text(result.score)

        if (result.score === 0 && result.isSafe) {
            countNode.text('?')
        } else if (result.score < 60) {
            // $('.mdl-layout__header').css('background-color', '#e53935')
        }
    })
}

$.ready.then(() => {
    initialize()
    translateCurrentPage()
})
