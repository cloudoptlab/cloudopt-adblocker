import SafePages from './component/safe'
import AdBlockPages from './component/adBlock'
import OptimizationPages from './component/optimization'
import AuxiliaryPages from './component/auxiliary'
import AboutUsPages from './component/aboutUs'
import { TOptionsType } from './component/userAside'
import { IBaseHTMLPages } from './component/types'
import { get as getCoreConfig, set as setCoreConfig } from '../core/config'
import rtpl from 'art-template/lib/template-web.js'

export default class RouterManager {
    private static ID: string = 'routerAside'
    private safePages: SafePages = new SafePages()
    private adBlockPages: AdBlockPages = new AdBlockPages()
    private optimizationPages: OptimizationPages = new OptimizationPages()
    private auxiliaryPages: AuxiliaryPages = new AuxiliaryPages()
    private aboutUsPages: AboutUsPages = new AboutUsPages()
    private mainDOM = document.createElement('div')

    constructor() {
        this.mainDOM.id = RouterManager.ID
        this.mainDOM.innerHTML = rtpl.render('<div />')
    }

    public async renderByType(type: TOptionsType): Promise<void> {
        const config = await getCoreConfig()
        const map: { [key in typeof type]: IBaseHTMLPages } = {
            safe: this.safePages,
            adBlock: this.adBlockPages,
            optimization: this.optimizationPages,
            auxiliary: this.auxiliaryPages,
            aboutUs: this.aboutUsPages,
        }

        this.mainDOM.children[0].replaceWith(await map[type].render(config))
    }

    public render(): HTMLElement {
        return this.mainDOM
    }
}
