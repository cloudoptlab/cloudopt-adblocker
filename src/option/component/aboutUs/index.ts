import { IBaseHTMLPages } from "../types";
import "./index.scss";
import { send as queryBackground } from '../../../core/message'

export default class AboutUsPages implements IBaseHTMLPages {
    private mainDOM = document.createElement("div")
    static ID: string = "aboutUsPages";
    private adBlockCount: String = '0'
    private siteBlockCount: String = '0'
    private prerenderCount: String = '0'

    constructor() {
        this.mainDOM.id = AboutUsPages.ID
        this.getCounts()
    }

    private getCounts() {
        Promise.all([
        queryBackground('getEventCount', 'adblock').then((count: String) => { this.adBlockCount = count }),
        queryBackground('getEventCount', 'site-block').then((count: String) => { this.siteBlockCount = count }),
        queryBackground('getEventCount', 'prerender').then((count: String) => { this.prerenderCount = count }),
        ]).then(() => {
            this.render()
        })
    }

    public render(): HTMLElement {
        this.mainDOM.innerHTML = `
            <div class="title">关于我们</div>
            <div class="description">
                <p class="content">我们提供了多种反馈渠道</p>
                <span class="detaile">
                    您可以通过在线聊天、邮箱、推特等方式与我们取得联系。您还可以加入我们的用户群第一时间获取更新信息，还有很多福利等着您。© 2015-2019 Cloudopt®.保留所有版权。
                </span>
            </div>
            <div class="table-info-container">
                <div class="table-item">
                    <span class="title">数据统计</span>
                    <div class="table">
                        <div class="hard">
                            <span class="text">统计名称</span>
                        </div>
                        <div class="body-list">
                            <ul>
                                <li>
                                    <div class="left">
                                        <span>版本信息</span>
                                    </div>
                                    <div class="right">
                                        <span>${chrome.runtime.getManifest().version}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <span>恶意广告和挖矿脚本拦截总数</span>
                                    </div>
                                    <div class="right">
                                        <span>${this.adBlockCount}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <span>恶意网站拦截总数</span>
                                    </div>
                                    <div class="right">
                                        <span>${this.siteBlockCount}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <span>网页加速总数</span>
                                    </div>
                                    <div class="right">
                                        <span>${this.prerenderCount}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="table-item">
                    <span class="title">加入用户小组</span>
                    <div class="table">
                        <div class="hard">
                            <span class="text">社交渠道</span>
                        </div>
                        <div class="body-list">
                            <ul>
                                <li>
                                    <div class="left">
                                        <a i18n="optionFollowUsWeixin" target="_blank" href="https://mp.weixin.qq.com/s/Z0wEFIZwcZvcPTxNBMXy3w">关注微信公众号</a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <a href="http://shang.qq.com/wpa/qunwpa?idkey=b3fa96d08e24a64e5fac9745b8e7377194271a4d8425ee315e97d3aeb009df35" target="_blank">加入QQ用户群</a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <a href="https://m.me/join/AbY0nj0LE7Es8FI8" target="_blank">加入Messager用户群</a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                                <li>
                                    <div class="left">
                                        <a href="https://twitter.com/CloudoptLab" target="_blank">关注Twitter</a>
                                    </div>
                                    <div class="right">
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return this.mainDOM;
    }
}
