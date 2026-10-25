import { defineBoot } from '#q-app';
import { watch } from 'vue';
import { Lang } from 'quasar';
import enUS from 'quasar/lang/en-US';
import ptBR from 'quasar/lang/pt-BR';
import es from 'quasar/lang/es';
import { i18n, isMessageLanguage } from '@/utils/i18n';
import type { MessageSchema } from '@/utils/i18n';

export type { MessageLanguages, MessageSchema } from '@/utils/i18n';

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

const languagePacks = { 'en-US': enUS, 'pt-BR': ptBR, 'es-ES': es };

export default defineBoot(({ app }) => {
  try {
    const savedLocale = localStorage.getItem('lokbooks.locale');
    if (isMessageLanguage(savedLocale)) i18n.global.locale.value = savedLocale;
  } catch {
    // Storage can be unavailable; language switching still works for this session.
  }

  app.use(i18n);

  const stop = watch(
    i18n.global.locale,
    (locale) => {
      // Official packs and Lang.set disagree on optional callback arguments in 2.33.
      Lang.set(languagePacks[locale] as Parameters<typeof Lang.set>[0]);
      document.documentElement.lang = locale;
      try {
        localStorage.setItem('lokbooks.locale', locale);
      } catch {
        // Persistence is optional.
      }
    },
    { immediate: true },
  );
  app.onUnmount(stop);
});
