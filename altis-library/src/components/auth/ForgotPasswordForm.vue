<script setup lang="ts">
import { getApiErrorKey, reportApiError } from '@/utils/apiErrors';
import { useLocalizedValidation } from '@/utils/localizedValidation';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { requiredRule, emailRule, cpfRule } from '@/utils/validationRules';
import { authService } from '@/services/authService';
import { passwordResetStorage } from '@/utils/passwordResetStorage';
import { unexpectedResponse } from '@/utils/apiResponses';

const router = useRouter();

const email = ref('');
const cpf = ref('');

const loading = ref(false);
const submitError = ref('');

async function onSubmit() {
  loading.value = true;
  submitError.value = '';

  passwordResetStorage.clear();

  try {
    const response = await authService.forgotPassword({
      email: email.value.trim(),
      cpf: cpf.value,
    });

    if (!response.token) {
      unexpectedResponse();
    }

    passwordResetStorage.save(response.token);

    await router.push('/reset-password');
  } catch (error: unknown) {
    reportApiError(error);
    submitError.value = getApiErrorKey(error, 'forgotPassword.error');
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
  <section class="forgot-container">
    <h1 class="forgot-title">
      {{ $t('forgotPassword.title') }}
    </h1>

    <q-form ref="localizedForm" class="forgot-form" @submit="onSubmit">
      <q-input
        v-model="email"
        filled
        bg-color="grey-4"
        type="email"
        autocomplete="email"
        :label="$t('forgotPassword.email')"
        :rules="[requiredRule, emailRule]"
        lazy-rules="ondemand"
        class="forgot-input"
      >
        <template #prepend>
          <q-icon name="mail_outline" />
        </template>
      </q-input>

      <q-input
        v-model="cpf"
        filled
        bg-color="grey-4"
        mask="###.###.###-##"
        unmasked-value
        :label="$t('forgotPassword.cpf')"
        :rules="[requiredRule, cpfRule]"
        lazy-rules="ondemand"
        class="forgot-input"
      >
        <template #prepend>
          <q-icon name="badge" />
        </template>
      </q-input>

      <q-btn
        type="submit"
        :label="$t('forgotPassword.confirm')"
        :loading="loading"
        :disable="loading"
        unelevated
        no-caps
        class="forgot-button"
      />

      <p v-if="submitError" class="text-negative text-center">
        {{ $t(submitError) }}
      </p>
    </q-form>

    <div class="forgot-divider">
      <q-separator />
      <span>{{ $t('forgotPassword.or') }}</span>
      <q-separator />
    </div>

    <q-btn
      flat
      no-caps
      color="primary"
      icon="arrow_back"
      :label="$t('forgotPassword.backToLogin')"
      class="forgot-back"
      @click="goToLogin"
    />
  </section>
</template>

<style scoped>
.forgot-container {
  width: 100%;
  max-width: 620px;
  padding: 12px 16px;
}

.forgot-title {
  margin: 0 0 80px;
  font-size: 48px;
  font-weight: 300;
  text-align: center;
  line-height: 1.2;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.forgot-input {
  width: 100%;
}

.forgot-input :deep(.q-field__control) {
  border-radius: 0;
}

.forgot-input :deep(.q-field__native),
.forgot-input :deep(.q-field__label) {
  font-size: 16px;
}

.forgot-button {
  align-self: center;
  width: 240px;
  min-height: 52px;
  margin-top: 16px;
  border-radius: 28px;
  background-color: #0b717f !important;
  color: white !important;
  font-size: 17px;
}

.forgot-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 56px 16px 32px;
  color: #777;
}

.forgot-divider .q-separator {
  flex: 1;
}

.forgot-back {
  display: flex;
  margin: 0 auto;
  color: #0b717f !important;
  font-size: 16px;
  font-weight: 600;
}
</style>
