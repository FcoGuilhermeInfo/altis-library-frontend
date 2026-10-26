<script setup lang="ts">
import { getApiErrorKey, reportApiError } from '@/utils/apiErrors';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { notifyLocalized } from '@/utils/localizedNotify';

import PublishersTable from '@/components/publishers/PublishersTable.vue';
import { publisherService } from '@/services/publisherService';
import type { PublisherResponse, PublisherRequest } from '@/types/publisher';
import PublisherFormDialog from '@/components/publishers/PublisherFormDialog.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import { usePaginatedList } from '@/composables/usePaginatedList';

const { t } = useI18n({ useScope: 'global' });

const paginatedPublishers = usePaginatedList<PublisherResponse>((search, page, size) =>
  publisherService.findAll(search, page, size),
  { pageSize: 10 },
);

const { items: publishers, search, currentPage, totalElements, loading, totalPages, loadPage } =
  paginatedPublishers;

const selectedPublisher = ref<PublisherResponse | null>(null);
const showPublisherDialog = ref(false);
const savingPublisher = ref(false);

type PendingAction =
  | { type: 'update'; id: string; data: PublisherRequest }
  | { type: 'delete'; id: string };

const showConfirmDialog = ref(false);
const pendingAction = ref<PendingAction | null>(null);

const confirmMessage = computed(() =>
  pendingAction.value?.type === 'delete' ? t('common.confirmDelete') : t('common.confirmUpdate'),
);

function changePage(page: number) {
  paginatedPublishers.changePage(page);
}

function openCreateDialog() {
  selectedPublisher.value = null;
  showPublisherDialog.value = true;
}

function openEditDialog(publisher: PublisherResponse) {
  selectedPublisher.value = publisher;
  showPublisherDialog.value = true;
}

async function savePublisher(data: PublisherRequest) {
  if (savingPublisher.value) return;

  if (selectedPublisher.value) {
    pendingAction.value = {
      type: 'update',
      id: selectedPublisher.value.id,
      data,
    };

    showConfirmDialog.value = true;
    return;
  }

  savingPublisher.value = true;

  try {
    await publisherService.create(data);

    showPublisherDialog.value = false;

    notifyLocalized(() => ({
      type: 'positive',
      message: t('publishers.created'),
    }));

    await loadPage();
  } catch (error: unknown) {
    reportApiError(error);
    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'publishers.createError')),
    }));
  } finally {
    savingPublisher.value = false;
  }
}

function deletePublisher(id: string) {
  if (savingPublisher.value) return;

  pendingAction.value = {
    type: 'delete',
    id,
  };

  showConfirmDialog.value = true;
}

async function confirmPublisherAction() {
  const action = pendingAction.value;

  if (!action || savingPublisher.value) return;

  savingPublisher.value = true;

  try {
    if (action.type === 'update') {
      await publisherService.update(action.id, action.data);

      notifyLocalized(() => ({
        type: 'positive',
        message: t('publishers.updated'),
      }));
    } else {
      await publisherService.delete(action.id);

      notifyLocalized(() => ({
        type: 'positive',
        message: t('publishers.deleted'),
      }));

      if (publishers.value.length === 1 && currentPage.value > 1) {
        currentPage.value--;
      }
    }

    showConfirmDialog.value = false;
    showPublisherDialog.value = false;
    pendingAction.value = null;
    selectedPublisher.value = null;

    await loadPage();
  } catch (error: unknown) {
    reportApiError(error);
    notifyLocalized(() => ({
      type: 'negative',
      message:
        action.type === 'delete'
          ? t(getApiErrorKey(error, 'publishers.deleteError'))
          : t(getApiErrorKey(error, 'publishers.updateError')),
    }));
  } finally {
    savingPublisher.value = false;
  }
}
</script>

<template>
  <q-page class="publishers-page">
    <h1 class="publishers-title">
      {{ $t('menu.publishers') }}
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
          :placeholder="$t('publishers.search')"
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
          :label="$t('publishers.createNew')"
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

      <q-card-actions align="between" class="pagination-section">
        <span class="pagination-info">
          {{
            $t(
              'pagination.publishers',
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

    <ConfirmDialog
      v-model="showConfirmDialog"
      :message="confirmMessage"
      :loading="savingPublisher"
      @confirm="confirmPublisherAction"
      @update:model-value="
        (value) => {
          if (!value) pendingAction = null;
        }
      "
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
