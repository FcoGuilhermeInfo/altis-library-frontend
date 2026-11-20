
<script setup lang="ts">
import { useLocalizedValidation } from '@/utils/localizedValidation';
import { formatDate } from '@/utils/dateUtils';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdate {
  name: string;
  phone: string;
  address: string;
  passwordChange?: PasswordChange;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    profile: ProfileData;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [data: ProfileUpdate];
}>();

const { t } = useI18n();
const formRef = useLocalizedValidation();

const name = ref('');
const phone = ref('');
const address = ref('');

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const wantsPasswordChange = computed(() => {
  return (
    currentPassword.value.length > 0 ||
    newPassword.value.length > 0 ||
    confirmPassword.value.length > 0
  );
});

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return;

    name.value = props.profile.name;
    phone.value = props.profile.phone ?? '';
    address.value = props.profile.address ?? '';

    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

    showCurrentPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;

    formRef.value?.resetValidation();
  },
);

function validateCurrentPassword(value: string) {
  if (!wantsPasswordChange.value) return true;

  return (
    value.length > 0 ||
    t('profile.currentPasswordRequired')
  );
}

function validateNewPassword(value: string) {
  if (!wantsPasswordChange.value) return true;

  if (!value) {
    return t('profile.newPasswordRequired');
  }

  if (value.length < 8 || value.length > 15) {
    return t('profile.passwordLength');
  }

  if (value === currentPassword.value) {
    return t('profile.passwordMustDiffer');
  }

  return true;
}

function validateConfirmPassword(value: string) {
  if (!wantsPasswordChange.value) return true;

  if (!value) {
    return t('profile.confirmPasswordRequired');
  }

  if (value !== newPassword.value) {
    return t('profile.passwordMismatch');
  }

  return true;
}

function onSubmit() {
  const data: ProfileUpdate = {
    name: name.value.trim(),
    phone: phone.value.replace(/\D/g, ''),
    address: address.value.trim(),
  };

  if (wantsPasswordChange.value) {
    data.passwordChange = {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    };
  }

  emit('save', data);
}
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="profile-dialog">
      <q-card-section class="dialog-header">
        <q-avatar size="70px">
          <q-icon
            name="account_circle"
            size="70px"
            color="dark"
          />
        </q-avatar>

        <div class="header-user">
          <h2>{{ profile.name }}</h2>
          <span>{{ $t('loans.borrower') }}</span>
        </div>

        <q-btn
          icon="close"
          :aria-label="$t('common.close')"
          flat
          round
          class="close-button"
          :disable="loading"
          @click="isOpen = false"
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <q-form ref="formRef" @submit="onSubmit">
          <div class="form-field">
            <label>{{ $t('common.fullName') }}:</label>

            <q-input
              v-model="name"
              :aria-label="$t('common.fullName')"
              filled
              dense
              bg-color="grey-3"
              :disable="loading"
              :rules="[
                (value) =>
                  !!value?.trim() || $t('validation.name'),
              ]"
              lazy-rules="ondemand"
            />
          </div>

          <div class="form-field">
            <label>{{ $t('register.email') }}:</label>

            <q-input
              :model-value="profile.email"
              :aria-label="$t('register.email')"
              filled
              dense
              readonly
              bg-color="grey-3"
            >
              <template #append>
                <q-icon
                  name="lock_outline"
                  size="18px"
                >
                  <q-tooltip>
                    {{ $t('profile.readOnly') }}
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>{{ $t('register.cpf') }}:</label>

              <q-input
                :model-value="profile.cpf"
                :aria-label="$t('register.cpf')"
                filled
                dense
                readonly
                bg-color="grey-3"
              >
                <template #append>
                  <q-icon
                    name="lock_outline"
                    size="18px"
                  >
                    <q-tooltip>
                      {{ $t('profile.readOnly') }}
                    </q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="form-field">
              <label>{{ $t('register.birthDate') }}:</label>

              <q-input
                :model-value="formatDate(profile.birthDate)"
                :aria-label="$t('register.birthDate')"
                filled
                dense
                readonly
                bg-color="grey-3"
              />
            </div>

            <div class="form-field">
              <label>{{ $t('register.phone') }}:</label>

              <q-input
                v-model="phone"
                :aria-label="$t('register.phone')"
                filled
                dense
                bg-color="grey-3"
                mask="(##) #####-####"
                unmasked-value
                :disable="loading"
                :rules="[
                  (value) =>
                    /^\d{10,11}$/.test(value) ||
                    $t('validation.phone'),
                ]"
                lazy-rules="ondemand"
              />
            </div>
          </div>

          <div class="form-field">
            <label>{{ $t('register.address') }}:</label>

            <q-input
              v-model="address"
              :aria-label="$t('register.address')"
              filled
              dense
              bg-color="grey-3"
              :disable="loading"
              :rules="[
                (value) =>
                  !!value?.trim() ||
                  $t('validation.address'),
              ]"
              lazy-rules="ondemand"
            />
          </div>

          <div class="password-section">
            <div class="form-row">
              <div class="form-field">
                <label for="current-password">
                  {{ $t('profile.currentPassword') }}:
                </label>

                <q-input
                  id="current-password"
                  v-model="currentPassword"
                  :type="
                    showCurrentPassword
                      ? 'text'
                      : 'password'
                  "
                  :aria-label="$t('profile.currentPassword')"
                  autocomplete="current-password"
                  filled
                  dense
                  bg-color="grey-3"
                  :disable="loading"
                  :rules="[validateCurrentPassword]"
                  lazy-rules="ondemand"
                >
                  <template #append>
                    <q-icon
                      :name="
                        showCurrentPassword
                          ? 'visibility_off'
                          : 'visibility'
                      "
                      class="password-toggle"
                      role="button"
                      tabindex="0"
                      :aria-label="
                        showCurrentPassword
                          ? $t('profile.hidePassword')
                          : $t('profile.showPassword')
                      "
                      @click="
                        showCurrentPassword =
                          !showCurrentPassword
                      "
                      @keydown.enter.prevent="
                        showCurrentPassword =
                          !showCurrentPassword
                      "
                      @keydown.space.prevent="
                        showCurrentPassword =
                          !showCurrentPassword
                      "
                    />
                  </template>
                </q-input>
              </div>

              <div class="form-field">
                <label for="new-password">
                  {{ $t('profile.newPassword') }}:
                </label>

                <q-input
                  id="new-password"
                  v-model="newPassword"
                  :type="
                    showNewPassword
                      ? 'text'
                      : 'password'
                  "
                  :aria-label="$t('profile.newPassword')"
                  autocomplete="new-password"
                  maxlength="15"
                  filled
                  dense
                  bg-color="grey-3"
                  :disable="loading"
                  :rules="[validateNewPassword]"
                  lazy-rules="ondemand"
                >
                  <template #append>
                    <q-icon
                      :name="
                        showNewPassword
                          ? 'visibility_off'
                          : 'visibility'
                      "
                      class="password-toggle"
                      role="button"
                      tabindex="0"
                      :aria-label="
                        showNewPassword
                          ? $t('profile.hidePassword')
                          : $t('profile.showPassword')
                      "
                      @click="
                        showNewPassword =
                          !showNewPassword
                      "
                      @keydown.enter.prevent="
                        showNewPassword =
                          !showNewPassword
                      "
                      @keydown.space.prevent="
                        showNewPassword =
                          !showNewPassword
                      "
                    />
                  </template>
                </q-input>
              </div>

              <div class="form-field">
                <label for="confirm-password">
                  {{ $t('profile.confirmPassword') }}:
                </label>

                <q-input
                  id="confirm-password"
                  v-model="confirmPassword"
                  :type="
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  "
                  :aria-label="$t('profile.confirmPassword')"
                  autocomplete="new-password"
                  maxlength="15"
                  filled
                  dense
                  bg-color="grey-3"
                  :disable="loading"
                  :rules="[validateConfirmPassword]"
                  lazy-rules="ondemand"
                >
                  <template #append>
                    <q-icon
                      :name="
                        showConfirmPassword
                          ? 'visibility_off'
                          : 'visibility'
                      "
                      class="password-toggle"
                      role="button"
                      tabindex="0"
                      :aria-label="
                        showConfirmPassword
                          ? $t('profile.hidePassword')
                          : $t('profile.showPassword')
                      "
                      @click="
                        showConfirmPassword =
                          !showConfirmPassword
                      "
                      @keydown.enter.prevent="
                        showConfirmPassword =
                          !showConfirmPassword
                      "
                      @keydown.space.prevent="
                        showConfirmPassword =
                          !showConfirmPassword
                      "
                    />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <q-btn
              type="submit"
              unelevated
              no-caps
              :label="$t('profile.saveChanges')"
              class="save-button"
              :loading="loading"
              :disable="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.profile-dialog {
  width: 90vw;
  max-width: 1050px;
  max-height: 90vh;
  border-radius: 0;
  background: white;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  padding: 28px 48px 10px;
}

.header-user h2 {
  margin: 0;
  font-size: 27px;
  font-weight: 600;
  line-height: 1.2;
}

.header-user span {
  font-size: 14px;
}

.close-button {
  position: absolute;
  right: 24px;
  top: 22px;
  color: #173743;
}

.dialog-content {
  padding: 18px 48px 40px;
}

.form-field {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-bottom: 18px;
}

.form-field label {
  font-size: 19px;
  font-weight: 500;
  color: #111;
}

.form-field :deep(.q-field__control) {
  border-radius: 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;
}

.password-section {
  margin-top: 22px;
}

.password-section .form-field {
  margin-bottom: 0;
}

.password-toggle {
  color: #666;
  cursor: pointer;
}

.password-toggle:hover {
  color: #0b717f;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 36px;
}

.save-button {
  min-width: 180px;
  min-height: 42px;
  border-radius: 0;
  background-color: #0b717f !important;
  color: white !important;
  font-size: 16px;
}

@media (max-width: 700px) {
  .dialog-header {
    padding: 24px;
  }

  .dialog-content {
    padding: 12px 24px 30px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .password-section .form-field {
    margin-bottom: 18px;
  }

  .form-actions {
    margin-top: 20px;
  }

  .save-button {
    width: 100%;
  }
}
</style>
