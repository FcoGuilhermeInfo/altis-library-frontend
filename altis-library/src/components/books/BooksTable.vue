
<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import type { BookResponse } from '@/types/book'

defineProps<{
  books: BookResponse[]
  loading: boolean
  page: number
  totalElements: number
}>()

const emit = defineEmits<{
  edit: [book: BookResponse]
}>()

const columns: QTableColumn<BookResponse>[] = [
  {
    name: 'title',
    label: 'Título',
    field: 'title',
    align: 'left',
  },
  {
    name: 'author',
    label: 'Autor',
    field: 'author',
    align: 'left',
  },
  {
    name: 'releaseYear',
    label: 'Ano',
    field: 'releaseYear',
    align: 'left',
  },
  {
    name: 'publisherName',
    label: 'Editora',
    field: 'publisherName',
    align: 'left',
  },
  {
    name: 'totalQuantity',
    label: 'Qtd. Total',
    field: 'totalQuantity',
    align: 'center',
  },
  {
    name: 'availableQuantity',
    label: 'Qtd. Disponível',
    field: 'availableQuantity',
    align: 'center',
  },
  {
    name: 'borrowedQuantity',
    label: 'Qtd. Emprestada',
    field: 'borrowedQuantity',
    align: 'center',
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'id',
    align: 'center',
  },
]
</script>

<template>
  <q-table
    :rows="books"
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
    class="books-table"
  >
    <template #body-cell-title="props">
      <q-td :props="props" class="book-title">
        {{ props.row.title }}
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
          aria-label="Editar livro"
          @click="emit('edit', props.row)"
        >
          <q-tooltip>Editar livro</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width text-center q-pa-lg">
        Nenhum livro encontrado.
      </div>
    </template>
  </q-table>
</template>

<style scoped>
.books-table {
  width: 100%;
}

.book-title {
  font-weight: 600;
}

.books-table :deep(thead th) {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.books-table :deep(tbody td) {
  font-size: 13px;
  color: #666;
}

.books-table :deep(tbody td.book-title) {
  color: #222;
}
</style>
