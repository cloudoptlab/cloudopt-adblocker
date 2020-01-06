import { createSwitchInfoDom } from "../../common/switchInfo";
import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { Config, get as getCoreConfig } from "../../../core/config"
import { connectionCount } from "../../../core/api"
import * as i18n from "../../../core/i18n"

export default class SafePages implements IBaseHTMLPages {
    private mainDOM = document.createElement("div");
    static ID: string = "safePages";
    private connected: boolean = false
    private connectionCount: string = '' 

    constructor() {
        this.mainDOM.id = SafePages.ID
        this.updateConnectStatus()
    }

    private updateConnectStatus() {
        connectionCount().then((result) =>{
            this.connected = true
            this.connectionCount = Number(result.result).toLocaleString()
            this.render()
        })
    }

    private createIcon = (i: string) => `image/icon/option/safe/${i}.svg`;
    private renderSwitchInfoComponent(config: Config): HTMLElement[] {
        const list = [
            {
                title: i18n.get('optionSafeCloudTitle'),
                key: "safeCloud",
                content: i18n.get('optionSafeCloudContent'),
                icon: this.createIcon("icons-chrome"),
                on: config.safeCloud,
            },
            {
                title: i18n.get('optionSafeDownloadTitle'),
                key: "safeDownload",
                content: i18n.get('optionSafeDownloadContent'),
                icon: this.createIcon("icons-download"),
                on: config.safeDownload,
            },
            {
                title: i18n.get('optionSafePrivacyTitle'),
                key: "safePrivacy",
                content: i18n.get('optionSafePrivacyContent'),
                icon: this.createIcon("icons-user_shield"),
                on: config.safePrivacy,
            },
            {
                title: i18n.get('optionSafePotentialTitle'),
                key: "safePotential",
                content: i18n.get('optionSafePotentialContent'),
                icon: this.createIcon("icons-warning_shield"),
                on: config.safePotential,
            },
            {
                title: i18n.get('optionSafeCoinTitle'),
                key: "safeCoin",
                content: i18n.get('optionSafeCoinContent'),
                icon: this.createIcon("icons-coins"),
                on: config.safeCoin,
            },
            {
                title: i18n.get('optionSafeTipsTitle'),
                key: "labSafeTips",
                content: i18n.get('optionSafeTipsContent'),
                icon: this.createIcon("icons-filled_topic"),
                on: config.labSafeTips,
            },
        ];
        return list.map(e => createSwitchInfoDom(e).divElement)
    }

    public async render(): Promise<HTMLElement> {
        const config = await getCoreConfig()
        this.mainDOM.innerHTML = `
            <div class="title" i18n="optionsIntelligentSecurity">${i18n.get('optionsIntelligentSecurity')}</div>
            <div class="description">
                <p class="content">${i18n.get('optionSafeContent')}</p>
                <span class="detaile">${i18n.get('optionSafeDetail')}</span>
                <a class="link-info" href="https://cloudopt.net/" target="_blank">
                    <img src="/image/icon/option/right.svg" alt="" srcset="" />
                    ${i18n.get('optionSafeOfficalLink')}
                </a>
            </div>
            <div class="card">
                <div class="card-head">
                    <div class="left-column">
                        <div class="icon-info">
                            <span class="ring-block">
                                <img src="/image/icon/option/safe/icons-cloud_connection.svg" alt="" srcset="" />
                            </span>
                        </div>
                        <span class="title">${i18n.get('optionSafeUsersConnect')}</span>
                    </div>
                    <div class="right-column">
                        <span class="count">${this.connectionCount}</span>
                        <span class="people">${i18n.get('optionsSafeConnections')}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="connect-status">
                        <img src="${this.connected ? this.createIcon('icons-checkmark') : this.createIcon('icons-sad_cloud')}" alt="" srcset="" />
                        <span class="text ${this.connected ? "connected" : "disconnected"}">${this.connected ? i18n.get('optionsSafeConnectionSuccess') : i18n.get('optionsSafeConnectionFail')}</span>
                    </div>
                    <span>${i18n.get('optionsSafeConnectionsIn24Hours')}</span>
                </div>
            </div>
            <div class="switch-info-container">
                <div />
            </div>
        `;
        this.mainDOM.querySelector('.switch-info-container').children[0].replaceWith(...this.renderSwitchInfoComponent(config))
        return this.mainDOM;
    }
}
