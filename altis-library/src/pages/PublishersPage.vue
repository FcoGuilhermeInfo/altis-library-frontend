
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'

import PublishersTable from '@/components/publishers/PublishersTable.vue'
import { publisherService } from '@/services/publisherService'
import type { PublisherResponse, PublisherRequest } from '@/types/publisher'
import PublisherFormDialog from '@/components/publishers/PublisherFormDialog.vue'
import axios from 'axios'

const selectedPublisher = ref<PublisherResponse | null>(null)
const showPublisherDialog = ref(false)
const savingPublisher = ref(false)

const $q = useQuasar()

const publishers = ref<PublisherResponse[]>([])
const search = ref<string | null>('')
const currentPage = ref(1)
const totalElements = ref(0)
const loading = ref(false)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalElements.value / 10)),
)

let requestId = 0

async function loadPublishers() {
  const currentRequest = ++requestId
  loading.value = true

  try {
    const response = await publisherService.findAll(
      search.value ?? '',
      currentPage.value,
      10,
    )

    if (currentRequest !== requestId) return

    publishers.value = response.content
    totalElements.value = response.totalElements
  } catch {
    if (currentRequest !== requestId) return

    $q.notify({
      type: 'negative',
      message: 'Não foi possível carregar as editoras.',
    })
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
    }
  }
}

function changePage(page: number) {
  currentPage.value = page
  void loadPublishers()
}


function openCreateDialog() {
  selectedPublisher.value = null
  showPublisherDialog.value = true
}

function openEditDialog(publisher: PublisherResponse) {
  selectedPublisher.value = publisher
  showPublisherDialog.value = true
}

async function savePublisher(data: PublisherRequest){
    savingPublisher.value = true

    try {
        if(selectedPublisher.value){
            await publisherService.update(
                selectedPublisher.value.id,
                data,
            )

            $q.notify({
                type: 'positive',
                message: 'Editora atualizada com sucesso!'
            })
        } else {
            await publisherService.create(data)

            $q.notify({
                type: 'positive',
                message: 'Editora cadastrada com sucesso!',
            })
        }

        showPublisherDialog.value = false

        await loadPublishers()
    } catch {
        $q.notify({
            type: 'negative',
            message: 'Não foi possível salvar a editora.',
        })
    } finally {
        savingPublisher.value = false
    }
}


function deletePublisher(id: string) {
  if (savingPublisher.value) return

  $q.dialog({
    title: 'Excluir Editora',
    message: 'Tem certeza que deseja excluir esta editora?',
    cancel: {
      label: 'Cancelar',
      flat: true,
      noCaps: true,
    },
    ok: {
      label: 'Excluir',
      color: 'negative',
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    void confirmDeletePublisher(id)
  })
}

async function confirmDeletePublisher(id: string) {
  savingPublisher.value = true

  try {
    await publisherService.delete(id)

    showPublisherDialog.value = false

    $q.notify({
      type: 'positive',
      message: 'Editora excluída com sucesso!',
    })

    if (publishers.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }

    await loadPublishers()
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 409
    ) {
      $q.notify({
        type: 'negative',
        message:
          'Não é possível excluir uma editora que possui livros relacionados.',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Não foi possível excluir a editora.',
      })
    }
  } finally {
    savingPublisher.value = false
  }
}


watch(search, () => {
  currentPage.value = 1
  void loadPublishers()
})

onMounted(() => {
  void loadPublishers()
})
</script>

<template>
  <q-page class="publishers-page">
    <h1 class="publishers-title">
      Editoras
    </h1>

    <q-card flat class="publishers-card">
      <q-card-section class="publishers-toolbar">
        <q-input
          v-model="search"
          filled
          rounded
          dense
          clearable
          debounce="400"
          placeholder="Buscar Editora por Nome"
          class="publishers-search"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          unelevated
          no-caps
          icon="add"
          label="Cadastrar nova editora"
          class="create-button"
          @click="openCreateDialog"
        />
      </q-card-section>

      <q-card-section class="publishers-table-section">
        <PublishersTable
          :publishers="publishers"
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
          {{ totalElements === 0 ? 0 : (currentPage - 1) * 10 + 1 }}
          à
          {{ Math.min(currentPage * 10, totalElements) }}
          de {{ totalElements }} editoras
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


    <PublisherFormDialog
        v-model="showPublisherDialog"
        :publisher="selectedPublisher"
        :loading="savingPublisher"
        @save="savePublisher"
        @delete="deletePublisher"
    />

  </q-page>
</template>

<style scoped>
.publishers-page {
  padding: 30px 42px;
  background-color: #faf8f8;
}

.publishers-title {
  margin: 0 0 24px 14px;
  color: #0b5e69;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.3;
}

.publishers-card {
  width: 100%;
  min-height: 540px;
  border-radius: 0;
  background-color: white;
  box-shadow: 0 2px 3px rgb(0 0 0 / 15%);
}

.publishers-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 30px;
}

.publishers-search {
  width: 440px;
  max-width: 100%;
}

.create-button {
  background-color: #0b717f !important;
  color: white !important;
  font-size: 16px;
}

.publishers-table-section {
  padding: 28px 30px 8px;
}

.pagination-section {
  padding: 16px 30px;
}

.pagination-info {
  font-size: 14px;
}
</style>
