import * as logger from './logger'

type IMessageCallback = (message: any, sender: any, sendResponse: (message: any) => void) => any

interface IMessageRecord {
    type: string,
    callback: IMessageCallback,
}

class Message {
    private registry: IMessageRecord[] = []

    constructor() {
        chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: (response: any) => void) => {
            this.registry
                .filter((record) => record.type === message.type)
                .map((record) => record.callback(message, sender, sendResponse))
        })
    }

    public addListener(messageRecord: IMessageRecord) {
        logger.debug(`Add message listener ${messageRecord.type}`)
        this.registry.push(messageRecord)
    }

    public async send(type: string, text: any = null): Promise<any> {
        return new Promise((resolve: (something) => any) => chrome.runtime.sendMessage({type, text}, resolve))
    }

    public async sendTab(tabId: number, type: string, text: any = null): Promise<any> {
        return new Promise((resolve: (something) => any) => chrome.tabs.sendMessage(tabId, {type, text}, resolve))
    }
}

const message = new Message()
export default message
