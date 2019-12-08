
const storeDriver = chrome.storage.local

export async function set(key: string, value: any): Promise<any> {
  return new Promise((resolve: () => void) => { storeDriver.set({[key]: value}, resolve) })
}

export function get(key: string): Promise<any> {
    return new Promise((resolve: (something: {[key: string]: any}) => void) => {
        storeDriver.get(key, (items) => {resolve(items[key])})
    })
}

export async function all(): Promise<any> {
    return new Promise((resolve: (something: any) => any) => storeDriver.get(null, resolve))
}

export async function remove(key: string): Promise<any> {
    return new Promise((resolve: () => void) => storeDriver.remove(key, resolve))
}

export function clear() {
    storeDriver.clear()
}
