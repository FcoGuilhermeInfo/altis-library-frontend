import { toISODate } from './dateUtils'

export const requiredRule = (value: string) => Boolean(value?.trim()) || 'Este campo é obrigatório'

export const emailRule = (value: string) => !value?.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Informe um e-mail válido'

export const gmailRule = (value: string) =>
  !value.trim() ||
  /^[A-Za-z0-9._%+-]+@gmail\.com$/.test(value) ||
  'O e-mail deve terminar em @gmail.com.'


export const nameRule = (value: string) => value.trim().length <= 50 || 'O nome deve ter no máximo 50 caracteres.'

export const cpfRule = (value: string) => /^\d{10,11}$/.test(value) || 'O CPF deve conter 11 números'

export const phoneRule = (value: string) => !value?.trim() || /^\d{10,11}$/.test(value) || 'O telefone deve conter 10 ou 11 números'

export const passwordRule = (value: string) => (value.length >= 8 && value.length <= 15) || 'A senha deve ter no mínimo 8 e no máximo 15 caracteres.'

export const confirmPasswordRule = (password: string) => (value: string) => value === password || 'As senhas não coincidem'

export const birthDateRule = (value: string) => {
    if (!value?.trim()) {
        return 'Este campo é obrigatório'
    }

    return (
        toISODate(value, 'pt-BR') !== null || 'Informe uma data válida'
    )
}