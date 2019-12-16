import * as api from './api'

let _loggedIn: boolean = false
let _loginData: any = null

export async function updateLoginStatus(): Promise<boolean> {
    try {
        _loginData = (await api.auth()).result
        _loggedIn = true
    } catch (error) {
        _loginData = {}
        _loggedIn = false
    }
    return _loggedIn
}

export function loggedIn(): boolean {
    return _loggedIn
}

export async function getLoginData(): Promise<any> {
    if (!_loginData) {
        await updateLoginStatus()
    }
    return _loginData
}
