import { createI18n } from 'vue-i18n';
import messages from '../i18n/index';

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = (typeof messages)['en-US'];

export function isMessageLanguage(value: unknown): value is MessageLanguages {
  return typeof value === 'string' && Object.hasOwn(messages, value);
}

// Shared with stores and validation utilities, which run outside component setup.
export const i18n = createI18n<{ message: MessageSchema }, MessageLanguages, false>({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  legacy: false,
  messages,
});
