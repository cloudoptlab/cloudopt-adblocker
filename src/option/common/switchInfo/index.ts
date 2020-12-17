import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css";
import "./index.scss";
import { get as getCoreConfig, set as setCoreConfig } from '../../../core/config'
import message from '../../../core/message'
import { renderTemplate } from '../../../core/utils'

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
        this.divElement.className = "switch-item";
        let data = this.options
        if(data.on){
            data["checked"] = "checked"
        }else{
            data["checked"] = ""
        }
        this.divElement.innerHTML = renderTemplate(`
            <div class="left">
                <div class="icon"><img src="{{ icon }}" /></div>
                <div class="description">
                    <span class="title">{{ title }}</span>
                    <span class="content" i18n="{{ i18n }}">{{ content }}</span>
                </div>
            </div>
            <div class="right" key="{{ key }}">
                <div class="custom-control custom-toggle my-2">
                    <input
                        type="checkbox"
                        id="{{ key }}"
                        name="{{ key }}"
                        class="custom-control-input"
                        {{ checked }}
                    />
                    <label class="custom-control-label" for="{{ key }}"></label>
                </div>
            </div>
        `, this.options)
        this.divElement.querySelector('.right input').addEventListener('click', async (ev: MouseEvent) => {
            this.options.on = !this.options.on
            const newConfig = await getCoreConfig()
            newConfig[this.options.key] = this.options.on
            setCoreConfig(newConfig).then(() => message.send('refresh-config'))
        })
    }
}

export const createSwitchInfoDom = (options: ISwitchInfo): SwitchInfo => {
    return new SwitchInfo(options);
};
