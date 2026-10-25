<script setup lang="ts">
import { getApiErrorKey, reportApiError } from '@/utils/apiErrors';
import { formatDate } from '@/utils/dateUtils';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref } from 'vue';
import { notifyLocalized } from '@/utils/localizedNotify';

import { dashboardService } from '@/services/dashboardService';
import type { AdminDashboardResponse } from '@/types/dashboard';

const { t } = useI18n({ useScope: 'global' });

const dashboard = ref<AdminDashboardResponse | null>(null);
const loading = ref(false);

const maxLoanCount = computed(() =>
  Math.max(0, ...(dashboard.value?.topBorrowedBooks.map((book) => book.loanCount) ?? [])),
);

async function loadDashboard() {
  loading.value = true;

  try {
    dashboard.value = await dashboardService.getAdminDashboard();
  } catch (error: unknown) {
    reportApiError(error);
    dashboard.value = null;

    notifyLocalized(() => ({
      type: 'negative',
      message: t(getApiErrorKey(error, 'dashboard.loadError')),
    }));
  } finally {
    loading.value = false;
  }
}

function barWidth(count: number): string {
  if (maxLoanCount.value === 0) return '0%';

  return `${(count / maxLoanCount.value) * 100}%`;
}

onMounted(() => {
  void loadDashboard();
});
</script>

<template>
  <section class="admin-dashboard">
    <h1 class="dashboard-title">
      {{ $t('menu.dashboard') }}
    </h1>

    <div v-if="loading" class="feedback-container">
      <q-spinner :aria-label="$t('common.loading')" size="48px" color="primary" />
    </div>

    <template v-else-if="dashboard">
      <q-card flat class="dashboard-panel statistics-panel">
        <q-card-section class="statistics-grid">
          <div class="stat-card">
            <q-icon name="menu_book" class="stat-icon" />

            <div class="stat-content">
              <span class="stat-label">{{ $t('dashboard.admin.totalBooks') }}</span>

              <strong class="stat-value">
                {{ $n(dashboard.totalBooks) }}
              </strong>

              <span class="stat-description">
                {{ $t('dashboard.admin.registeredBooks', dashboard.totalBooks) }}
              </span>
            </div>
          </div>

          <div class="stat-card">
            <q-icon name="view_list" class="stat-icon" />

            <div class="stat-content">
              <span class="stat-label">{{ $t('dashboard.admin.totalPublishers') }}</span>

              <strong class="stat-value">
                {{ $n(dashboard.totalPublishers) }}
              </strong>

              <span class="stat-description">
                {{ $t('dashboard.admin.registeredPublishers', dashboard.totalPublishers) }}
              </span>
            </div>
          </div>

          <div class="stat-card">
            <q-icon name="handshake" class="stat-icon" />

            <div class="stat-content">
              <span class="stat-label">
                {{ $t('dashboard.admin.totalLoans') }}
                <small>{{ $t('dashboard.thisMonth') }}</small>
              </span>

              <strong class="stat-value">
                {{ $n(dashboard.monthlyLoans) }}
              </strong>

              <span class="stat-description">
                {{ $t('dashboard.admin.completedLoans', dashboard.monthlyLoans) }}
              </span>
            </div>
          </div>

          <div class="stat-card">
            <q-icon name="people_outline" class="stat-icon" />

            <div class="stat-content">
              <span class="stat-label">{{ $t('dashboard.admin.totalUsers') }}</span>

              <strong class="stat-value">
                {{ $n(dashboard.totalUsers) }}
              </strong>

              <span class="stat-description">
                {{ $t('dashboard.admin.registeredUsers', dashboard.totalUsers) }}
              </span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="dashboard-panel details-panel">
        <q-card-section class="details-grid">
          <div class="detail-card">
            <h2 class="detail-title">
              {{ $t('dashboard.lastBook') }}
            </h2>

            <template v-if="dashboard.lastLoan">
              <div class="book-information">
                <strong>
                  {{ dashboard.lastLoan.bookTitle }}
                </strong>

                <span>
                  {{ dashboard.lastLoan.tenant }}
                </span>
              </div>

              <div class="date-grid">
                <div class="date-box">
                  <span>{{ $t('loans.borrowedAt') }}</span>

                  <strong>
                    {{ formatDate(dashboard.lastLoan.borrowedAt) }}
                  </strong>
                </div>

                <div class="date-box">
                  <span>{{ $t('loans.dueDate') }}</span>

                  <strong>
                    {{ formatDate(dashboard.lastLoan.dueDate) }}
                  </strong>
                </div>
              </div>
            </template>

            <p v-else class="empty-message">
              {{ $t('dashboard.noLoans') }}
            </p>
          </div>

          <!-- Livro mais emprestado -->
          <div class="detail-card">
            <h2 class="detail-title">
              {{ $t('dashboard.admin.mostBorrowed') }}
              <span>{{ $t('dashboard.thisMonth') }}</span>
            </h2>

            <template v-if="dashboard.mostBorrowedBook">
              <div class="book-information">
                <strong>
                  {{ dashboard.mostBorrowedBook.bookTitle }}
                </strong>
              </div>

              <div class="borrowed-highlight">
                <strong>
                  {{ $n(dashboard.mostBorrowedBook.loanCount) }}
                </strong>

                <span>{{
                  $t('dashboard.admin.borrowedCopies', dashboard.mostBorrowedBook.loanCount)
                }}</span>
              </div>
            </template>

            <p v-else class="empty-message">
              {{ $t('dashboard.admin.noMonthlyLoans') }}
            </p>
          </div>

          <!-- Top 3 livros -->
          <div class="detail-card chart-card">
            <h2 class="detail-title">
              {{ $t('dashboard.admin.topBooks') }}
              <span>{{ $t('dashboard.thisMonth') }}</span>
            </h2>

            <div v-if="dashboard.topBorrowedBooks.length > 0" class="chart-content">
              <div v-for="book in dashboard.topBorrowedBooks" :key="book.bookId" class="chart-row">
                <span class="chart-label" :title="book.bookTitle">
                  {{ book.bookTitle }}
                </span>

                <div class="chart-track">
                  <div
                    class="chart-bar"
                    :style="{
                      width: barWidth(book.loanCount),
                    }"
                  />
                </div>

                <strong class="chart-count">
                  {{ $n(book.loanCount) }}
                </strong>
              </div>

              <div class="chart-scale">
                <span>{{
                  new Intl.NumberFormat($i18n.locale, {
                    style: 'percent',
                  }).format(0.0)
                }}</span>
                <span>{{
                  new Intl.NumberFormat($i18n.locale, {
                    style: 'percent',
                  }).format(0.25)
                }}</span>
                <span>{{
                  new Intl.NumberFormat($i18n.locale, {
                    style: 'percent',
                  }).format(0.5)
                }}</span>
                <span>{{
                  new Intl.NumberFormat($i18n.locale, {
                    style: 'percent',
                  }).format(0.75)
                }}</span>
                <span>{{
                  new Intl.NumberFormat($i18n.locale, {
                    style: 'percent',
                  }).format(1.0)
                }}</span>
              </div>
            </div>

            <p v-else class="empty-message">
              {{ $t('dashboard.admin.noMonthlyLoans') }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </template>

    <div v-else class="feedback-container">
      <p>{{ $t('dashboard.unavailable') }}</p>

      <q-btn
        unelevated
        no-caps
        color="primary"
        :label="$t('common.retry')"
        @click="loadDashboard"
      />
    </div>
  </section>
</template>

<style scoped>
.admin-dashboard {
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
  margin-bottom: 44px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  gap: 26px;
  padding: 28px 22px;
}

.stat-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-width: 0;
  min-height: 90px;
  padding: 12px;
  border: 1px solid #69a3b4;
  border-radius: 12px;
}

.stat-icon {
  flex-shrink: 0;
  color: #08788b;
  font-size: 30px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.stat-label {
  color: #333;
  font-size: 12px;
  line-height: 1.2;
}

.stat-label small {
  display: block;
  color: #777;
  font-size: 10px;
}

.stat-value {
  color: #333;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.2;
}

.stat-description {
  color: #666;
  font-size: 10px;
}

/* Painel inferior */

.details-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr)
    minmax(0, 1.8fr);
  gap: 22px;
  padding: 26px 18px;
}

.detail-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 210px;
  padding: 14px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 2px rgb(0 0 0 / 20%);
}

.detail-title {
  margin: 0 0 22px;
  color: #222;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.detail-title span {
  color: #777;
  font-weight: 400;
}

.book-information {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  color: #444;
  font-size: 12px;
}

.book-information strong {
  overflow-wrap: anywhere;
  font-weight: 500;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: auto;
}

.date-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 9px;
}

.date-box span {
  color: #666;
  font-size: 10px;
}

.date-box strong {
  color: #444;
  font-size: 11px;
  font-weight: 500;
}

.borrowed-highlight {
  display: flex;
  flex-direction: column;
  align-self: center;
  margin-top: auto;
  padding: 10px 16px;
  background-color: #a5f5b4;
  border-radius: 9px;
  color: #087a29;
}

.borrowed-highlight strong {
  font-size: 20px;
  font-weight: 500;
}

.borrowed-highlight span {
  font-size: 10px;
}

/* Gráfico */

.chart-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  min-width: 0;
}

.chart-row {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) 30px;
  align-items: center;
  gap: 9px;
}

.chart-label {
  overflow: hidden;
  color: #222;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
}

.chart-track {
  width: 100%;
  height: 15px;
  background-color: #edf1f1;
}

.chart-bar {
  height: 100%;
  background-color: #0b7180;
}

.chart-count {
  color: #0b5e69;
  font-size: 11px;
}

.chart-scale {
  display: flex;
  justify-content: space-between;
  margin-left: 99px;
  margin-right: 30px;
  color: #0b5e69;
  font-size: 10px;
}

.empty-message {
  color: #888;
  font-size: 12px;
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

@media (max-width: 1100px) {
  .statistics-grid {
    gap: 12px;
    padding: 22px 16px;
  }

  .stat-card {
    gap: 8px;
    padding: 10px 6px;
  }

  .details-grid {
    gap: 14px;
  }
}

@media (max-width: 850px) {
  .statistics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .details-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 550px) {
  .admin-dashboard {
    padding: 18px 14px 30px;
  }

  .statistics-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }

  .chart-card {
    grid-column: auto;
  }
}
</style>
