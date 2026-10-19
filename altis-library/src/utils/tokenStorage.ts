import { SessionStorage } from "quasar";

const TOKEN_KEY = 'lokbooks_token'

export function saveToken(token: string): void {
    SessionStorage.set(TOKEN_KEY, token)
}

export function getToken(): string | null {
    return SessionStorage.getItem<string>(TOKEN_KEY)
}

export function clearToken(): void {
    SessionStorage.remove(TOKEN_KEY)
}