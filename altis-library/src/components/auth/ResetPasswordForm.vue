<script setup lang="ts">
import { getApiErrorKey, reportApiError } from '@/utils/apiErrors';
import { useLocalizedValidation } from '@/utils/localizedValidation';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { passwordResetStorage } from '@/utils/passwordResetStorage';
import { requiredRule, passwordRule, confirmPasswordRule } from '@/utils/validationRules';
import { notifyLocalized } from '@/utils/localizedNotify';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

const router = useRouter();

const password = ref('');
const confirmPassword = ref('');

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const loading = ref(false);
const submitError = ref('');

onMounted(() => {
  if (!passwordResetStorage.get()) {
    void router.replace('/forgot-password');
  }
});

function goBack() {
  void router.push('/forgot-password');
}

async function onSubmit() {
  const token = passwordResetStorage.get();

  if (!token) {
    await router.replace('/forgot-password');
    return;
  }

  loading.value = true;
  submitError.value = '';

  try {
    await authService.resetPassword({
      token,
      newPassword: password.value,
      confirmPassword: confirmPassword.value,
    });

    passwordResetStorage.clear();

    await router.replace('/login');

    notifyLocalized(() => ({
      type: 'positive',
      message: t('resetPassword.success'),
      caption: t('resetPassword.successCaption'),
      position: 'top',
      timeout: 4000,
    }));
  } catch (error: unknown) {
    reportApiError(error);
    submitError.value = getApiErrorKey(error, 'resetPassword.error');
  } finally {
    loading.value = false;
  }
}
const localizedForm = useLocalizedValidation();
</script>

<template>
  <section class="reset-container">
    <q-btn
      flat
      round
      icon="arrow_back"
      class="reset-back"
      :aria-label="$t('resetPassword.back')"
      @click="goBack"
    />

    <h1 class="reset-title">
      {{ $t('resetPassword.title') }}
    </h1>

    <q-form ref="localizedForm" class="reset-form" @submit="onSubmit">
      <q-input
        v-model="password"
        filled
        bg-color="grey-4"
        :type="showPassword ? 'text' : 'password'"
        :label="$t('resetPassword.password')"
        autocomplete="new-password"
        :rules="[requiredRule, passwordRule]"
        lazy-rules="ondemand"
        class="reset-input"
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
        :label="$t('resetPassword.confirmPassword')"
        autocomplete="new-password"
        :rules="[requiredRule, confirmPasswordRule(password)]"
        lazy-rules="ondemand"
        class="reset-input"
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
        :label="$t('resetPassword.submit')"
        :loading="loading"
        :disable="loading"
        unelevated
        no-caps
        class="reset-button"
      />

      <p v-if="submitError" class="text-negative text-center">
        {{ $t(submitError) }}
      </p>
    </q-form>
  </section>
</template>

<style scoped>
.reset-container {
  position: relative;
  width: 100%;
  max-width: 620px;
  padding: 12px 16px;
}

.reset-back {
  position: absolute;
  top: 12px;
  left: 0;
  color: #0b717f;
}

.reset-title {
  margin: 0 0 90px;
  font-size: 48px;
  font-weight: 300;
  line-height: 1.2;
  text-align: center;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.reset-input {
  width: 100%;
}

.reset-input :deep(.q-field__control) {
  border-radius: 0;
}

.reset-input :deep(.q-field__native),
.reset-input :deep(.q-field__label) {
  font-size: 16px;
}

.reset-button {
  align-self: center;
  width: 240px;
  min-height: 52px;
  margin-top: 36px;
  border-radius: 28px;
  background-color: #0b717f !important;
  color: white !important;
  font-size: 17px;
}
</style>