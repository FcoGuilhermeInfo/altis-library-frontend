<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';

import AdminDashboard from '@/components/dashboard/AdminDashboard.vue';
import UserDashboard from '@/components/dashboard/UserDashboard.vue';

const authStore = useAuthStore();
</script>

<template>
  <q-page class="dashboard-page">
    <AdminDashboard v-if="authStore.isAdmin" />

    <UserDashboard v-else-if="authStore.isUser" />

    <div v-else class="access-message">
      {{ $t('dashboard.permissionError') }}
    </div>
  </q-page>
</template>

<style scoped>
.dashboard-page {
  background-color: #faf8f8;
  min-height: 100%;
}

.access-message {
  padding: 40px;
  text-align: center;
  color: #666;
}
</style>
