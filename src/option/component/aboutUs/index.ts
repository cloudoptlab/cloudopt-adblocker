import { IBaseHTMLPages } from "../types";
import "./index.scss";
import message from '../../../core/message'
import * as i18n from '../../../core/i18n'
import { renderTemplate } from '../../../core/utils'

const queryBackground = message.send

export default class AboutUsPages implements IBaseHTMLPages {
    private mainDOM = document.createElement("div")
    static ID: string = "aboutUsPages";
    private adBlockCount: String = '0'
    private siteBlockCount: String = '0'
    private AccelerationCount: String = '0'

    constructor() {
        this.mainDOM.id = AboutUsPages.ID
        this.getCounts()
    }

    private getCounts() {
        Promise.all([
            queryBackground('getEventCount', 'adblock').then((count: String) => { this.adBlockCount = count }),
            queryBackground('getEventCount', 'site-block').then((count: String) => { this.siteBlockCount = count }),
            queryBackground('getEventCount', 'web-accelerate').then((count: String) => { this.AccelerationCount = count }),
        ]).then(() => {
            this.render()
        })
    }

    public render(): HTMLElement {
        this.mainDOM.innerHTML = renderTemplate(`
            <div class="title" i18n="optionAboutTitle"> </div>
            <div class="description">
                <p class="content" i18n="optionAboutDescriptionContent"> </p>
                <span class="detaile" i18n="optionAboutDescriptionDetail"> </span>
            </div>
            <div class="table-info-container">
                <div class="table-item">
                    <span class="title" i18n="optionAboutStatisticsTitle"> </span>
                    <div class="table">
                        <div class="hard">
                            <span class="text" i18n="optionAboutStatisticsName"> </span>
                        </div>
                        <div class="body-list">
                            <ul class="scroll-auto">
                                <li>
                                    <div class="left">
                                        <span i18n="optionAboutVersion"> </span>
                                    </div>
                                    <div class="right">
                                        <span>{{ version }}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <span i18n="optionAboutAdBlockCount"> </span>
                                    </div>
                                    <div class="right">
                                        <span>{{ adBlockCount }}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <span i18n="optionAboutSiteBlockCount"> </span>
                                    </div>
                                    <div class="right">
                                        <span>{{ siteBlockCount }}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <span i18n="optionAboutAccelerationCount"> </span>
                                    </div>
                                    <div class="right">
                                        <span>{{ AccelerationCount }}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="table-item">
                    <span class="title" i18n="optionAboutContectTitle"> </span>
                    <div class="table">
                        <div class="hard">
                            <span class="text" i18n="optionAboutContectMeans"> </span>
                        </div>
                        <div class="body-list">
                            <ul>
                                <li>
                                    <div class="left">
                                        <a target="_blank" href="https://mp.weixin.qq.com/s/Z0wEFIZwcZvcPTxNBMXy3w" i18n="optionAboutContectWechat"> </a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <a href="http://shang.qq.com/wpa/qunwpa?idkey=b3fa96d08e24a64e5fac9745b8e7377194271a4d8425ee315e97d3aeb009df35" target="_blank" i18n="optionAboutContectQQ"> </a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <a href="https://m.me/join/AbY0nj0LE7Es8FI8" target="_blank" i18n="optionAboutContectMessager"> </a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <a href="https://twitter.com/CloudoptLab" target="_blank" i18n="optionAboutContectTwitter"> </a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `, {
            version: chrome.runtime.getManifest().version,
            adBlockCount: this.adBlockCount,
            siteBlockCount: this.siteBlockCount,
            AccelerationCount: this.AccelerationCount,
        })
        i18n.translateComponent(this.mainDOM)
        return this.mainDOM;
    }
}
