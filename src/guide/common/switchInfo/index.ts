import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css";
import "./index.scss";
import { get as getCoreConfig, set as setCoreConfig } from '../../../core/config'
import message from '../../../core/message'
import rtpl from 'art-template/lib/template-web.js'

export interface ISwitchInfo {
    icon: string;
    title: string;
    content?: string;
    key: string;
    on: boolean;
    i18n?: string;
}

export class SwitchInfo {
    public divElement: HTMLDivElement
    constructor(private options: ISwitchInfo) {
        this.divElement = document.createElement('div')
        this.init();
    }

    private init(): void {
        this.divElement.className = "switch-item"
        this.divElement.innerHTML = rtpl.render(`
            <div class="left">
                {{ if icon }}
                    <div class="icon"><img src="{{ icon }}" /></div>
                {{ /if }}
                <div class="description">
                    <span class="title">{{ title }}</span>
                    <span class="content" {{ if i18n }} i18n="{{ i18n }}" {{ /if }}>{{ content || ' ' }}</span>
                </div>
            </div>
            <div class="right" key="{{ key }}">
                <div class="custom-control custom-toggle my-2">
                    <input
                        type="checkbox"
                        id="{{ key }}"
                        name="{{ key }}"
                        class="custom-control-input"
                        {{on ? "checked" : ""}}
                    />
                    <label class="custom-control-label" for="{{ key }}"></label>
                </div>
            </div>
        `, this.options)
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
}
