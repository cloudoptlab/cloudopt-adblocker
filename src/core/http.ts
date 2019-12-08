import $ from 'jquery'
import * as logger from './logger'

class RequestObject {
    private options = {
        url: '',
        /** Whether to allow browser caching */
        cache: true,
        /** What type of content is sent to the server */
        contentType: 'application/json;charset=UTF-8',
        /** parameter */
        data: {},
        /** 'GET' | ''POST' | 'PUT' */
        method: 'GET',
    }
    constructor(options: object) {
        this.options = Object.assign(this.options, options)
    }

    public exec(isResolveError: boolean = true): Promise<any> {
        return this.getAjaxRequest(isResolveError)
    }

    private handleHttpErrorStatus(response: {error: number}) {
        const status = response.error
        switch (status) {
            /** No permission */
            case 401:
                // todo...
                break
            /** access denied */
            case 403:
                // todo...
                break
            /** No resources */
            case 404:
                // todo...
                break
            default: break
        }
    }

    private getAjaxRequest(isResolveError: boolean): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await $.ajax(this.options)
                resolve(result)
            } catch (error) {
                let response: {error: number}
                if (error && error.status && error.status >= 400 && error.status < 500 && (typeof error.responseText === 'string') && error.responseText.startsWith('{')) {
                    response = JSON.parse(error.responseText)
                } else if (error && error.status !== 200) {
                    response = {
                        error: error.status,
                    }
                }
                if (isResolveError && response && response.error) {
                    this.handleHttpErrorStatus(response)
                }
                reject(response)
                logger.debug(`Ajax request to ${this.options.url} error: ${JSON.stringify(error)}`)
            }
        })
    }
}

export function get(url: string, options: object = {}): Promise<any> {
    return new RequestObject({
        url,
        method: 'GET',
        ...options,
    }).exec()
}

export function put(url: string, options: object = {}): Promise<any> {
    return new RequestObject({
        url,
        method: 'PUT',
        ...options,
    }).exec()
}

export function post(url: string, options: object = {}): Promise<any> {
    return new RequestObject({
        url,
        method: 'POST',
        ...options,
    }).exec()
}

export function del(url: string, options: object = {}): Promise<any> {
    return new RequestObject({
        url,
        method: 'DELETE',
        ...options,
    }).exec()
}
