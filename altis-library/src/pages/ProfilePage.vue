<script setup lang="ts">
import { getApiErrorKey, reportApiError } from '@/utils/apiErrors';
import { formatDate } from '@/utils/dateUtils';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref } from 'vue';
import { notifyLocalized } from '@/utils/localizedNotify';

import { api } from '@/boot/axios';
import { useAuthStore } from '@/stores/authStore';

import ProfileEditDialog from '@/components/profile/ProfileEditDialog.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const { t } = useI18n({ useScope: 'global' });

interface ProfileData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address: string;
}

interface ProfileUpdate {
  name: string;
  phone: string;
  address: string;
}

const authStore = useAuthStore();

const profile = ref<ProfileData | null>(null);
const loading = ref(false);
const saving = ref(false);

const showEditDialog = ref(false);
const showConfirmDialog = ref(false);

const pendingUpdate = ref<ProfileUpdate | null>(null);

const isAdmin = computed(() => authStore.isAdmin);

const userRole = computed(() => (isAdmin.value ? t('profile.admin') : t('loans.borrower')));

async function loadProfile() {
  const userId = authStore.user?.id;

  if (!userId) {
    notifyLocalized(() => ({
      type: 'negative',
      message: t('profile.unauthenticated'),
    }));
    return;
  }

  loading.value = true;

  try {
    const response = await api.get<ProfileData>(`/users/${userId}`);

    profile.value = response.data;
  } catch (error: unknown) {
    reportApiError(error);
    profile.value = null;

    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'profile.loadError')),
    }));
  } finally {
    loading.value = false;
  }
}

function openEditDialog() {
  if (!profile.value || isAdmin.value) return;

  showEditDialog.value = true;
}

function requestSave(data: ProfileUpdate) {
  if (saving.value || showConfirmDialog.value) return;

  pendingUpdate.value = data;
  showConfirmDialog.value = true;
}

function onConfirmDialogChange(value: boolean) {
  if (!value && !saving.value) {
    pendingUpdate.value = null;
  }
}

async function confirmSave() {
  const data = pendingUpdate.value;
  const userId = authStore.user?.id;

  if (!data || !userId || saving.value || isAdmin.value) return;

  saving.value = true;

  try {
    const response = await api.patch<ProfileData>(`/users/${userId}`, data);

    profile.value = response.data;
    pendingUpdate.value = null;
    showConfirmDialog.value = false;
    showEditDialog.value = false;

    notifyLocalized(() => ({
      type: 'positive',
      message: t('profile.updated'),
    }));
  } catch (error: unknown) {
    reportApiError(error);
    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'profile.updateError')),
    }));
  } finally {
    saving.value = false;
  }
}

function formatCpf(value: string | null | undefined): string {
  if (!value) return '-';

  const digits = value.replace(/\D/g, '');

  if (digits.length !== 11) return value;

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatPhone(value: string | null | undefined): string {
  if (!value) return '-';

  const digits = value.replace(/\D/g, '');

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return value;
}

onMounted(() => {
  void loadProfile();
});
</script>

<template>
  <q-page class="profile-page">
    <h1 class="profile-title">
      {{ $t('menuprofile.profile') }}
    </h1>

    <div v-if="loading" class="feedback-container">
      <q-spinner :aria-label="$t('common.loading')" size="48px" color="primary" />
    </div>

    <q-card v-else-if="profile" flat class="profile-card">
      <q-card-section class="profile-header">
        <q-icon name="account_circle" size="56px" color="dark" />

        <div class="profile-identity">
          <strong>{{ profile.name }}</strong>
          <span>{{ userRole }}</span>
        </div>

        <q-space />

        <q-btn
          v-if="!isAdmin"
          unelevated
          no-caps
          :label="$t('profile.edit')"
          class="edit-button"
          @click="openEditDialog"
        />
      </q-card-section>

      <q-card-section class="profile-information">
        <div class="profile-field">
          <strong>{{ $t('common.fullName') }}:</strong>
          <span>{{ profile.name }}</span>
        </div>

        <div class="profile-field">
          <strong>{{ $t('register.email') }}:</strong>
          <span class="profile-email">
            {{ profile.email }}
          </span>
        </div>

        <template v-if="!isAdmin">
          <div class="profile-details-grid">
            <div class="profile-field">
              <strong>{{ $t('register.cpf') }}:</strong>
              <span>{{ formatCpf(profile.cpf) }}</span>
            </div>

            <div class="profile-field">
              <strong>{{ $t('register.birthDate') }}:</strong>
              <span>{{ formatDate(profile.birthDate) }}</span>
            </div>

            <div class="profile-field">
              <strong>{{ $t('register.phone') }}:</strong>
              <span>{{ formatPhone(profile.phone) }}</span>
            </div>
          </div>

          <div class="profile-field">
            <strong>{{ $t('register.address') }}:</strong>
            <span>{{ profile.address || '-' }}</span>
          </div>
        </template>

        <div class="profile-field">
          <strong>{{ $t('register.password') }}:</strong>
          <span>********</span>
        </div>
      </q-card-section>
    </q-card>

    <div v-else class="feedback-container">
      <p>{{ $t('profile.unavailable') }}</p>

      <q-btn unelevated no-caps color="primary" :label="$t('common.retry')" @click="loadProfile" />
    </div>

    <ProfileEditDialog
      v-if="profile && !isAdmin"
      v-model="showEditDialog"
      :profile="profile"
      :loading="saving"
      @save="requestSave"
    />

    <ConfirmDialog
      v-model="showConfirmDialog"
      :message="$t('profile.confirmUpdate')"
      :loading="saving"
      @confirm="confirmSave"
      @update:model-value="onConfirmDialogChange"
    />
  </q-page>
</template>

<style scoped>
.profile-page {
  min-height: 100%;
  padding: 20px 30px 40px;
  background-color: #faf8f8;
}

.profile-title {
  margin: 0 0 14px;
  color: #0b5e69;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.3;
}

.profile-card {
  width: 100%;
  min-height: 440px;
  padding: 10px 12px 32px;
  border-radius: 0;
  background-color: white;
  box-shadow: 0 2px 2px rgb(0 0 0 / 20%);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 28px;
}

.profile-identity {
  display: flex;
  flex-direction: column;
}

.profile-identity strong {
  font-size: 22px;
  font-weight: 600;
  color: #111;
}

.profile-identity span {
  font-size: 13px;
  color: #222;
}

.edit-button {
  min-width: 100px;
  padding: 5px 16px;
  border-radius: 0;
  background-color: #0b717f !important;
  color: white !important;
}

.profile-information {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 34px 30px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  color: #111;
  font-size: 16px;
  line-height: 1.2;
}

.profile-field strong {
  font-weight: 500;
}

.profile-email {
  text-decoration: underline;
  overflow-wrap: anywhere;
}

.profile-details-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

.feedback-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 300px;
}

@media (max-width: 700px) {
  .profile-page {
    padding: 18px 14px 30px;
  }

  .profile-header {
    padding: 16px 12px;
  }

  .profile-information {
    padding: 16px 12px;
  }

  .profile-details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
