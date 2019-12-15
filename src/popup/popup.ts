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
    private data: Array<{day: number, [propName: string]: number}> = []
    private adblockName: string
    private prerenderName: string

    constructor(container: string) {
        this.container = container

        this.adblockName = '广告拦截'
        this.prerenderName = '网页加速'
    }

    private async initalize(): Promise<void> {
        const adblockCountsInDays = utils.deserializeMapNumNum(await message.send('getAdblockCountsInDays'))
        const prerenderCountsInDays = utils.deserializeMapNumNum(await message.send('getAccelerationCountsInDays'))

        const now = Date.now()
        const today = now - (now % 86400000)
        let day = today - 518400000; // 00:00 of six days ago

        let emptyStarting = true
        for (let i = 0; i < 7; i++) {
            let adblockCount = adblockCountsInDays.get(day)
            let prerenderCount = prerenderCountsInDays.get(day)
            if (isNaN(adblockCount)) {
                adblockCount = 0
            }
            if (isNaN(prerenderCount)) {
                prerenderCount = 0
            }
            if (adblockCount || prerenderCount || !emptyStarting) {
                this.data.push({
                    day,
                    [this.adblockName]: adblockCount,
                    [this.prerenderName]: prerenderCount,
                })
                emptyStarting = false
            }
            day += 86400000
        }
        if (this.data.length < 7) {
            if (this.data[0]) {
                this.data.unshift({
                    day: this.data[0].day - 86400000,
                    [this.adblockName]: 0,
                    [this.prerenderName]: 0,
                })
            } else {
                this.data.push({
                    day: today - 86400000, // yesterday
                    [this.adblockName]: 0,
                    [this.prerenderName]: 0,
                }, {
                    day: today, // today
                    [this.adblockName]: 0,
                    [this.prerenderName]: 0,
                })
                day = today + 86400000
            }
        }
        for (let i = this.data.length; i < 7; i++) {
            this.data.push({
                day,
            })
            day += 86400000
        }
    }

    public async renderAxis(): Promise<void> {
        if (!this.data.length) {
            await this.initalize()
        }
        const html = `<ul>
        ${this.data.map((data) => {
            let day = (new Date(data.day)).getDate()
            return `<li>${day < 10 ? '0' + day : day}</li>`
        }).join('')}
            </ul>`

        $('.time-range').html(html)
    }

    public async renderChart() {
        if (!this.data.length) {
            await this.initalize()
        }
        const dv = new DataSet.View().source(this.data)
        dv.transform({
            type: 'fold',
            fields: [this.adblockName, this.prerenderName],
            key: 'type',
            value: 'value',
        })
        const chart = new G2.Chart({
            container: this.container,
            width: 293,
            height: 240,
            legend: false,
            padding: 2,
        } as Partial<G2.ChartProps>)
        chart.axis('day', {
            tickLine: null,
            label: null,
            line: null,
        })
        chart.source(dv, {
            day: {
                type: 'time',
                formatter: (val) => {
                    let date = (new Date(val)).getDate()
                    return val < 10 ? '0' + date : date
                },
            },
        })
        chart.tooltip({
            crosshairs: true,
        } as G2.HtmlTooltipConfig)
        chart.area().position('day*value').color('#f3f8fd').tooltip(null).shape('smooth')
        chart.line().position('day*value').color('type', (value) => {
            if (value === this.adblockName) {
                return '#68D0B5'
            } else if (value === this.prerenderName) {
                return '#2993F9'
            }
            return '#2993F9'
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
    const isSystemPage = !/^((https|http|ftp|rtsp|mms):\/\/)/.test(url)

    if (utils.getUa() === 'firefox') {
        $('.popup .mdl-list__item-avatar.material-icons').css('padding-top', '6px')
    }

    $('#moreSet').click(() => {
        openTab('option.html')
    })

    utils.sendGA('Open Popup Page')

    if (isSystemPage) {
        console.log('中文国际化需要修改')
        $('#safeProtect input').prop('disabled', true).prop('checked', true)
        $('#adsIntercept input').prop('disabled', true).prop('checked', true)
        $('#credibilityScore .sub-title').text('此页面无需评分')
        $('#g2mountNode').replaceWith('<img src="image/icon/popup/undraw_heatmap_uyye.png" class="system-page cover">')
        const html = `
            <div style="text-align: center;" class="system-page">
                <div class="title">无法在该页面生效</div>
                <div class="content">这个页面可能是浏览器自带页面，我们仍然在实时保护着您。</div>
            </div>`
        $('.chart-bottom-custom-container').replaceWith(html)
        return
    }

    const g2Model = new G2Model('g2mountNode')
    g2Model.renderAxis()
    g2Model.renderChart()

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
