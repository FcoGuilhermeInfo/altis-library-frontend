
<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import type { PublisherResponse } from '@/types/publisher'

defineProps<{
  publishers: PublisherResponse[]
  loading: boolean
  page: number
  totalElements: number
}>()

const emit = defineEmits<{
  edit: [publisher: PublisherResponse]
}>()

const columns: QTableColumn<PublisherResponse>[] = [
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
  },
  {
    name: 'email',
    label: 'E-mail',
    field: 'email',
    align: 'left',
  },
  {
    name: 'phone',
    label: 'Telefone',
    field: 'phone',
    align: 'left',
  },
  {
    name: 'site',
    label: 'Site',
    field: 'site',
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'id',
    align: 'center',
  },
]

function formatPhone(value: string): string {
  if (value.length === 11) {
    return value.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      '($1) $2-$3',
    )
  }

  if (value.length === 10) {
    return value.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      '($1) $2-$3',
    )
  }

  return value
}
</script>

<template>
  <q-table
    :rows="publishers"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :pagination="{
      page,
      rowsPerPage: 10,
      rowsNumber: totalElements,
    }"
    flat
    hide-bottom
    class="publishers-table"
  >
    <template #body-cell-name="props">
      <q-td :props="props" class="publisher-name">
        {{ props.row.name }}
      </q-td>
    </template>

    <template #body-cell-phone="props">
      <q-td :props="props">
        {{ formatPhone(props.row.phone) }}
      </q-td>
    </template>

    <template #body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          flat
          round
          dense
          icon="edit_square"
          color="primary"
          aria-label="Editar editora"
          @click="emit('edit', props.row)"
        >
          <q-tooltip>Editar editora</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width text-center q-pa-lg">
        Nenhuma editora encontrada.
      </div>
    </template>
  </q-table>
</template>

<style scoped>
.publishers-table {
  width: 100%;
}

.publisher-name {
  font-weight: 600;
}

.publishers-table :deep(thead th) {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.publishers-table :deep(tbody td) {
  font-size: 14px;
  color: #666;
}

.publishers-table :deep(tbody td.publisher-name) {
  color: #222;
}
</style>
