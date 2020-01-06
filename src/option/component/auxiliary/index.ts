import { createSwitchInfoDom } from "../../common/switchInfo";
import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { Config } from "../../../core/config"
import * as i18n from '../../../core/i18n'

export default class AuxiliaryPages implements IBaseHTMLPages {
    private mainDOM = document.createElement("div")
    static ID: string = "auxiliaryPages";

    constructor() {
        this.mainDOM.id = AuxiliaryPages.ID
    }

    private renderSwitchInfoComponent(config: Config): HTMLElement[] {
        const createIcon = (i: string) => `image/icon/option/auxiliary/${i}.svg`;
        const list = [
            {
                title: i18n.get('optionBookmarkSearchTitle'),
                key: "labBookmarkSearch",
                content: i18n.get('optionBookmarkSearchContent'),
                icon: createIcon("icons-book"),
                on: config.labBookmarkSearch,
            },
            {
                title: i18n.get('optionDataCollectionTitle'),
                key: "dataCollection",
                content: i18n.get('optionDataCollectionContent'),
                icon: createIcon("icons-bug"),
                on: config.dataCollection,
            }
        ];
        return list.map(e => createSwitchInfoDom(e).divElement)
    }

    public render(config: Config): HTMLElement {
        this.mainDOM.innerHTML = `
            <div class="title">${i18n.get('optionMiscTitle')}</div>
            <div class="description">
                <p class="content">${i18n.get('optionMiscDescriptionContent')}</p>
                <span class="detaile">${i18n.get('optionMiscDescriptionDetail')}</span>
            </div>
            <div class="switch-info-container">
                <div />
            </div>
        `;
        this.mainDOM.querySelector('.switch-info-container').children[0].replaceWith(...this.renderSwitchInfoComponent(config))
        return this.mainDOM;
    }
}
