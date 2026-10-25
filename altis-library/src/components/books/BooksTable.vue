<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableColumn } from 'quasar';
import type { BookResponse } from '@/types/book';

const { t, n } = useI18n({ useScope: 'global' });

defineProps<{
  books: BookResponse[];
  loading: boolean;
  page: number;
  totalElements: number;
}>();

const emit = defineEmits<{
  edit: [book: BookResponse];
}>();

const columns = computed<QTableColumn<BookResponse>[]>(() => [
  {
    name: 'title',
    label: t('books.title'),
    field: 'title',
    align: 'left',
  },
  {
    name: 'author',
    label: t('books.author'),
    field: 'author',
    align: 'left',
  },
  {
    name: 'releaseYear',
    label: t('books.year'),
    field: 'releaseYear',
    align: 'left',
  },
  {
    name: 'publisherName',
    label: t('books.publisher'),
    field: 'publisherName',
    align: 'left',
  },
  {
    name: 'totalQuantity',
    label: t('books.total'),
    field: 'totalQuantity',
    format: (value: number) => n(value),
    align: 'center',
  },
  {
    name: 'availableQuantity',
    label: t('books.available'),
    field: 'availableQuantity',
    format: (value: number) => n(value),
    align: 'center',
  },
  {
    name: 'borrowedQuantity',
    label: t('books.borrowed'),
    field: 'borrowedQuantity',
    format: (value: number) => n(value),
    align: 'center',
  },
  {
    name: 'actions',
    label: t('common.actions'),
    field: 'id',
    align: 'center',
  },
]);
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
          :aria-label="$t('books.edit')"
          @click="emit('edit', props.row)"
        >
          <q-tooltip>{{ $t('books.edit') }}</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width text-center q-pa-lg">
        {{ $t('books.empty') }}
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
