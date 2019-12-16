import {Result as GradeResult} from './grade'
import * as http from './http'
import * as coreConfig from './config'

export const HOST = 'https://www.cloudopt.net/api/v2/'
export const APIKEY = '11N9M530M667ZYW9KZHB0100JAX3XRGJ'

export function gradeWebsite(website: string): Promise<GradeResult> {
    return http.get(`${HOST}grade/website/${website}`, {timeout: 3000, data: {apikey: APIKEY}}).then((data) => {
        const result = new GradeResult()
        result.host = website
        result.type = data.result.type
        result.score = data.result.score
        if (data.result.host !== '') {
            result.date = new Date().getTime()
        }
        return result
    })
}

export function saveConfig(config: coreConfig.Config): Promise<any> {
    return http.put(`${HOST}adblocker/config`, {data: JSON.stringify(config)})
}

export function downloadConfig() {
    return http.get(`${HOST}adblocker/config`)
}

export function statistics(data: any) {
    return http.get('https://www.google-analytics.com/collect', {
        timeout: 10000,
        async: true,
        data,
    })
}

export function geoIp() {
    return http.get(`${HOST}ip`, {data: {apikey: APIKEY}})
}

export function auth() {
    return http.get(`${HOST}account/auth`, {data: {apikey: APIKEY}})
}

export function logout() {
    return http.del(`${HOST}account/auth`, {data: {apikey: APIKEY}})
}

export function connectionCount() {
    return http.get(`${HOST}health/connections`)
}
