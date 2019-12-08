import './guide.scss'
import { createSwitchInfoDom } from './common/switchInfo'
import { get as getCoreConfig } from '../core/config'

export class GuideManager {

    private mainDOM = document.createElement("div");
    static ID: string = "guidePages";

    constructor() {
        this.mainDOM.id = GuideManager.ID;
        this.mainDOM.innerHTML = `
            <div class="container">
                <span class="title">CLOUDOPT</span>
                <div class="content-block" id="contentBlock">
                    <div class="header"></div>
                    <div class="body"></div>
                    <div class="footer"></div>
                </div>
            </div>
        `
        document.querySelector('body').appendChild(this.mainDOM)
        window.addEventListener('hashchange', this.route.bind(this))
        this.route()
    }

    private route() {
        switch (window.location.hash) {
            case '#step2':
                this.step2()
                break
            case '#step3':
                this.step3()
                break
            case '#step4':
                this.step4()
                break
            case '#step5':
                this.step5()
                break
            case '#step6':
                this.step6()
                break
            default:
                this.step1()
                break
        }
    }

    private setHeader(headerElement: HTMLElement) {
        this.mainDOM.querySelector('#contentBlock .header').innerHTML = ''
        this.mainDOM.querySelector('#contentBlock .header').appendChild(headerElement)
    }

    private setFooter(footerElement: HTMLElement) {
        this.mainDOM.querySelector('#contentBlock .footer').innerHTML = ''
        this.mainDOM.querySelector('#contentBlock .footer').appendChild(footerElement)
    }

    private setBody(bodyElement: HTMLElement) {
        this.mainDOM.querySelector('#contentBlock .body').innerHTML = ''
        this.mainDOM.querySelector('#contentBlock .body').appendChild(bodyElement)
    }

    private step1() {
        const header = document.createElement('img')
        header.src = 'image/icon/option/guide/undraw_airport_2581@2x.png'
        header.width = 250
        header.height = 213
        this.setHeader(header)

        const body = document.createElement("div")
        body.innerHTML = `
            <h3>欢迎使用 Cloudopt AdBlocker</h3>
            <span class="text">
                Cloudopt AdBlocker 可以实时保护您的安全、防止追迹、恶意域名，过滤
                横幅广告、弹窗广告以及视频广告。我们将引导您进行初步的设置。
            </span>
        `
        this.setBody(body)

        const button = document.createElement('button')
        button.className = 'btn btn-primary'
        button.innerHTML = '下一步'
        button.addEventListener("click", (ev: MouseEvent) => {
            window.location.hash = '#step2'
        })
        this.setFooter(button)
    }

    private async step2() {
        const config = await getCoreConfig()

        const header = document.createElement('img')
        header.src = 'image/icon/option/guide/undraw_privacy_protection_nlwy@2x.png'
        header.width = 250
        header.height = 225
        this.setHeader(header)

        const body = document.createElement("div")
        const switchElement = createSwitchInfoDom({
            icon: '',
            title: '网页保护',
            content: '实时拦截危险网站，保护您不受钓鱼、恶意网址的威胁。',
            key: 'safeCloud',
            on: config.safeCloud,
        }).divElement
        body.innerHTML = '<h3>保护您不受恶意网站的威胁</h3>'
        body.appendChild(switchElement)
        this.setBody(body)

        const button = document.createElement('button')
        button.className = 'btn btn-primary'
        button.innerHTML = '下一步'
        button.addEventListener("click", (ev: MouseEvent) => {
            window.location.hash = '#step3'
        })
        this.setFooter(button)
    }

    private async step3() {
        const config = await getCoreConfig()

        const header = document.createElement('img')
        header.src = 'image/icon/option/guide/undraw_heatmap_uyye@2x.png'
        header.width = 277
        header.height = 159
        this.setHeader(header)

        const body = document.createElement("div")
        const switchElement = createSwitchInfoDom({
            icon: '',
            title: '广告拦截',
            content: '有效加速页面载入、节省带宽、屏蔽恶意广告和弹窗。',
            key: 'adblockActivating',
            on: config.adblockActivating
        }).divElement
        body.innerHTML = '<h3>拦截恶意广告及烦人弹窗</h3>'
        body.appendChild(switchElement)
        this.setBody(body)

        const button = document.createElement('button')
        button.className = 'btn btn-primary'
        button.innerHTML = '下一步'
        button.addEventListener("click", (ev: MouseEvent) => {
            window.location.hash = '#step4'
        })
        this.setFooter(button)
    }

    private async step4() {
        const config = await getCoreConfig()

        const header = document.createElement('img')
        header.src = 'image/icon/option/guide/undraw_fingerprint_swrc@2x.png'
        header.width = 250
        header.height = 220
        this.setHeader(header)

        const body = document.createElement("div")
        const switchElement = createSwitchInfoDom({
            icon: '',
            title: '隐私保护',
            content: '阻止网站、广告公司等追踪您浏览行为，保护您的隐私。',
            key: 'safePrivacy',
            on: config.safePrivacy
        }).divElement
        body.innerHTML = '<h3>保护您的隐私安全不受窥探</h3>'
        body.appendChild(switchElement)
        this.setBody(body)

        const button = document.createElement('button')
        button.className = 'btn btn-primary'
        button.innerHTML = '下一步'
        button.addEventListener("click", (ev: MouseEvent) => {
            window.location.hash = '#step5'
        })
        this.setFooter(button)
    }

    private async step5() {
        const config = await getCoreConfig()

        const header = document.createElement('img')
        header.src = 'image/icon/option/guide/undraw_to_the_moon_v1mv@2x.png'
        header.width = 250
        header.height = 202
        this.setHeader(header)

        const body = document.createElement("div")
        const switchElement = createSwitchInfoDom({
            icon: '',
            title: '用户体验改进计划',
            content: "为了更好的给您提供服务，将允许向Cloudopt提供一些技术信息及交互数据。<a href='https://www.cloudopt.net/policy/privacy' target='_blank'>隐私声明</a>",
            key: 'dataCollection',
            on: config.dataCollection
        }).divElement
        body.innerHTML = '<h3>加入用户体验改进计划</h3>'
        body.appendChild(switchElement)
        this.setBody(body)

        const button = document.createElement('button')
        button.className = 'btn btn-primary'
        button.innerHTML = '下一步'
        button.addEventListener("click", (ev: MouseEvent) => {
            window.location.hash = '#step6'
        })
        this.setFooter(button)
    }

    private step6() {
        const header = document.createElement('img')
        header.src = 'image/icon/option/guide/undraw_having_fun_iais@2x.png'
        header.width = 289
        header.height = 182
        this.setHeader(header)

        const body = document.createElement("div")
        body.innerHTML = `
            <h3>祝贺您！完成初步设置</h3>
            <span class="text">
                您已经完成基本的设置，您还可以随时在浏览器的右上角找到我们修改设置。
                您还可以登录您的 Cloudopt 账户或者直接关闭本页面。
            </span>
        `
        this.setBody(body)

        const button = document.createElement('button')
        button.className = 'btn btn-primary'
        button.innerHTML = '登录'
        button.addEventListener("click", (ev: MouseEvent) => {
            window.location.href = 'https://www.cloudopt.net/account/login'
        })
        this.setFooter(button)
    }
}

export default new GuideManager()
