import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// The API identifies fields, but not constraint codes. Display a safe localized
// prompt next to the input instead of translating arbitrary server messages.
export function useApiFormErrors(source?: () => readonly string[] | undefined) {
  const { t } = useI18n({ useScope: 'global' });
  const serverFields = ref<string[]>([]);
  const correctedFields = ref<string[]>([]);
  watch(source ?? serverFields, () => { correctedFields.value = []; });

  function serverValidation(field: string) {
    const fields = source ? source() ?? [] : serverFields.value;
    const active = fields.includes(field) && !correctedFields.value.includes(field);
    return {
      error: active,
      errorMessage: active ? t('validation.serverField') : undefined,
      'onUpdate:modelValue': () => { correctedFields.value.push(field); },
    };
  }
  return { serverFields, serverValidation };
}
