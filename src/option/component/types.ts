import { Config } from '../../core/config'

export interface IBaseHTMLPages {
    render(config: Config): HTMLElement | Promise<HTMLElement>;
}
