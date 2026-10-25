import { i18n } from './i18n';
const { t } = i18n.global;
import { toISODate } from './dateUtils';

export const requiredRule = (value: string) => Boolean(value?.trim()) || t('validation.required');

export const emailRule = (value: string) =>
  !value?.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || t('validation.email');

export const gmailRule = (value: string) =>
  !value.trim() || /^[A-Za-z0-9._%+-]+@gmail\.com$/.test(value) || t('validation.gmail');

export const nameRule = (value: string) => value.trim().length <= 50 || t('validation.nameLength');

export const cpfRule = (value: string) => /^\d{10,11}$/.test(value) || t('validation.cpf');

export const phoneRule = (value: string) =>
  !value?.trim() || /^\d{10,11}$/.test(value) || t('validation.phone');

export const passwordRule = (value: string) =>
  (value.length >= 8 && value.length <= 15) || t('validation.password');

export const confirmPasswordRule = (password: string) => (value: string) =>
  value === password || t('validation.passwordMatch');

export const birthDateRule = (value: string) => {
  if (!value?.trim()) {
    return t('validation.required');
  }

  return toISODate(value, i18n.global.locale.value) !== null || t('validation.date');
};
