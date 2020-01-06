import { IBaseHTMLPages } from "../types";
import "./index.scss";
import { send as queryBackground } from '../../../core/message'
import * as i18n from '../../../core/i18n'

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
        this.mainDOM.innerHTML = `
            <div class="title">${i18n.get('optionAboutTitle')}</div>
            <div class="description">
                <p class="content">${i18n.get('optionAboutDescriptionContent')}</p>
                <span class="detaile">${i18n.get('optionAboutDescriptionDetail')}</span>
            </div>
            <div class="table-info-container">
                <div class="table-item">
                    <span class="title">${i18n.get('optionAboutStatisticsTitle')}</span>
                    <div class="table">
                        <div class="hard">
                            <span class="text">${i18n.get('optionAboutStatisticsName')}</span>
                        </div>
                        <div class="body-list">
                            <ul>
                                <li>
                                    <div class="left">
                                        <span>${i18n.get('optionAboutVersion')}</span>
                                    </div>
                                    <div class="right">
                                        <span>${chrome.runtime.getManifest().version}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <span>${i18n.get('optionAboutAdBlockCount')}</span>
                                    </div>
                                    <div class="right">
                                        <span>${this.adBlockCount}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <span>${i18n.get('optionAboutSiteBlockCount')}</span>
                                    </div>
                                    <div class="right">
                                        <span>${this.siteBlockCount}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <span>${i18n.get('optionAboutAccelerationCount')}</span>
                                    </div>
                                    <div class="right">
                                        <span>${this.AccelerationCount}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="table-item">
                    <span class="title">${i18n.get('optionAboutContectTitle')}</span>
                    <div class="table">
                        <div class="hard">
                            <span class="text">${i18n.get('optionAboutContectMeans')}</span>
                        </div>
                        <div class="body-list">
                            <ul>
                                <li>
                                    <div class="left">
                                        <a i18n="optionFollowUsWeixin" target="_blank" href="https://mp.weixin.qq.com/s/Z0wEFIZwcZvcPTxNBMXy3w">${i18n.get('optionAboutContectWechat')}</a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <a href="http://shang.qq.com/wpa/qunwpa?idkey=b3fa96d08e24a64e5fac9745b8e7377194271a4d8425ee315e97d3aeb009df35" target="_blank">${i18n.get('optionAboutContectQQ')}</a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <a href="https://m.me/join/AbY0nj0LE7Es8FI8" target="_blank">${i18n.get('optionAboutContectMessager')}</a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <a href="https://twitter.com/CloudoptLab" target="_blank">${i18n.get('optionAboutContectTwitter')}</a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return this.mainDOM;
    }
}
