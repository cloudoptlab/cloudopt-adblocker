import { createSwitchInfoDom } from "../../common/switchInfo";
import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { Config } from "../../../core/config"

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
                title: "书签搜索",
                key: "labBookmarkSearch",
                content: "您在搜索引擎搜索时自动帮助您检索书签并嵌入搜索结果中。",
                icon: createIcon("icons-book"),
                on: config.labBookmarkSearch,
            },
            {
                title: "用户体验改进计划",
                key: "dataCollection",
                content: "为了更好的给您提供服务，将允许向Cloudopt提供一些技术信息及交互数据。<a href='https://www.cloudopt.net/policy/privacy' target='_blank'>隐私声明</a>",
                icon: createIcon("icons-bug"),
                on: config.dataCollection,
            }
        ];
        return list.map(e => createSwitchInfoDom(e).divElement)
    }

    public render(config: Config): HTMLElement {
        this.mainDOM.innerHTML = `
            <div class="title">辅助功能</div>
            <div class="description">
                <p class="content">提供一些额外的设置</p>
                <span class="detaile">
                    Cloudopt® AdBlocker还将给您提供一些强大好用的辅助功能，来提升您在浏览网页过程中的用户体验。如果您有想要的功能也可以随时发送邮件到 support@cloudopt.net。
                </span>
            </div>
            <div class="switch-info-container">
                <div />
            </div>
        `;
        this.mainDOM.querySelector('.switch-info-container').children[0].replaceWith(...this.renderSwitchInfoComponent(config))
        return this.mainDOM;
    }
}
