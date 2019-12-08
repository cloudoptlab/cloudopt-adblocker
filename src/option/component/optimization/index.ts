import { createSwitchInfoDom} from "../../common/switchInfo";
import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { Config } from "../../../core/config"

export default class OptimizationPages implements IBaseHTMLPages {
    private mainDOM = document.createElement("div")
    static ID: string = "optimizationPages";

    constructor() {
        this.mainDOM.id = OptimizationPages.ID
    }

    private renderSwitchInfoComponent(config: Config): HTMLElement[] {
        const createIcon = (i: string) => `image/icon/option/optimization/${i}.svg`;
        const list = [
            {
                title: "DNS预加载",
                key: "dnsSpeed",
                content: "提前对可能会访问的网站进行DNS解析，加速连接网站的速度。",
                icon: createIcon("icons-dns"),
                on: config.dnsSpeed,
            },
            {
                title: "网页预加载",
                key: "webPrereading",
                content: "提前加载可能会访问的页面，提高网页打开速度。",
                icon: createIcon("icons-in_progress"),
                on: config.webPrereading,
            },
            {
                title: "内存优化",
                key: "memoryOptimize",
                content: "内存占用高于 80% 时，自动对长时间不访问的标签页进行内存优化。",
                icon: createIcon("icons-smartphone_ram"),
                on: config.memoryOptimize,
            }
        ];
        return list.map(e => createSwitchInfoDom(e).divElement)
    }

    public render(config: Config): HTMLElement {
        this.mainDOM.innerHTML = `
            <div class="title">优化加速</div>
            <div class="description">
                <p class="content">加速您的网页访问，提升用户体验</p>
                <span class="detaile">
                    Cloudopt® Speed 技术可以利用浏览器的一些特性帮助您更快加载网页，提升您的网页访问速度。
                    还可以帮助您减少浏览器的资源占用。
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
