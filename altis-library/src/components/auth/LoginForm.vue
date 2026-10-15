
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import {
  saveRememberedEmail,
  getRememberedEmail,
  clearRememberedEmail,
} from '@/utils/rememberMe'

const router = useRouter()
const authStore = useAuthStore()

const rememberedEmail = getRememberedEmail()

const email = ref<string>(rememberedEmail)
const password = ref('')
const rememberMe = ref(Boolean(rememberedEmail))
const showPassword = ref(false)

const requiredRule = (value: string | null) =>
  Boolean(value?.trim()) || 'Este campo é obrigatório.'

const emailRule = (value: string | null) => {
  if (!value?.trim()) return true

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailPattern.test(value) || 'Informe um e-mail válido.'
}

async function onSubmit() {
  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value,
    })

    if (rememberMe.value) {
      saveRememberedEmail(email.value.trim())
    } else {
      clearRememberedEmail()
    }

    await router.push('/dashboard')
  } catch (error: unknown) {
    console.error('Falha ao realizar login:', error)
  }
}

</script>


<template>
  <div class="login-form-container">
    <h1 class="login-title">
      {{ $t('login.login') }}
    </h1>


    <q-banner
      v-if="authStore.error"
      class="bg-red-1 text-negative q-mb-md"
      rounded
    >
      {{ authStore.error }}
    </q-banner>

    <q-form class="login-form" @submit.prevent="onSubmit">
      <q-input
        v-model="email"
        type="email"
        :label="$t('login.email')"
        :aria-label="$t('login.email')"
        filled
        bg-color="grey-4"
        class="login-input"
        autocomplete="email"
        :rules="[requiredRule, emailRule]"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="mail_outline" />
        </template>
      </q-input>

      <q-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :label="$t('login.password')"
        :aria-label="$t('login.password')"
        filled
        bg-color="grey-4"
        class="login-input"
        autocomplete="current-password"
         :rules="[requiredRule]"
        lazy-rules="ondemand"
      >
        <template #prepend>
          <q-icon name="key" />
        </template>

        <template #append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-checkbox v-model="rememberMe" :label="$t('login.rememberMe')" class="remember-checkbox" />

      <q-btn type="submit" :label="$t('login.enter')" :loading="authStore.loading" :disable="authStore.loading" class="login-button" no-caps unelevated />
    </q-form>

    <div class="login-divider">
      <q-separator />

      <span>{{ $t('login.or') }}</span>

      <q-separator />
    </div>

    <q-btn flat no-caps :label="$t('login.forgotPassword')" class="forgot-password" type="button" />

    <div class="register-text">
      <span>{{ $t('login.noAccount') }}</span>

      <q-btn flat no-caps :label="$t('login.register')" class="register-button" type="button" />
    </div>
  </div>
</template>

<style scoped>
.login-form-container {
  width: 100%;
  max-width: 600px;
  padding: 24px;
  box-sizing: border-box;
}

.login-title {
  margin: 0 0 53px;
  text-align: center;
  font-size: 38px;
  font-weight: 400;
}

.login-form {
  width: 100%;
}

.login-input {
  margin-bottom: 28px;
}

.login-input + .login-input {
  margin-bottom: 12px;
}

.login-input :deep(.q-field__control) {
  min-height: 56px;
  border-radius: 0;
}

.login-input :deep(.q-field__marginal) {
  height: 56px;
}

.login-input :deep(.q-field__prepend),
.login-input :deep(.q-field__append) {
  height: 56px;
  padding: 0 14px;
}

.login-input :deep(.q-field__native),
.login-input :deep(.q-field__label) {
  font-size: 14px;
}

.login-input :deep(.q-icon) {
  color: #202124;
  font-size: 21px;
}

.remember-checkbox {
  margin: 0;
}

.login-button {
  display: block;
  width: 190px;
  height: 48px;
  margin: 16px auto 34px;
  border-radius: 24px;
  background-color: #0b717f;
  color: white;
  font-size: 15px;
  font-weight: 400;
}

.login-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 30px 0 28px;
  color: #999;
  font-size: 15px;
}

.login-divider .q-separator {
  flex: 1;
}

.forgot-password {
  display: flex;
  margin: 0 auto 34px;
  color: #222;
  font-size: 15px;
  font-weight: 600;
}

.register-text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 15px;
}

.register-button {
  padding: 0 4px;
  color: #222;
  font-size: 15px;
  font-weight: 600;
}
</style>
