import { LocalStorage } from "quasar"

const REMEMBER_EMAIL_KEY = 'lokbooks_remember_email'

export function saveRememberedEmail(email: string): void {
    LocalStorage.setItem(REMEMBER_EMAIL_KEY, email)
}

export function getRememberedEmail(): string {
    return LocalStorage.getItem<string>(REMEMBER_EMAIL_KEY) ?? ''
}

export function clearRememberedEmail(): void {
    LocalStorage.remove(REMEMBER_EMAIL_KEY)
}