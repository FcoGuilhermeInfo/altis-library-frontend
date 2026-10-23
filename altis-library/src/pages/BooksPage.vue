
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'

import BooksTable from '@/components/books/BooksTable.vue'
import { bookService } from '@/services/bookService'
import type { BookResponse } from '@/types/book'
import BookFormDialog from '@/components/books/BookFormDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

import type { BookRequest } from '@/types/book'

const $q = useQuasar()

const books = ref<BookResponse[]>([])
const search = ref<string | null>('')
const currentPage = ref(1)
const totalElements = ref(0)
const loading = ref(false)

const pageSize = 10

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalElements.value / pageSize)),
)

const showBookDialog = ref(false)
const selectedBook = ref<BookResponse | null>(null)

const savingBook = ref(false)
const showConfirmDialog = ref(false)

type PendingBookAction =
  | { type: 'update'; id: string; data: BookRequest }
  | { type: 'delete'; id: string }

const pendingAction = ref<PendingBookAction | null>(null)

const confirmMessage = computed(() =>
  pendingAction.value?.type === 'delete'
    ? 'Você tem certeza que deseja excluir todos os dados?'
    : 'Você tem certeza que deseja realizar essas alterações?',
)

let requestId = 0

async function loadBooks() {
  const currentRequest = ++requestId
  loading.value = true

  try {
    const response = await bookService.findAll(
      search.value ?? '',
      currentPage.value,
      pageSize,
    )

    if (currentRequest !== requestId) return

    books.value = response.content
    totalElements.value = response.totalElements
  } catch {
    if (currentRequest !== requestId) return

    $q.notify({
      type: 'negative',
      message: 'Não foi possível carregar os livros.',
    })
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
    }
  }
}

function changePage(page: number) {
  if (page === currentPage.value) return

  currentPage.value = page
  void loadBooks()
}

function openCreateDialog() {
  selectedBook.value = null
  showBookDialog.value = true
}

function openEditDialog(book: BookResponse) {
  selectedBook.value = book
  showBookDialog.value = true
}


async function saveBook(data: BookRequest) {
  if (savingBook.value || showConfirmDialog.value) return

  if (selectedBook.value) {
    pendingAction.value = {
      type: 'update',
      id: selectedBook.value.id,
      data,
    }

    showConfirmDialog.value = true
    return
  }

  savingBook.value = true

  try {
    await bookService.create(data)

    showBookDialog.value = false

    $q.notify({
      type: 'positive',
      message: 'Livro cadastrado com sucesso!',
    })

    await loadBooks()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Não foi possível cadastrar o livro.',
    })
  } finally {
    savingBook.value = false
  }
}

function deleteBook(id: string) {
  if (savingBook.value || showConfirmDialog.value) return

  pendingAction.value = {
    type: 'delete',
    id,
  }

  showConfirmDialog.value = true
}


async function confirmBookAction() {
  const action = pendingAction.value

  if (!action || savingBook.value) return

  savingBook.value = true

  try {
    if (action.type === 'update') {
      await bookService.update(action.id, action.data)

      $q.notify({
        type: 'positive',
        message: 'Livro atualizado com sucesso!',
      })
    } else {
      await bookService.delete(action.id)

      $q.notify({
        type: 'positive',
        message: 'Livro excluído com sucesso!',
      })

      if (
        books.value.length === 1 &&
        currentPage.value > 1
      ) {
        currentPage.value--
      }
    }

    showConfirmDialog.value = false
    showBookDialog.value = false
    pendingAction.value = null
    selectedBook.value = null

    await loadBooks()
  } catch {
    $q.notify({
      type: 'negative',
      message: action.type === 'delete'
        ? 'Não foi possível excluir o livro. Verifique se existem empréstimos relacionados.'
        : 'Não foi possível atualizar o livro. Verifique os dados e a quantidade de exemplares.',
    })
  } finally {
    savingBook.value = false
  }
}

function onConfirmDialogChange(value: boolean) {
  if (!value) {
    pendingAction.value = null
  }
}


watch(search, () => {
  currentPage.value = 1
  void loadBooks()
})

onMounted(() => {
  void loadBooks()
})
</script>

<template>
  <q-page class="books-page">
    <h1 class="books-title">
      Livros
    </h1>

    <q-card flat class="books-card">
      <q-card-section class="books-toolbar">
        <q-input
          v-model="search"
          filled
          dense
          rounded
          clearable
          debounce="400"
          placeholder="Buscar Livro por Nome"
          class="books-search"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          unelevated
          no-caps
          icon="add"
          label="Cadastrar novo livro"
          class="create-button"
          @click="openCreateDialog"
        />
      </q-card-section>

      <q-card-section class="books-table-section">
        <BooksTable
          :books="books"
          :loading="loading"
          :page="currentPage"
          :total-elements="totalElements"
          @edit="openEditDialog"
        />
      </q-card-section>

      <q-card-actions
        align="between"
        class="pagination-section"
      >
        <span class="pagination-info">
          Mostrando
          {{ totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}
          à
          {{ Math.min(currentPage * pageSize, totalElements) }}
          de {{ totalElements }} livros
        </span>

        <q-pagination
          :model-value="currentPage"
          :max="totalPages"
          :max-pages="5"
          boundary-numbers
          direction-links
          active-color="dark"
          color="grey-8"
          @update:model-value="changePage"
        />
      </q-card-actions>
    </q-card>

   
    <BookFormDialog
    v-model="showBookDialog"
    :book="selectedBook"
    :loading="savingBook"
    @save="saveBook"
    @delete="deleteBook"
    />

    <ConfirmDialog
    v-model="showConfirmDialog"
    :message="confirmMessage"
    :loading="savingBook"
    @confirm="confirmBookAction"
    @update:model-value="onConfirmDialogChange"
    />

  </q-page>
</template>

<style scoped>
.books-page {
  padding: 30px 42px;
  background-color: #faf8f8;
}

.books-title {
  margin: 0 0 24px 14px;
  color: #0b5e69;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.3;
}

.books-card {
  width: 100%;
  min-height: 540px;
  border-radius: 0;
  background-color: white;
  box-shadow: 0 2px 3px rgb(0 0 0 / 15%);
}

.books-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 30px;
}

.books-search {
  width: 440px;
  max-width: 100%;
}

.create-button {
  background-color: #0b717f !important;
  color: white !important;
  font-size: 16px;
}

.books-table-section {
  padding: 28px 30px 8px;
}

.pagination-section {
  padding: 16px 30px;
}

.pagination-info {
  font-size: 14px;
}

.temporary-dialog {
  width: 500px;
  max-width: 90vw;
}
</style>
