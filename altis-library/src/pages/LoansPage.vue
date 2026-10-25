<script setup lang="ts">
import { getApiErrorKey, reportApiError } from '@/utils/apiErrors';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref, watch } from 'vue';
import { notifyLocalized } from '@/utils/localizedNotify';

import LoansTable from '@/components/loans/LoansTable.vue';
import LoanFormDialog from '@/components/loans/LoanFormDialog.vue';
import LoanDetailsDialog from '@/components/loans/LoanDetailsDialog.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

import { loanService } from '@/services/loanService';

import type { LoanRequest, LoanResponse } from '@/types/loan';

const { t } = useI18n({ useScope: 'global' });

const pageSize = 10;

// Empréstimos ativos
const loans = ref<LoanResponse[]>([]);
const search = ref<string | null>('');
const currentPage = ref(1);
const totalElements = ref(0);
const loading = ref(false);

// Últimos empréstimos finalizados
const recentHistory = ref<LoanResponse[]>([]);
const loadingRecentHistory = ref(false);

// Histórico completo
const showHistoryDialog = ref(false);
const history = ref<LoanResponse[]>([]);
const historyPage = ref(1);
const historyTotalElements = ref(0);
const loadingHistory = ref(false);

// Registro de empréstimo
const showCreateDialog = ref(false);
const savingLoan = ref(false);

// Detalhes e devolução
const showDetailsDialog = ref(false);
const selectedLoan = ref<LoanResponse | null>(null);
const loadingDetails = ref(false);

// Confirmação de devolução
const showConfirmDialog = ref(false);
const returningLoan = ref(false);
const pendingReturnId = ref<string | null>(null);

// Paginação
const totalPages = computed(() => Math.max(1, Math.ceil(totalElements.value / pageSize)));

const historyTotalPages = computed(() =>
  Math.max(1, Math.ceil(historyTotalElements.value / pageSize)),
);

let loansRequestId = 0;
let historyRequestId = 0;

// Buscar empréstimos ativos
async function loadLoans() {
  const currentRequest = ++loansRequestId;
  loading.value = true;

  try {
    const response = await loanService.findAll(search.value ?? '', currentPage.value, pageSize);

    if (currentRequest !== loansRequestId) return;

    loans.value = response.content;
    totalElements.value = response.totalElements;
  } catch (error: unknown) {
    reportApiError(error);
    if (currentRequest !== loansRequestId) return;

    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'loans.loadError')),
    }));
  } finally {
    if (currentRequest === loansRequestId) {
      loading.value = false;
    }
  }
}

// Buscar últimos empréstimos devolvidos
async function loadRecentHistory() {
  loadingRecentHistory.value = true;

  try {
    const response = await loanService.findHistory('', 1, 5);

    recentHistory.value = response.content;
  } catch (error: unknown) {
    reportApiError(error);
    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'loans.recentError')),
    }));
  } finally {
    loadingRecentHistory.value = false;
  }
}

// Buscar histórico completo
async function loadHistory() {
  const currentRequest = ++historyRequestId;
  loadingHistory.value = true;

  try {
    const response = await loanService.findHistory('', historyPage.value, pageSize);

    if (currentRequest !== historyRequestId) return;

    history.value = response.content;
    historyTotalElements.value = response.totalElements;
  } catch (error: unknown) {
    reportApiError(error);
    if (currentRequest !== historyRequestId) return;

    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'loans.historyError')),
    }));
  } finally {
    if (currentRequest === historyRequestId) {
      loadingHistory.value = false;
    }
  }
}

// Paginação de empréstimos ativos
function changePage(page: number) {
  if (page === currentPage.value) return;

  currentPage.value = page;
  void loadLoans();
}

// Paginação do histórico
function changeHistoryPage(page: number) {
  if (page === historyPage.value) return;

  historyPage.value = page;
  void loadHistory();
}

// Abrir histórico completo
function openHistory() {
  historyPage.value = 1;
  showHistoryDialog.value = true;

  void loadHistory();
}

// Abrir registro de empréstimo
function openCreateDialog() {
  showCreateDialog.value = true;
}

// Registrar empréstimo
async function saveLoan(data: LoanRequest) {
  if (savingLoan.value) return;

  savingLoan.value = true;

  try {
    await loanService.create(data);

    showCreateDialog.value = false;

    notifyLocalized(() => ({
      type: 'positive',
      message: t('loans.created'),
    }));

    await loadLoans();
  } catch (error: unknown) {
    reportApiError(error);
    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'loans.createError')),
    }));
  } finally {
    savingLoan.value = false;
  }
}

// Consultar detalhes do empréstimo
async function viewDetails(id: string) {
  if (loadingDetails.value) return;

  loadingDetails.value = true;

  try {
    selectedLoan.value = await loanService.findById(id);
    showDetailsDialog.value = true;
  } catch (error: unknown) {
    reportApiError(error);
    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'loans.detailsError')),
    }));
  } finally {
    loadingDetails.value = false;
  }
}

// Solicitar confirmação de devolução
function requestReturn(id: string) {
  if (returningLoan.value || showConfirmDialog.value) return;

  pendingReturnId.value = id;
  showConfirmDialog.value = true;
}

// Cancelar confirmação
function onConfirmDialogChange(value: boolean) {
  if (!value && !returningLoan.value) {
    pendingReturnId.value = null;
  }
}

// Confirmar devolução
async function confirmReturn() {
  const id = pendingReturnId.value;

  if (!id || returningLoan.value) return;

  returningLoan.value = true;

  try {
    await loanService.returnBook(id);

    showConfirmDialog.value = false;
    showDetailsDialog.value = false;

    pendingReturnId.value = null;
    selectedLoan.value = null;

    notifyLocalized(() => ({
      type: 'positive',
      message: t('loans.returned'),
    }));

    // Evitar página vazia quando o último empréstimo é devolvido
    if (loans.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }

    // Atualizar empréstimos ativos e histórico recente
    await Promise.all([loadLoans(), loadRecentHistory()]);

    // Atualizar também o histórico completo, se estiver aberto
    if (showHistoryDialog.value) {
      await loadHistory();
    }
  } catch (error: unknown) {
    reportApiError(error);
    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'loans.returnError')),
    }));
  } finally {
    returningLoan.value = false;
  }
}

// Pesquisa por locatário
watch(search, () => {
  currentPage.value = 1;
  void loadLoans();
});

// Carregar dados ao abrir a página
onMounted(() => {
  void loadLoans();
  void loadRecentHistory();
});
</script>

<template>
  <q-page class="loans-page">
    <!-- Empréstimos ativos -->
    <q-card flat class="loans-card">
      <q-card-section class="loans-toolbar">
        <q-input
          v-model="search"
          filled
          rounded
          dense
          clearable
          debounce="400"
          :placeholder="$t('loans.search')"
          class="loans-search"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          unelevated
          no-caps
          icon="add"
          :label="$t('loans.createNew')"
          class="create-button"
          @click="openCreateDialog"
        />
      </q-card-section>

      <q-card-section class="loans-table-section">
        <LoansTable
          :loans="loans"
          :loading="loading || loadingDetails"
          show-actions
          @view-details="viewDetails"
        />
      </q-card-section>

      <q-card-actions align="between" class="pagination-section">
        <span class="pagination-info">
          {{
            $t(
              'pagination.loans',
              {
                start: $n(totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1),
                end: $n(Math.min(currentPage * pageSize, totalElements)),
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

    <!-- Histórico recente -->
    <q-card flat class="history-card">
      <q-card-section class="history-header">
        <div class="history-title">
          {{ $t('loans.recentHistory') }}
        </div>

        <q-btn flat no-caps :label="$t('loans.fullHistory')" color="primary" @click="openHistory" />
      </q-card-section>

      <q-card-section class="history-table-section">
        <LoansTable :loans="recentHistory" :loading="loadingRecentHistory" />
      </q-card-section>
    </q-card>

    <!-- Histórico completo -->
    <q-dialog v-model="showHistoryDialog" maximized>
      <q-card class="history-dialog">
        <q-card-section class="history-dialog-header">
          <h2>{{ $t('loans.recentHistory') }}</h2>

          <q-btn v-close-popup flat round icon="close" :aria-label="$t('common.close')" />
        </q-card-section>

        <q-card-section>
          <LoansTable :loans="history" :loading="loadingHistory" />
        </q-card-section>

        <q-card-actions align="right">
          <q-pagination
            :model-value="historyPage"
            :max="historyTotalPages"
            :max-pages="5"
            boundary-numbers
            direction-links
            @update:model-value="changeHistoryPage"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Registrar empréstimo -->
    <LoanFormDialog v-model="showCreateDialog" :loading="savingLoan" @save="saveLoan" />

    <!-- Detalhes e devolução -->
    <LoanDetailsDialog
      v-model="showDetailsDialog"
      :loan="selectedLoan"
      :loading="returningLoan"
      @return-book="requestReturn"
    />

    <!-- Confirmação da devolução -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      :message="$t('loans.returnPrompt')"
      :loading="returningLoan"
      @confirm="confirmReturn"
      @update:model-value="onConfirmDialogChange"
    />
  </q-page>
</template>

<style scoped>
.loans-page {
  padding: 40px 38px;
  background-color: #faf8f8;
}

.loans-card,
.history-card {
  width: 100%;
  border-radius: 0;
  background-color: white;
  box-shadow: 0 2px 3px rgb(0 0 0 / 15%);
}

.loans-card {
  min-height: 370px;
}

.loans-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 20px;
}

.loans-search {
  width: 360px;
  max-width: 100%;
}

.create-button {
  background-color: #0b717f !important;
  color: white !important;
  font-size: 15px;
}

.loans-table-section {
  padding: 8px 20px;
}

.pagination-section {
  padding: 8px 20px 12px;
}

.pagination-info {
  font-size: 13px;
}

.history-card {
  min-height: 190px;
  margin-top: 12px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
}

.history-title {
  font-size: 15px;
  font-weight: 600;
}

.history-table-section {
  padding: 0 24px 16px;
}

.history-dialog {
  background-color: white;
}

.history-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
}

.history-dialog-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
</style>
