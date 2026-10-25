import { ref, watch } from 'vue';
import type { QForm } from 'quasar';
import { useI18n } from 'vue-i18n';

export function useLocalizedValidation() {
  const form = ref<QForm | null>(null);
  const { locale } = useI18n({ useScope: 'global' });
  watch(
    locale,
    () => {
      // Revalidate only fields already showing an error, preserving lazy-rules.
      for (const field of form.value?.getValidationComponents() ?? []) {
        if ('hasError' in field && field.hasError) void field.validate();
      }
    },
    { flush: 'post' },
  );
  return form;
}
