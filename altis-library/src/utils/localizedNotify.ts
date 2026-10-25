import { watch } from 'vue';
import { Notify } from 'quasar';
import type { QNotifyCreateOptions } from 'quasar';
import { i18n } from './i18n';

// Keep visible notifications translated, including those surviving navigation.
export function notifyLocalized(options: () => QNotifyCreateOptions) {
  const initial = options();
  const update = Notify.create({
    ...initial,
    group: false,
    onDismiss: () => {
      stop();
      initial.onDismiss?.();
    },
  });
  const stop = watch(i18n.global.locale, () => {
    const { message, caption } = options();
    update({
      ...(message !== undefined && { message }),
      ...(caption !== undefined && { caption }),
    });
  });
  return update;
}
