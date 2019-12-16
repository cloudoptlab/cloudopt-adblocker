import * as utils from './utils'
import * as store from './store'
import * as coreConfig from './config'
import * as api from './api'

const DEFAULT_EXPIREDAYS = 1

export class Result {
    public safe: boolean = true
    public type: string = ''
    public date: number = new Date().getTime()
    public score: number = 0
    public host: string = ''

    public async isSafe(): Promise<boolean> {
        const level = this.classify()
        const config = await coreConfig.get()
        let safe = false
        if (level <= 2) {
            safe = true
        }
        if (level === 3) {
            if (config.safePotential) {
                safe = false
            } else {
                safe = true
            }
        }
        if (level === 5) {
            safe = true
        }
        if (config.allowList.indexOf(this.host) > -1 || config.allowListAds.indexOf(this.host) > -1) {
            safe = true
        }
        if (config.blockList.some((e) => e === this.host)) {
            safe = false
        }

        return safe
    }

    public classify(): number {
        let level = 0 /* no level */
        if (this.score >= 65) {
            level = 1 /* safe */
        } else if (this.score >= 60) {
            level = 2 /* normal */
        } else if (this.score >= 40) {
            level = 3 /* potential threat */
        } else if (this.score === 0 && this.safe) {
            level = 5 /* unknown */
        } else {
            level = 4 /* dangerous */
        }
        return level
    }

    public toString(): string {
        return `${this.host}_${this.score}_${this.date}_${this.type}`
    }

    public fromString(str: string): Result {
        let host: string, type: string, score: string, date: string
        try {
            [host, score, date, type] = str.split('_')
            if (!host || !type) {
                throw new Error('invalid cache format')
            }
            this.host = host
            this.score = parseInt(score, 10)
            this.date = parseInt(date, 10)
            this.type = type
        } catch (error) {
            return this
        }
        return this
    }
}

function couldGrade(url: string): boolean {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return false
    }

    const host = utils.getHost(url)
    if (/^([0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host)
        || 'localhost' === host) {
        return false
    }

    return true
}

export async function website(url: string): Promise<Result> {
    const result = new Result()
    if (!couldGrade(url)) {
        return Promise.resolve(result)
    }
    const cacheSuffix = '_grade_1.0'
    const host = utils.getHost(url)
    result.host = host
    const cacheKey = host + cacheSuffix

    const recordStr = await store.get(cacheKey)
    let record = (new Result()).fromString(recordStr)
    if (recordStr && utils.compareDate(record.date, DEFAULT_EXPIREDAYS)) {
        record.safe = await record.isSafe()
    } else {
        try {
            record = await api.gradeWebsite(host)
            record.safe = await record.isSafe()
        } catch (error) {
            record = new Result()
            record.score = 60
            record.safe = true
        }
        store.set(cacheKey, record.toString())
    }

    return record
}
