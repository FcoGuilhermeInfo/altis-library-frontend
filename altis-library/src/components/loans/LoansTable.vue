<script setup lang="ts">
import { formatDate } from '@/utils/dateUtils';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { QTableColumn } from 'quasar';
import type { LoanResponse, LoanStatus } from '@/types/loan';

const { t } = useI18n({ useScope: 'global' });

const props = withDefaults(
  defineProps<{
    loans: LoanResponse[];
    loading?: boolean;
    showActions?: boolean;
  }>(),
  {
    loading: false,
    showActions: false,
  },
);

const emit = defineEmits<{
  viewDetails: [id: string];
}>();

const columns = computed<QTableColumn<LoanResponse>[]>(() => {
  const baseColumns: QTableColumn<LoanResponse>[] = [
    {
      name: 'userFullName',
      label: t('loans.borrower'),
      field: 'userFullName',
      align: 'left',
    },
    {
      name: 'bookTitle',
      label: t('loans.book'),
      field: 'bookTitle',
      align: 'left',
    },
    {
      name: 'borrowedAt',
      label: t('loans.borrowedAt'),
      field: 'borrowedAt',
      align: 'center',
    },
    {
      name: 'dueDate',
      label: t('loans.dueDate'),
      field: 'dueDate',
      align: 'center',
    },
    {
      name: 'returnedAt',
      label: t('loans.returnedAt'),
      field: 'returnedAt',
      align: 'center',
    },
    {
      name: 'status',
      label: t('common.status'),
      field: 'status',
      align: 'center',
    },
  ];

  if (props.showActions) {
    baseColumns.push({
      name: 'actions',
      label: t('common.actions'),
      field: 'id',
      align: 'center',
    });
  }

  return baseColumns;
});

function statusLabel(status: LoanStatus): string {
  switch (status) {
    case 'BORROWED':
      return t('loans.status.borrowed');
    case 'OVERDUE':
      return t('loans.status.overdue');
    case 'RETURNED':
      return t('loans.status.returned');
  }
}

function statusColor(status: LoanStatus): string {
  switch (status) {
    case 'BORROWED':
      return 'primary';
    case 'OVERDUE':
      return 'negative';
    case 'RETURNED':
      return 'positive';
  }
}
</script>

<template>
  <q-table
    :rows="loans"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :pagination="{ rowsPerPage: 0 }"
    flat
    hide-bottom
    class="loans-table"
  >
    <template #body-cell-userFullName="slotProps">
      <q-td :props="slotProps" class="loan-user">
        {{ slotProps.row.userFullName }}
      </q-td>
    </template>

    <template #body-cell-borrowedAt="slotProps">
      <q-td :props="slotProps">
        {{ formatDate(slotProps.row.borrowedAt) }}
      </q-td>
    </template>

    <template #body-cell-dueDate="slotProps">
      <q-td :props="slotProps">
        {{ formatDate(slotProps.row.dueDate) }}
      </q-td>
    </template>

    <template #body-cell-returnedAt="slotProps">
      <q-td :props="slotProps">
        {{ formatDate(slotProps.row.returnedAt) }}
      </q-td>
    </template>

    <template #body-cell-status="slotProps">
      <q-td :props="slotProps">
        <q-badge
          rounded
          :color="statusColor(slotProps.row.status)"
          :label="statusLabel(slotProps.row.status)"
          class="loan-status"
        />
      </q-td>
    </template>

    <template #body-cell-actions="slotProps">
      <q-td :props="slotProps">
        <q-btn
          flat
          round
          dense
          icon="edit_square"
          color="primary"
          :aria-label="$t('loans.view')"
          @click="emit('viewDetails', slotProps.row.id)"
        >
          <q-tooltip>
            {{ $t('loans.view') }}
          </q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width text-center q-pa-lg">
        {{ $t('loans.empty') }}
      </div>
    </template>
  </q-table>
</template>

<style scoped>
.loans-table {
  width: 100%;
}

.loan-user {
  font-weight: 600;
}

.loan-status {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

.loans-table :deep(thead th) {
  color: #333;
  font-size: 13px;
  font-weight: 500;
}

.loans-table :deep(tbody td) {
  color: #666;
  font-size: 12px;
}

.loans-table :deep(tbody td.loan-user) {
  color: #222;
}
</style>
