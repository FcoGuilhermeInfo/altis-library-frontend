import { SessionStorage } from "quasar";

const RESET_TOKEN_KEY = 'lokbooks_reset_token'

export const passwordResetStorage = {
    save(token: string): void {
        SessionStorage.set(RESET_TOKEN_KEY, token)
    },

    get(): string | null {
        return SessionStorage.getItem<string>(RESET_TOKEN_KEY)
    },

    clear(): void {
        SessionStorage.remove(RESET_TOKEN_KEY)
    },
}