
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableColumn } from 'quasar'

import { dashboardService } from '@/services/dashboardService'

import type {
  UserDashboardResponse,
  UserLoanDashboard,
} from '@/types/dashboard'

import type { LoanStatus } from '@/types/loan'

const $q = useQuasar()

const dashboard = ref<UserDashboardResponse | null>(null)
const loading = ref(false)

const columns: QTableColumn<UserLoanDashboard>[] = [
  {
    name: 'tenant',
    label: 'Locatário',
    field: 'tenant',
    align: 'left',
  },
  {
    name: 'book',
    label: 'Livro',
    field: 'book',
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

const activeLoans = computed(() =>
  dashboard.value?.loans.filter(
    (loan) => loan.status !== 'RETURNED',
  ) ?? [],
)

async function loadDashboard() {
  loading.value = true

  try {
    dashboard.value = await dashboardService.getUserDashboard()
  } catch {
    dashboard.value = null

    $q.notify({
      type: 'negative',
      message: 'Não foi possível carregar o Dashboard.',
    })
  } finally {
    loading.value = false
  }
}

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

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <section class="user-dashboard">
    <h1 class="dashboard-title">
      Dashboard
    </h1>

    <div v-if="loading" class="feedback-container">
      <q-spinner size="48px" color="primary" />
    </div>

    <template v-else-if="dashboard">
      <!-- Indicadores do locatário -->
      <q-card flat class="dashboard-panel statistics-panel">
        <q-card-section class="statistics-grid">
          <div class="stat-card">
            <q-icon name="menu_book" class="stat-icon" />

            <div class="stat-content">
              <span class="stat-label">
                Livros Emprestados
              </span>

              <strong class="stat-value">
                {{ dashboard.borrowedBooks }}/{{ dashboard.borrowingLimit }}
              </strong>

              <span class="stat-description">
                Você pode pegar emprestado até
                {{ dashboard.borrowingLimit }} livros
              </span>
            </div>
          </div>

          <div class="stat-card">
            <q-icon name="alarm" class="stat-icon" />

            <div class="stat-content">
              <span class="stat-label">
                Próxima Devolução
              </span>

              <strong class="stat-value">
                {{
                  dashboard.nextReturnDate
                    ? formatDate(dashboard.nextReturnDate)
                    : 'Nenhuma'
                }}
              </strong>

              <span class="stat-description">
                Próxima devolução dentro do prazo
              </span>
            </div>
          </div>

          <div class="stat-card">
            <q-icon name="auto_stories" class="stat-icon" />

            <div class="stat-content">
              <span class="stat-label">
                Último Livro Emprestado
              </span>

              <strong class="stat-value last-book">
                {{ dashboard.lastBorrowedBook ?? 'Nenhum livro' }}
              </strong>

              <span class="stat-description">
                {{
                  dashboard.lastBorrowedAt
                    ? `Emprestado em: ${formatDate(dashboard.lastBorrowedAt)}`
                    : 'Nenhum empréstimo realizado'
                }}
              </span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Meus livros emprestados -->
      <q-card flat class="dashboard-panel loans-panel">
        <q-card-section class="loans-header">
          <h2>Meus Livros Emprestados</h2>
        </q-card-section>

        <q-card-section class="loans-table-section">
          <q-table
            :rows="activeLoans"
            :columns="columns"
            row-key="borrowedAt"
            flat
            hide-bottom
            :pagination="{ rowsPerPage: 0 }"
            class="loans-table"
          >
            <template #body-cell-tenant="slotProps">
              <q-td :props="slotProps" class="tenant-name">
                {{ slotProps.row.tenant }}
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

            <template #no-data>
              <div class="full-width text-center q-pa-lg">
                Você não possui empréstimos ativos.
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </template>

    <div v-else class="feedback-container">
      <p>Não foi possível apresentar os dados do Dashboard.</p>

      <q-btn
        unelevated
        no-caps
        color="primary"
        label="Tentar novamente"
        @click="loadDashboard"
      />
    </div>
  </section>
</template>

<style scoped>
.user-dashboard {
  width: 100%;
  padding: 14px 28px 40px;
  background-color: #faf8f8;
  box-sizing: border-box;
}

.dashboard-title {
  margin: 0 0 24px;
  color: #0b5e69;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.3;
}

.dashboard-panel {
  width: 100%;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 2px rgb(0 0 0 / 20%);
  box-sizing: border-box;
}

/* Indicadores superiores */

.statistics-panel {
  margin-bottom: 32px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 28px;
  padding: 24px 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-width: 0;
  min-height: 112px;
  padding: 16px 18px;
  border: 1px solid #69a3b4;
  border-radius: 12px;
}

.stat-icon {
  flex-shrink: 0;
  color: #08788b;
  font-size: 38px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.stat-label {
  color: #333;
  font-size: 14px;
  line-height: 1.3;
}

.stat-value {
  color: #0b7180;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.3;
}

.last-book {
  font-size: 18px;
  overflow-wrap: anywhere;
}

.stat-description {
  color: #777;
  font-size: 10px;
  line-height: 1.4;
}

/* Tabela de empréstimos */

.loans-panel {
  min-height: 300px;
}

.loans-header {
  padding: 18px 24px 10px;
}

.loans-header h2 {
  margin: 0;
  color: #0b7180;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
}

.loans-table-section {
  padding: 0 24px 24px;
}

.loans-table {
  width: 100%;
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

.loans-table :deep(tbody td.tenant-name) {
  color: #222;
  font-weight: 600;
}

.loan-status {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
}

.feedback-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 300px;
}

/* Telas menores */

@media (max-width: 950px) {
  .statistics-grid {
    gap: 14px;
    padding: 18px;
  }

  .stat-card {
    gap: 10px;
    padding: 12px 8px;
  }

  .stat-icon {
    font-size: 30px;
  }
}

@media (max-width: 750px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 550px) {
  .user-dashboard {
    padding: 18px 14px 30px;
  }

  .loans-table-section {
    padding: 0 12px 24px;
  }
}
</style>
