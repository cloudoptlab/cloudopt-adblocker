import "./index.scss";
import { IBaseHTMLPages } from "../types";
import { logout } from '../../../core/api'
import * as i18n from '../../../core/i18n'
import * as loginState from '../../../core/loginState'
import { renderTemplate } from '../../../core/utils'

interface ISelectOptions {
    icon: string;
    name: string;
    key: TOptionsType;
}

export const optionTypeArr = <const>["safe", "adBlock", "optimization", "auxiliary", "aboutUs"];

export type TOptionsType = typeof optionTypeArr[number];
export type TEventKey = "optionsChange";

const optionLiDefaultClassName = "options";

export default class UserAside implements IBaseHTMLPages {
    private mainDOM = document.createElement("div")
    private userInfoDOM = document.createElement("div")
    private menuDOM = document.createElement("div")
    private eventCbMap: Map<TEventKey, Function> = new Map();

    static ID: string = "userAside";

    constructor() {
        this.mainDOM.id = UserAside.ID
        this.mainDOM.innerHTML = renderTemplate(`
            <div class="container">
                <img class="logo" src="image/logo.svg"></img>
                <div class="user-info"></div>
                <div class="menu"></div>
                <div class="bottom"></div>
            </div>
        `)

        this.initUserInfoDom();
        this.initMenuDom();
        this.initEvents();
    }

    private initUserInfoDom(): void {
        this.userInfoDOM.className = 'user-info'
        this.userInfoDOM.innerHTML = renderTemplate(`
            <div class="thumb">
                <img src="/image/avatar.jpg" alt="" srcset="" />
            </div>
            <span class="name">{{ name }}</span>
            <p class="description">{{ description }}</p>
        `, {
            name: i18n.get('optionsWelcome'),
            description: i18n.get('optionLoginTips')
        })
        i18n.translateComponent(this.userInfoDOM)
        this.mainDOM.querySelector('.user-info').replaceWith(this.userInfoDOM)
        loginState.getLoginData().then((data) => {
            this.userInfoDOM.innerHTML = renderTemplate(`
            <div class="thumb">
                <img src="{{ src }}" alt="" srcset="" />
            </div>
            <span class="name">{{ name }}</span>
            <p class="description">{{ description }}</p>
            `, {
                src: data.head.startsWith('http') ? data.head : `https://cdn.cloudopt.net/image/${data.head}-head`,
                name: data.nickname,
                description: i18n.get('optionLoggedInTips'),
            })

            const logoutDiv = document.createElement('div')
            logoutDiv.className = 'logout'
            logoutDiv.innerHTML = renderTemplate(`<span>{{ text }}</span>`, { text: i18n.get('popupLogout') })
            logoutDiv.addEventListener('click', (ev: MouseEvent) => {
                logout().then(() => {
                    window.location.reload()
                })
            })
            i18n.translateComponent(logoutDiv)
            const bottom = this.mainDOM.querySelector('.bottom')
            const container = this.mainDOM.querySelector('.container')
            container.insertBefore(logoutDiv, bottom)
        }).catch((reason) => {
            // Not logged in
            this.userInfoDOM.addEventListener('click', (ev: MouseEvent) => {
                this.userInfoDOM.querySelector('.name+p.description').setAttribute('i18n', 'optionLoginRefreshTips')
                this.userInfoDOM.querySelector('.name+p.description').innerHTML = renderTemplate('{{ text }}', { text: i18n.get('optionLoginRefreshTips') })
                window.open('https://www.cloudopt.net/account/login', '_blank')
            })
        });
    }

    private initMenuDom(): void {
        this.menuDOM.className = "menu"

        const ulDom = document.createElement("ul");
        ulDom.className = 'menu-container'

        const createLiDom = (data: ISelectOptions) => {
            const { icon, name, key } = data
            const li = document.createElement("li")
            li.className = optionLiDefaultClassName
            li.setAttribute("data-key", key)
            li.innerHTML = renderTemplate(`
                <div class="icon">
                    <img src="image/icon/option/userInfo/{{ icon }}" />
                </div>
                <span class="name">{{ name }}</span>
            `, {
                icon: icon,
                name: name
            })
            return li
        }

        const createSplitLiDom = (name: string) => {
            const li = document.createElement("li")
            li.className = 'other-title'
            const span = document.createElement("span")
            span.innerText = name
            li.appendChild(span)
            return li
        }

        [
            createLiDom({ name: i18n.get('optionsIntelligentSecurity'), icon: "icons-security.svg", key: "safe" }),
            createLiDom({ name: i18n.get('optionsAdblock'), icon: "icons-hand.svg", key: "adBlock" }),
            createLiDom({ name: i18n.get('optionsSpeedup'), icon: "icons-speed.svg", key: "optimization" }),
            createSplitLiDom(i18n.get('optionsOtherSettings')),
            createLiDom({ name: i18n.get('optionsMisc'), icon: "icons-box.svg", key: "auxiliary" }),
            createLiDom({ name: i18n.get('optionsAboutUs'), icon: "icons-link.svg", key: "aboutUs" }),
        ].forEach((li: HTMLLIElement) => {
            ulDom.appendChild(li);
        });

        this.menuDOM.appendChild(ulDom);
        this.mainDOM.querySelector('.menu').replaceWith(this.menuDOM)
    }

    private initEvents(): void {
        this.mainDOM.querySelectorAll('li').forEach(
            (li) => li.addEventListener("click", (event: MouseEvent) => {
                event.stopPropagation();
                const target = event.target as HTMLElement;
                if (target.className.includes(optionLiDefaultClassName)) {
                    const dataSetKey = target.dataset.key as TOptionsType;
                    this.setCurrentCheckOptions(dataSetKey);
                }
            })
        );
    }

    public setCurrentCheckOptions(type: TOptionsType): void {
        const allLi = this.mainDOM.querySelectorAll("li.options");
        Array.from(allLi).forEach(li => {
            li.className = optionLiDefaultClassName;
            const svg = li.getElementsByTagName("img")[0];
            if (svg) svg.src = svg.src.replace("-white", "");
        });

        const checkLi = this.mainDOM.querySelector(`li[data-key=${type}]`);
        if (checkLi) {
            checkLi.classList.add("active");
            const svg = checkLi.getElementsByTagName("img")[0];
            if (svg) svg.src = svg.src.replace(".svg", "") + "-white.svg";
            const cb = this.eventCbMap.get("optionsChange");
            if (cb) cb.call(this, type);
        }
    }

    public addEventListener(key: TEventKey, cb: Function): void {
        this.eventCbMap.set(key, cb);
    }

    public render(): HTMLElement {
        return this.mainDOM
    }
}
