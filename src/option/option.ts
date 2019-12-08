import UserAside, { TOptionsType } from './component/userAside'
import RouterManager from './routerManager'

import '../../css/reset.css'
import './option.scss'

class OptionsManager {
    private static ID: string = 'option-container'
    private userAside: UserAside = new UserAside()
    private routerManager: RouterManager = new RouterManager()
    private currentRouterType: TOptionsType = 'safe'

    constructor() {
        this.init()
    }

    private init(): void {
        const main = document.createElement('div')
        main.id = OptionsManager.ID

        // 渲染左侧用户组件
        main.appendChild(this.userAside.render())
        // 渲染右侧路由组件
        main.appendChild(this.routerManager.render())

        // 默认显示智能安全
        this.userAside.setCurrentCheckOptions('safe')
        this.routerManager.renderByType('safe')

        document.body.appendChild(main)

        this.userAside.addEventListener('optionsChange', (type: TOptionsType) => {
            this.routerManager.renderByType(type)
            this.currentRouterType = type
        })
    }
}

export default new OptionsManager()
