<script setup lang="ts">
import { getApiErrorKey, getApiFieldErrors, reportApiError } from '@/utils/apiErrors';
import { useLocalizedValidation } from '@/utils/localizedValidation';
import { useApiFormErrors } from '@/utils/apiFormErrors';
import {
  requiredRule,
  emailRule,
  nameRule,
  cpfRule,
  phoneRule,
  passwordRule,
  confirmPasswordRule,
  birthDateRule,
  gmailRule,
} from '@/utils/validationRules';
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { toISODate, formatISODate } from '@/utils/dateUtils';
import { userService } from '@/services/userService';

const router = useRouter();

const name = ref('');
const birthDate = ref('');
const cpf = ref('');
const phone = ref('');
const address = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const loading = ref(false);
const submitError = ref('');
const { serverFields, serverValidation } = useApiFormErrors();

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const { locale } = useI18n({ useScope: 'global' });

const birthDateFormat = computed(() => {
  return locale.value === 'en-US' ? 'MM/DD/YYYY' : 'DD/MM/YYYY';
});

watch(locale, (newLocale, oldLocale) => {
  if (!birthDate.value) {
    return;
  }

  const isoDate = toISODate(birthDate.value, oldLocale);

  if (isoDate) {
    birthDate.value = formatISODate(isoDate, newLocale);
  } else {
    birthDate.value = '';
  }
});

async function onSubmit() {
  const isoDate = toISODate(birthDate.value, locale.value);

  if (!isoDate) {
    submitError.value = 'validation.birthDate';
    return;
  }

  loading.value = true;
  submitError.value = '';
  serverFields.value = [];

  try {
    await userService.register({
      name: name.value.trim(),
      birthDate: formatISODate(isoDate, 'pt-BR'),
      cpf: cpf.value,
      phone: phone.value,
      address: address.value.trim(),
      email: email.value.trim(),
      password: password.value,
    });

    await router.replace('/login');
  } catch (error: unknown) {
    reportApiError(error);
    serverFields.value = getApiFieldErrors(error);
    submitError.value = getApiErrorKey(error, 'register.error');
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  void router.push('/login');
}
const localizedForm = useLocalizedValidation();
</script>

<template>
  <div class="register-container">
    <h1 class="register-title">{{ $t('register.title') }}</h1>

    <q-form ref="localizedForm" class="register-form" @submit="onSubmit">
      <q-input
        v-model="name"
        filled
        bg-color="grey-4"
        :label="$t('register.name')"
        class="register-input"
        autocomplete="name"
        :rules="[requiredRule, nameRule]"
        v-bind="serverValidation('name')"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="person_outline" />
        </template>
      </q-input>

      <q-input
        v-model="birthDate"
        filled
        bg-color="grey-4"
        mask="##/##/####"
        :label="$t('register.birthDate')"
        :hint="birthDateFormat"
        class="register-input"
        :rules="[requiredRule, birthDateRule]"
        v-bind="serverValidation('birthDate')"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="calendar_month" />
        </template>
      </q-input>

      <q-input
        v-model="cpf"
        filled
        bg-color="grey-4"
        mask="###.###.###-##"
        unmasked-value
        :label="$t('register.cpf')"
        class="register-input"
        :rules="[requiredRule, cpfRule]"
        v-bind="serverValidation('cpf')"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="badge" />
        </template>
      </q-input>

      <q-input
        v-model="phone"
        filled
        bg-color="grey-4"
        mask="(##) #####-####"
        unmasked-value
        :label="$t('register.phone')"
        class="register-input"
        autocomplete="tel"
        :rules="[requiredRule, phoneRule]"
        v-bind="serverValidation('phone')"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="phone" />
        </template>
      </q-input>

      <q-input
        v-model="address"
        filled
        bg-color="grey-4"
        :label="$t('register.address')"
        class="register-input"
        autocomplete="street-address"
        :rules="[requiredRule]"
        v-bind="serverValidation('address')"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="location_on" />
        </template>
      </q-input>

      <q-input
        v-model="email"
        filled
        bg-color="grey-4"
        type="email"
        :label="$t('register.email')"
        class="register-input"
        autocomplete="email"
        :rules="[requiredRule, emailRule, gmailRule]"
        v-bind="serverValidation('email')"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="mail_outline" />
        </template>
      </q-input>

      <q-input
        v-model="password"
        filled
        bg-color="grey-4"
        :type="showPassword ? 'text' : 'password'"
        :label="$t('register.password')"
        class="register-input"
        autocomplete="new-password"
        :rules="[requiredRule, passwordRule]"
        v-bind="serverValidation('password')"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="key" />
        </template>

        <template #append>
          <q-icon
            :aria-label="showPassword ? $t('common.hidePassword') : $t('common.showPassword')"
            role="button"
            tabindex="0"
            @keydown.enter.prevent="showPassword = !showPassword"
            @keydown.space.prevent="showPassword = !showPassword"
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-input
        v-model="confirmPassword"
        filled
        bg-color="grey-4"
        :type="showConfirmPassword ? 'text' : 'password'"
        :label="$t('register.confirmPassword')"
        class="register-input"
        autocomplete="new-password"
        :rules="[requiredRule, confirmPasswordRule(password)]"
        v-bind="serverValidation('confirmPassword')"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="key" />
        </template>

        <template #append>
          <q-icon
            :aria-label="
              showConfirmPassword ? $t('common.hidePassword') : $t('common.showPassword')
            "
            role="button"
            tabindex="0"
            @keydown.enter.prevent="showConfirmPassword = !showConfirmPassword"
            @keydown.space.prevent="showConfirmPassword = !showConfirmPassword"
            :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showConfirmPassword = !showConfirmPassword"
          />
        </template>
      </q-input>

      <q-btn
        type="submit"
        :label="$t('register.submit')"
        :loading="loading"
        :disable="loading"
        unelevated
        no-caps
        class="register-button"
      />

      <div class="register-footer">
        <q-btn
          flat
          no-caps
          :label="$t('register.alreadyHaveAccount')"
          class="login-link"
          @click="goToLogin"
        />
      </div>
      <p v-if="submitError" class="text-negative text-center">
        {{ $t(submitError) }}
      </p>
    </q-form>
  </div>
</template>

<style scoped>
.register-container {
  width: 100%;
  max-width: 700px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 12px 16px;
}

.register-title {
  margin: 0 0 24px;
  font-size: 48px;
  font-weight: 300;
  text-align: center;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.register-input {
  width: 100%;
}

.register-input :deep(.q-field__control) {
  border-radius: 0;
}

.register-input :deep(.q-field__native),
.register-input :deep(.q-field__label) {
  font-size: 14px;
}

.register-button {
  align-self: center;
  width: 250px;
  min-height: 50px;
  margin-top: 12px;
  border-radius: 24px;
  font-size: 20px;
  background-color: #0b717f !important;
  color: white !important;
}

.register-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}
</style>
