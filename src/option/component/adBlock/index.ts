import { createSwitchInfoDom } from "../../common/switchInfo";
import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { Config, get as getCoreConfig, set as setCoreConfig } from "../../../core/config"
import * as store from '../../../core/store'
import * as i18n from '../../../core/i18n'
import * as notification from '../../../core/notification'
import * as utils from '../../../core/utils'
import * as http from '../../../core/http'
import * as message from '../../../core/message'

export default class AdBlockPages implements IBaseHTMLPages {
    private mainDOM = document.createElement("div")
    static ID: string = "adBlockPages"
    private lastUpdatedString: string = ''

    constructor() {
        this.mainDOM.id = AdBlockPages.ID
        this.generateLastUpdatedString()
    }

    private async generateLastUpdatedString(): Promise<void> {
        let timestamp = await store.get('latest_filters_updated_at')
        timestamp = parseInt(timestamp)
        if (!!timestamp) {
            this.lastUpdatedString = `${i18n.get('optionFiltersLastUpdatedAt')} ${(new Date(timestamp)).toLocaleString()}${i18n.get('optionFiltersLastUpdatedAt1')}`
        } else {
            this.lastUpdatedString = i18n.get('filterNotUpdated')
        }
    }

    private createIcon = (i: string) => `image/icon/option/adBlock/${i}.svg`

    private renderSwitchInfoComponent(config: Config): HTMLElement[] {
        const list = [
            {
                title: "广告拦截",
                key: "adblockActivating",
                content: "智能根据您的实际情况，阻止网页上的广告、恶意的弹窗。",
                icon: this.createIcon("icons-hand"),
                on: config.adblockActivating,
            },
            {
                title: "显示数量",
                key: "adblockDisplay",
                content: "在浏览器扩展图标上显示已拦截广告的数量。",
                icon: this.createIcon("icons-statistics"),
                on: config.adblockDisplay,
            },
        ];
        return list.map(e => createSwitchInfoDom(e).divElement);
    }

    private renderRuleListBodyComponent(rules: string[]) {
        return rules.map((rule) => (
            `
            <li>
                <div class="left">
                    <span>${rule}</span>
                </div>
                <div class="right" for="${rule}">
                    <div class="delete-icon">
                        <img
                            src="${this.createIcon('icons-delete_trash')}"
                        />
                    </div>
                </div>
            </li>
            `
        )).join('')
    }

    public async render(): Promise<HTMLElement> {
        const config = await getCoreConfig()
        this.mainDOM.innerHTML = `
            <div class="title">广告拦截</div>
            <div class="description">
                <p class="content">拦截恶意广告及弹窗</p>
                <span class="detaile">
                    Cloudopt® AdBlocker
                    可以阻止弹出广告，更快加载网页，您还可以订阅自己喜欢的广告拦截规则列表或是在网页上进行手动拦截。
                </span>
                <a class="link-info" id="lastUpdatedAt">
                    ${this.lastUpdatedString}
                </a>
            </div>
            <div class="switch-info-container">
                <div></div>
            </div>
            <div class="table-info-container">
                <div class="table-item">
                    <span class="title">自定义订阅规则列表</span>
                    <img class="add-item" src="${this.createIcon('icons-add')}" data-toggle="modal" data-target="#modalAddCustomSubscription"/>
                    <div class="table" id="customSubscriptionTable">
                        <div class="hard">
                            <span class="text">订阅地址</span>
                        </div>
                        <div class="body-list">
                            <ul>
                                ${this.renderRuleListBodyComponent(config.customSubscription)}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="table-item">
                    <span class="title">手动拦截元素列表</span>
                    <div class="table" id="customRuleTable">
                        <div class="hard">
                            <span class="text">元素选择器</span>
                        </div>
                        <div class="body-list">
                            <ul>
                                ${this.renderRuleListBodyComponent(config.customRule)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="modalAddCustomSubscription" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalTitle">添加自定义订阅规则</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <input type="text" id="inputCustomSubscribeUrl" class="form-control">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal" id="buttonCloseCustomSubscription">Close</button>
                            <button type="button" class="btn btn-primary" id="buttonAddCustomSubscription">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        `
        this.mainDOM.querySelector('.switch-info-container').children[0].replaceWith(...this.renderSwitchInfoComponent(config))

        this.mainDOM.querySelector('#buttonAddCustomSubscription').addEventListener('click', async (ev: MouseEvent) => {
            const inputElement = this.mainDOM.querySelector('#inputCustomSubscribeUrl') as HTMLInputElement
            let inputValue = inputElement.value
            if (!utils.URL_REGEX.test(inputValue)) {
                notification.error(i18n.get('urlErrorTips'))
                return
            }
            if (!inputValue.startsWith('http')) {
                inputValue = `http://${inputValue}`
            }
            const config = await getCoreConfig()
            if (config.customSubscription.indexOf(inputValue) > -1) {
                notification.error(i18n.get('optionTipsDontDuplicate'))
                return
            }
            try {
                await http.get(inputValue, {
                    timeout: 30000,
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
                })
                config.customSubscription.push(inputValue)
                await setCoreConfig(config)
                message.send('refresh-config')
                notification.success(i18n.get('optionTipsAddCustomRuleSuccess'))
                inputElement.value = ''
                this.mainDOM.querySelector('#buttonCloseCustomSubscription')['click']()
                this.render()
            } catch(response) {
                notification.error(i18n.get('optionTipsAddCustomRuleFailure'))
            }
        })

        this.mainDOM.querySelectorAll('#customSubscriptionTable .right').forEach((el) => {
            el.addEventListener("click", async (ev: MouseEvent) => {
                ev.stopPropagation()
                const subsLink = el.getAttribute('for')
                const newConfig = await getCoreConfig()
                newConfig.customSubscription = newConfig.customSubscription.removeByValue(subsLink)
                setCoreConfig(newConfig)
                this.render()
            })
        })

        this.mainDOM.querySelectorAll('#customRuleTable .right').forEach((el) => {
            el.addEventListener("click", async (ev: MouseEvent) => {
                ev.stopPropagation()
                const rule = el.getAttribute('for')
                const newConfig = await getCoreConfig()
                newConfig.customRule = newConfig.customRule.removeByValue(rule)
                setCoreConfig(newConfig)
            })
        })

        const lastUpdatedAtElement = this.mainDOM.querySelector('#lastUpdatedAt')
        lastUpdatedAtElement.addEventListener('click', (ev: MouseEvent) => {
            lastUpdatedAtElement.innerHTML = '正在更新……'
            message.send('check-filters-update').then((result) => {
                if (result === 'true') {
                    lastUpdatedAtElement.innerHTML = '广告拦截规则库更新成功！点击可再次更新。'
                    setTimeout(async () => {
                        await this.generateLastUpdatedString()
                        lastUpdatedAtElement.innerHTML = this.lastUpdatedString
                    }, 2000);
                } else {
                    lastUpdatedAtElement.innerHTML = '广告拦截规则库更新失败，请检查网络连接后，再次点击尝试更新。'
                }
            })
        })
        return this.mainDOM;
    }
}
