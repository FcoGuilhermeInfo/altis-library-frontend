import { i18n } from './i18n';
const { t } = i18n.global;
import { toISODate } from './dateUtils';

export const requiredRule = (value: string) => Boolean(value?.trim()) || t('validation.required');

export const emailRule = (value: string) =>
  !value?.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || t('validation.email');

export const gmailRule = (value: string) =>
  !value.trim() || /^[A-Za-z0-9._%+-]+@gmail\.com$/.test(value) || t('validation.gmail');

export const nameRule = (value: string) => value.trim().length <= 50 || t('validation.nameLength');

export const cpfRule = (value: string) => {
  if (!/^\d{11}$/.test(value) || /^([\d])\1{10}$/.test(value)) return t('validation.cpf');

  const digits = value.split('').map(Number);
  const firstCheck = digits
    .slice(0, 9)
    .reduce((sum, digit, index) => sum + digit * (10 - index), 0);
  const firstDigit = ((firstCheck * 10) % 11) % 10;
  const secondCheck = digits
    .slice(0, 10)
    .reduce((sum, digit, index) => sum + digit * (11 - index), 0);
  const secondDigit = ((secondCheck * 10) % 11) % 10;

  return (digits[9] === firstDigit && digits[10] === secondDigit) || t('validation.cpf');
};

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
