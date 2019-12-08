import * as logger from '../core/logger'
export { send } from '../core/message'

type IMessageCallback = (message: any, sender: any, sendResponse: (message: any) => void) => any

interface IMessageRecord {
    type: string,
    callback: IMessageCallback,
}

const registry: IMessageRecord[] = []

export function addListener(messageRecord: IMessageRecord) {
    logger.debug(`Add message listener ${messageRecord.type}`)
    registry.push(messageRecord)
}

export function start() {
    chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: (response: any) => void) => {
        registry
            .filter((record) => record.type === message.type)
            .map((record) => record.callback(message, sender, sendResponse))
    })
}

start()
