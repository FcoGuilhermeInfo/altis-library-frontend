<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableColumn } from 'quasar';
import type { UserResponse } from '@/types/user';

const { t } = useI18n({ useScope: 'global' });

defineProps<{
  users: UserResponse[];
  loading: boolean;
  page: number;
  totalElements: number;
  updatingId: string | null;
}>();

const emit = defineEmits<{
  pageChange: [page: number];
  viewDetails: [user: UserResponse];
  statusChange: [user: UserResponse];
}>();

const columns = computed<QTableColumn<UserResponse>[]>(() => [
  {
    name: 'name',
    label: t('register.name'),
    field: 'name',
    align: 'left',
  },
  {
    name: 'cpf',
    label: t('register.cpf'),
    field: 'cpf',
    align: 'left',
  },
  {
    name: 'email',
    label: t('register.email'),
    field: 'email',
    align: 'left',
  },
  {
    name: 'phone',
    label: t('register.phone'),
    field: 'phone',
    align: 'left',
  },
  {
    name: 'active',
    label: t('common.status'),
    field: 'active',
    align: 'center',
  },
  {
    name: 'actions',
    label: t('common.actions'),
    field: 'id',
    align: 'center',
  },
]);

function formatCpf(value: string): string {
  return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

function formatPhone(value: string): string {
  if (value.length === 11) {
    return value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }

  if (value.length === 10) {
    return value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }

  return value;
}
</script>

<template>
  <q-table
    :rows="users"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :pagination="{
      page,
      rowsPerPage: 10,
      rowsNumber: totalElements,
    }"
    hide-bottom
    flat
    class="users-table"
  >
    <template #body-cell-name="props">
      <q-td :props="props" class="user-name">
        {{ props.row.name }}
      </q-td>
    </template>

    <template #body-cell-cpf="props">
      <q-td :props="props">
        {{ formatCpf(props.row.cpf) }}
      </q-td>
    </template>

    <template #body-cell-phone="props">
      <q-td :props="props">
        {{ formatPhone(props.row.phone) }}
      </q-td>
    </template>

    <template #body-cell-active="props">
      <q-td :props="props">
        <q-badge
          :color="props.row.active ? 'positive' : 'negative'"
          :label="props.row.active ? $t('users.active') : $t('users.inactive')"
          class="status-badge"
        />
      </q-td>
    </template>

    <template #body-cell-actions="props">
      <q-td :props="props">
        <div class="row no-wrap items-center justify-center q-gutter-sm">
          <q-btn
            flat
            round
            dense
            icon="visibility"
            color="primary"
            :aria-label="$t('users.view')"
            @click="emit('viewDetails', props.row)"
          >
            <q-tooltip>
              {{ $t('users.details') }}
            </q-tooltip>
          </q-btn>

          <q-toggle
            :aria-label="props.row.active ? $t('users.inactivate') : $t('users.activate')"
            :model-value="props.row.active"
            color="positive"
            :disable="updatingId !== null"
            @update:model-value="emit('statusChange', props.row)"
          >
            <q-tooltip>
              {{ props.row.active ? $t('users.inactivate') : $t('users.activate') }}
            </q-tooltip>
          </q-toggle>
        </div>
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width text-center q-pa-lg">
        {{ $t('users.empty') }}
      </div>
    </template>
  </q-table>
</template>

<style scoped>
.users-table {
  width: 100%;
}

.user-name {
  font-weight: 600;
}

.status-badge {
  min-width: 74px;
  justify-content: center;
  border-radius: 12px;
  font-size: 13px;
}

.users-table :deep(thead th) {
  font-size: 15px;
  font-weight: 500;
  color: #222;
}

.users-table :deep(tbody td) {
  font-size: 13px;
}
</style>
