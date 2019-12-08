export async function send(type: string, text: any = null): Promise<any> {
    return new Promise((resolve: (something) => any) => chrome.runtime.sendMessage({type, text}, resolve))
}
