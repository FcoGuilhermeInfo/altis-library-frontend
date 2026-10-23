
<script setup lang="ts">
import { computed } from 'vue'
import type { QTableColumn } from 'quasar'
import type { LoanResponse, LoanStatus } from '@/types/loan'

const props = withDefaults(
  defineProps<{
    loans: LoanResponse[]
    loading?: boolean
    showActions?: boolean
  }>(),
  {
    loading: false,
    showActions: false,
  },
)

const emit = defineEmits<{
  viewDetails: [id: string]
}>()

const columns = computed<QTableColumn<LoanResponse>[]>(() => {
  const baseColumns: QTableColumn<LoanResponse>[] = [
    {
      name: 'userFullName',
      label: 'Locatário',
      field: 'userFullName',
      align: 'left',
    },
    {
      name: 'bookTitle',
      label: 'Livro',
      field: 'bookTitle',
      align: 'left',
    },
    {
      name: 'borrowedAt',
      label: 'Data Empréstimo',
      field: 'borrowedAt',
      align: 'center',
    },
    {
      name: 'dueDate',
      label: 'Devolução Prevista',
      field: 'dueDate',
      align: 'center',
    },
    {
      name: 'returnedAt',
      label: 'Data Devolução',
      field: 'returnedAt',
      align: 'center',
    },
    {
      name: 'status',
      label: 'Status',
      field: 'status',
      align: 'center',
    },
  ]

  if (props.showActions) {
    baseColumns.push({
      name: 'actions',
      label: 'Ações',
      field: 'id',
      align: 'center',
    })
  }

  return baseColumns
})

function formatDate(value: string | null): string {
  if (!value) return '-'

  const [year, month, day] = value.slice(0, 10).split('-')

  if (!year || !month || !day) return '-'

  return `${day}/${month}/${year}`
}

function statusLabel(status: LoanStatus): string {
  switch (status) {
    case 'BORROWED':
      return 'Em andamento'
    case 'OVERDUE':
      return 'Atrasado'
    case 'RETURNED':
      return 'Finalizado'
  }
}

function statusColor(status: LoanStatus): string {
  switch (status) {
    case 'BORROWED':
      return 'primary'
    case 'OVERDUE':
      return 'negative'
    case 'RETURNED':
      return 'positive'
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
          aria-label="Visualizar empréstimo"
          @click="emit('viewDetails', slotProps.row.id)"
        >
          <q-tooltip>
            Visualizar empréstimo
          </q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width text-center q-pa-lg">
        Nenhum empréstimo encontrado.
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
