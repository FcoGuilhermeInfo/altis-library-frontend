<script setup lang="ts">
import { getApiErrorKey, reportApiError } from '@/utils/apiErrors';
import { useI18n } from 'vue-i18n';
import { ref, onMounted, watch } from 'vue';
import { notifyLocalized } from '@/utils/localizedNotify';
import { userService } from '@/services/userService';
import type { UserResponse } from '@/types/user';
import UsersTable from '@/components/users/UsersTable.vue';
import UserDetailsDialog from '@/components/users/UserDetailsDialog.vue';

const { t } = useI18n({ useScope: 'global' });

const users = ref<UserResponse[]>([]);
const search = ref('');
const currentPage = ref(1);
const totalElements = ref(0);

const loading = ref(false);
const updatingId = ref<string | null>(null);

const selectedUser = ref<UserResponse | null>(null);
const showDetails = ref(false);

let requestId = 0;

async function loadUsers() {
  const currentRequest = ++requestId;

  loading.value = true;

  try {
    const response = await userService.findAll(search.value, currentPage.value, 10);

    if (currentRequest !== requestId) return;

    users.value = response.content;
    totalElements.value = response.totalElements;
  } catch (error: unknown) {
    reportApiError(error);
    if (currentRequest !== requestId) return;

    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'users.loadError')),
    }));
  } finally {
    if (currentRequest === requestId) {
      loading.value = false;
    }
  }
}

function changePage(page: number) {
  currentPage.value = page;
  void loadUsers();
}

function viewDetails(user: UserResponse) {
  selectedUser.value = user;
  showDetails.value = true;
}

async function changeStatus(user: UserResponse) {
  updatingId.value = user.id;

  try {
    const updatedUser = user.active
      ? await userService.inactivate(user.id)
      : await userService.activate(user.id);

    users.value = users.value.map((currentUser) =>
      currentUser.id === updatedUser.id ? updatedUser : currentUser,
    );

    notifyLocalized(() => ({
      type: 'positive',
      message: updatedUser.active ? t('users.activated') : t('users.inactivated'),
    }));
  } catch (error: unknown) {
    reportApiError(error);
    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'users.statusError')),
    }));
  } finally {
    updatingId.value = null;
  }
}

watch(search, () => {
  currentPage.value = 1;
  void loadUsers();
});

onMounted(() => {
  void loadUsers();
});
</script>

<template>
  <q-page class="users-page">
    <h1 class="users-title">
      {{ $t('menu.users') }}
    </h1>

    <q-card flat class="users-card">
      <q-card-section>
        <q-input
          v-model="search"
          filled
          dense
          rounded
          clearable
          debounce="400"
          :placeholder="$t('users.search')"
          class="users-search"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section>
        <UsersTable
          :users="users"
          :loading="loading"
          :page="currentPage"
          :total-elements="totalElements"
          :updating-id="updatingId"
          @page-change="changePage"
          @view-details="viewDetails"
          @status-change="changeStatus"
        />
      </q-card-section>

      <q-card-actions align="between" class="pagination-section">
        <span class="pagination-info">
          {{
            $t(
              'pagination.users',
              {
                start: $n(totalElements === 0 ? 0 : (currentPage - 1) * 10 + 1),
                end: $n(Math.min(currentPage * 10, totalElements)),
                total: $n(totalElements),
              },
              totalElements,
            )
          }}
        </span>

        <q-pagination
          v-model="currentPage"
          :max="Math.max(1, Math.ceil(totalElements / 10))"
          :max-pages="5"
          boundary-numbers
          direction-links
          active-color="dark"
          color="grey-8"
          @update:model-value="changePage"
        />
      </q-card-actions>
    </q-card>

    <UserDetailsDialog v-model="showDetails" :user="selectedUser" />
  </q-page>
</template>

<style scoped>
.users-page {
  padding: 30px 42px;
  background-color: #faf8f8;
}

.users-title {
  margin: 0 0 24px 14px;
  color: #0b5e69;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.3;
}

.users-card {
  width: 100%;
  min-height: 540px;
  border-radius: 0;
  background-color: #fff;
  box-shadow: 0 2px 3px rgb(0 0 0 / 15%);
}

.users-search {
  width: 360px;
  max-width: 100%;
  margin: 0 10px;
}

.pagination-section {
  padding: 12px 24px;
}

.pagination-info {
  font-size: 14px;
}
</style>
