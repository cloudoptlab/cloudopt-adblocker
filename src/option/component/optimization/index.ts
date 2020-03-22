import { createSwitchInfoDom} from "../../common/switchInfo";
import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { Config } from "../../../core/config"
import * as i18n from '../../../core/i18n'
import rtpl from 'art-template/lib/template-web.js'

export default class OptimizationPages implements IBaseHTMLPages {
    private mainDOM = document.createElement("div")
    static ID: string = "optimizationPages";

    constructor() {
        this.mainDOM.id = OptimizationPages.ID
    }

    private renderSwitchInfoComponent(config: Config): HTMLElement[] {
        const getIconPath = (i: string) => `image/icon/option/${i}.svg`;
        const list = [
            {
                title: i18n.get('optionDNSSpeedTitle'),
                key: "dnsSpeed",
                content: i18n.get('optionDNSSpeedContent'),
                icon: getIconPath("icons-dns"),
                on: config.dnsSpeed,
            },
            {
                title: i18n.get('optionWebPrereadingTitle'),
                key: "webPrereading",
                content: i18n.get('optionWebPrereadingContent'),
                icon: getIconPath("icons-in_progress"),
                on: config.webPrereading,
            },
            {
                title: i18n.get('optionMemoryOptimizeTitle'),
                key: "memoryOptimize",
                content: i18n.get('optionMemoryOptimizeContent'),
                icon: getIconPath("icons-smartphone_ram"),
                on: config.memoryOptimize,
            }
        ];
        return list.map(e => createSwitchInfoDom(e).divElement)
    }

    public render(config: Config): HTMLElement {
        this.mainDOM.innerHTML = rtpl.render(`
            <div class="title" i18n="optionOptimizationTitle"> </div>
            <div class="description">
                <p class="content" i18n="optionOptimizationContent"> </p>
                <span class="detaile" i18n="optionOptimizationDetail"> </span>
            </div>
            <div class="switch-info-container">
                <div />
            </div>
        `, null)
        this.mainDOM.querySelector('.switch-info-container').children[0].replaceWith(...this.renderSwitchInfoComponent(config))
        i18n.translateComponent(this.mainDOM)
        return this.mainDOM;
    }
}
