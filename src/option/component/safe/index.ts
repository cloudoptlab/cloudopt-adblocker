import { createSwitchInfoDom } from "../../common/switchInfo";
import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { Config, get as getCoreConfig } from "../../../core/config"
import { connectionCount } from "../../../core/api"

export default class SafePages implements IBaseHTMLPages {
    private mainDOM = document.createElement("div");
    static ID: string = "safePages";
    private connected: boolean = false
    private connectionCount: string = "???" 

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
                title: "网页保护",
                key: "safeCloud",
                content: "实时拦截危险网站，保护您不受钓鱼、恶意网址的威胁。",
                icon: this.createIcon("icons-chrome"),
                on: config.safeCloud,
            },
            {
                title: "下载保护",
                key: "safeDownload",
                content: "自动阻止从危险网站上的下载，避免恶意网站自动下载。",
                icon: this.createIcon("icons-download"),
                on: config.safeDownload,
            },
            {
                title: "隐私保护",
                key: "safePrivacy",
                content: "有效阻止分析网站对您的网络活动进行跟踪或记录。",
                icon: this.createIcon("icons-user_shield"),
                on: config.safePrivacy,
            },
            {
                title: "严格模式",
                key: "safePotential",
                content: "开启后同时会拦截不受欢迎的网站、信誉评估较低的网站。",
                icon: this.createIcon("icons-warning_shield"),
                on: config.safePotential,
            },
            {
                title: "挖矿脚本拦截",
                key: "safeCoin",
                content: "帮助您避免电脑被恶意网站用于挖矿（比特币）。",
                icon: this.createIcon("icons-coins"),
                on: config.safeCoin,
            },
            {
                title: "安全提示",
                key: "labSafeTips",
                content: "在访问银行、电商等容易被冒充的网站时弹出安全提示。",
                icon: this.createIcon("icons-filled_topic"),
                on: config.labSafeTips,
            },
        ];
        return list.map(e => createSwitchInfoDom(e).divElement)
    }

    public async render(): Promise<HTMLElement> {
        const config = await getCoreConfig()
        this.mainDOM.innerHTML = `
            <div class="title" i18n="optionsIntelligentSecurity">智能安全</div>
            <div class="description">
                <p class="content">连接全球用户的安全网络</p>
                <span class="detaile">
                    Cloudopt<sup>&reg;</sup>
                    云安全网络是一个基于基于信誉评估机制的威胁分析系统，它连接着世界各地的用户，实时地保护着您网页安全。Cloudopt<sup>&reg;</sup>
                    AI 能够 7x24 小时不间断地实时分析网络威胁。
                </span>
                <a class="link-info" href="https://cloudopt.net/" target="_blank">
                    <img src="/image/icon/option/right.svg" alt="" srcset="" />
                    了解详细信息请点击访问官方网站。
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
                        <span class="title">全球连接用户</span>
                    </div>
                    <div class="right-column">
                        <span class="count">${this.connectionCount}</span>
                        <span class="people">人数</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="connect-status">
                        <img src="${this.connected ? this.createIcon('icons-checkmark') : this.createIcon('icons-sad_cloud')}" alt="" srcset="" />
                        <span class="text ${this.connected ? "connected" : "disconnected"}">${this.connected ? "连接成功" : "无法连接到云安全中心，请检查您的网络后重试。"}</span>
                    </div>
                    <span>近24小时中受保护用户数</span>
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
