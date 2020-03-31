import { createSwitchInfoDom } from "../../common/switchInfo";
import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { Config } from "../../../core/config"
import * as i18n from '../../../core/i18n'
import rtpl from 'art-template/lib/template-web.js'

export default class AuxiliaryPages implements IBaseHTMLPages {
    private mainDOM = document.createElement("div")
    static ID: string = "auxiliaryPages";

    constructor() {
        this.mainDOM.id = AuxiliaryPages.ID
    }

    private renderSwitchInfoComponent(config: Config): HTMLElement[] {
        const getIconPath = (i: string) => `image/icon/option/${i}.svg`;
        const list = [
            {
                title: i18n.get('optionBookmarkSearchTitle'),
                key: "labBookmarkSearch",
                content: i18n.get('optionBookmarkSearchContent'),
                icon: getIconPath("icons-book"),
                on: config.labBookmarkSearch,
            },
            {
                title: i18n.get('optionDataCollectionTitle'),
                key: "dataCollection",
                i18n: 'optionDataCollectionContent',
                icon: getIconPath("icons-bug"),
                on: config.dataCollection,
            }
        ];
        return list.map(e => createSwitchInfoDom(e).divElement)
    }

    public render(config: Config): HTMLElement {
        this.mainDOM.innerHTML = rtpl.render(`
            <div class="title" i18n="optionMiscTitle"> </div>
            <div class="description">
                <p class="content" i18n="optionMiscDescriptionContent"> </p>
                <span class="detaile" i18n="optionMiscDescriptionDetail"> </span>
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
