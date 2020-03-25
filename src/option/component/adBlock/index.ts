import { createSwitchInfoDom } from "../../common/switchInfo";
import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { Config, get as getCoreConfig, set as setCoreConfig } from "../../../core/config"
import * as store from '../../../core/store'
import * as i18n from '../../../core/i18n'
import * as notification from '../../../core/notification'
import * as utils from '../../../core/utils'
import * as http from '../../../core/http'
import message from '../../../core/message'
import rtpl from 'art-template/lib/template-web.js'

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

    private getIconPath = (i: string) => `image/icon/option/${i}.svg`

    private renderSwitchInfoComponent(config: Config): HTMLElement[] {
        const list = [
            {
                title: i18n.get('optionAdblockActivatingTitle'),
                key: "adblockActivating",
                content: i18n.get('optionAdblockActivatingContent'),
                icon: this.getIconPath("icons-hand"),
                on: config.adblockActivating,
            },
            {
                title: i18n.get('optionAdblockDisplayTitle'),
                key: "adblockDisplay",
                content: i18n.get('optionAdblockDisplayContent'),
                icon: this.getIconPath("icons-statistics"),
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
                            src="${this.getIconPath('icons-delete_trash')}"
                        />
                    </div>
                </div>
            </li>
            `
        )).join('')
    }

    private renderSubscribeListBodyComponent(config: Config) {
        return config.customSubscription.map((rule) => (
            `
            <li>
                <div class="left" for="${rule}">
                    <img class="rule-icon" src="${config.disabledCustomSubs.inArray(rule) ? this.getIconPath('icons-unchecked_thick') : this.getIconPath('icons-checked_thick')}">
                    <span>${rule}</span>
                </div>
                <div class="right" for="${rule}">
                    <div class="delete-icon">
                        <img
                            src="${this.getIconPath('icons-delete_trash')}"
                        />
                    </div>
                </div>
            </li>
            `
        )).join('')
    }

    public async render(): Promise<HTMLElement> {
        const config = await getCoreConfig()
        this.mainDOM.innerHTML = rtpl.render(`
            <div class="title" i18n="optionAdblockTitle"> </div>
            <div class="description">
                <p class="content" i18n="optionAdblockDescriptionContent"> </p>
                <span class="detaile" i18n="optionAdblockDescriptionDetail"> </span>
                <a class="link-info" id="lastUpdatedAt">
                    {{ lastUpdatedString }}
                </a>
            </div>
            <div class="switch-info-container">
                <div></div>
            </div>
            <div class="table-info-container">
                <div class="table-item">
                    <span class="title" i18n="optionAdblockCustomSubsTitle"> </span>
                    <img class="add-item" src="${this.getIconPath('icons-add')}" data-toggle="modal" data-target="#modalAddCustomSubscription"/>
                    <div class="table" id="customSubscriptionTable">
                        <div class="hard">
                            <span class="text" i18n="optionAdblockCustomSubsAddresses"> </span>
                        </div>
                        <div class="body-list">
                            <ul>
                                ${this.renderSubscribeListBodyComponent(config)}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="table-item">
                    <span class="title" i18n="optionAdblockManualTitle"> </span>
                    <div class="table" id="customRuleTable">
                        <div class="hard">
                            <span class="text" i18n="optionAdblockManualSelectors"> </span>
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
                            <h5 class="modal-title" id="modalTitle" i18n="modalAddCustomSubscriptionTitle"> </h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <input type="text" id="inputCustomSubscribeUrl" class="form-control">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal" id="buttonCloseCustomSubscription" i18n="buttonCloseCustomSubscription"> </button>
                            <button type="button" class="btn btn-primary" id="buttonAddCustomSubscription" i18n="buttonAddCustomSubscription"> </button>
                        </div>
                    </div>
                </div>
            </div>
        `, {
            lastUpdatedString: this.lastUpdatedString,
        })
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

        this.mainDOM.querySelectorAll('#customSubscriptionTable .left').forEach((el) => {
            el.addEventListener("click", async (ev: MouseEvent) => {
                ev.stopPropagation()
                const subsLink = el.getAttribute('for')
                const newConfig = await getCoreConfig()
                if (newConfig.disabledCustomSubs.inArray(subsLink)) {
                    newConfig.disabledCustomSubs = newConfig.disabledCustomSubs.removeByValue(subsLink)
                } else {
                    newConfig.disabledCustomSubs.push(subsLink)
                }
                setCoreConfig(newConfig)
                this.render()
            })
        })

        this.mainDOM.querySelectorAll('#customSubscriptionTable .right').forEach((el) => {
            el.addEventListener("click", async (ev: MouseEvent) => {
                ev.stopPropagation()
                const subsLink = el.getAttribute('for')
                const newConfig = await getCoreConfig()
                newConfig.customSubscription = newConfig.customSubscription.removeByValue(subsLink)
                newConfig.disabledCustomSubs = newConfig.disabledCustomSubs.removeByValue(subsLink)
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
                this.render()
            })
        })

        const lastUpdatedAtElement = this.mainDOM.querySelector('#lastUpdatedAt')
        lastUpdatedAtElement.addEventListener('click', (ev: MouseEvent) => {
            lastUpdatedAtElement.innerHTML = rtpl.render('{{ text }}', { text: i18n.get('ruleListUpdating') })
            message.send('check-filters-update').then((result) => {
                if (result === 'true') {
                    lastUpdatedAtElement.innerHTML = rtpl.render('{{ text }}', { text: i18n.get('ruleListUpdateSuccess') })
                    setTimeout(async () => {
                        await this.generateLastUpdatedString()
                        lastUpdatedAtElement.innerHTML = rtpl.render(this.lastUpdatedString, null)
                    }, 2000);
                } else {
                    lastUpdatedAtElement.innerHTML = rtpl.render('{{ text }}', { text: i18n.get('ruleListUpdateFail') })
                }
            })
        })
        i18n.translateComponent(this.mainDOM)
        return this.mainDOM;
    }
}
