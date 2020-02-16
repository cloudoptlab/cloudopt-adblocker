import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css";
import "./index.scss";
import { get as getCoreConfig, set as setCoreConfig } from '../../../core/config'
import * as message from '../../../core/message'

export interface ISwitchInfo {
    icon: string;
    title: string;
    content: string;
    key: string;
    on: boolean;
}

export class SwitchInfo {
    public divElement: HTMLDivElement
    constructor(private options: ISwitchInfo) {
        this.divElement = document.createElement('div')
        this.init();
    }

    private init(): void {
        this.divElement.className = "switch-item";
        this.divElement.innerHTML = `
            <div class="left">
                ${
                    this.options.icon 
                    ? `<div class="icon"><img src=${this.options.icon} /></div>`   
                    : ''
                }
                <div class="description">
                    <span class="title">${this.options.title}</span>
                    <span class="content">${this.options.content}</span>
                </div>
            </div>
            <div class="right" key="${this.options.key}">
                <div class="custom-control custom-toggle my-2">
                    <input
                        type="checkbox"
                        id="${this.options.key}"
                        name="${this.options.key}"
                        class="custom-control-input"
                        ${this.options.on ? "checked" : ""}
                    />
                    <label class="custom-control-label" for="${this.options.key}"></label>
                </div>
            </div>
        `;
        this.divElement.querySelector('.right').addEventListener('click', async (ev: MouseEvent) => {
            this.options.on = !this.options.on
            const newConfig = await getCoreConfig()
            newConfig[this.options.key] = this.options.on
            setCoreConfig(newConfig).then(() => { message.send('refresh-config') })
        })
    }
}

export const createSwitchInfoDom = (options: ISwitchInfo): SwitchInfo => {
    return new SwitchInfo(options);
};
