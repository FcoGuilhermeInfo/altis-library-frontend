
<script setup lang="ts">
import { computed } from 'vue'
import type { LoanResponse } from '@/types/loan'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loan: LoanResponse | null
    loading?: boolean
  }>(),
  {
    loading: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  returnBook: [id: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function formatDate(value: string | null): string {
  if (!value) return '-'

  const [year, month, day] = value.slice(0, 10).split('-')

  if (!year || !month || !day) return '-'

  return `${day}/${month}/${year}`
}

function requestReturn() {
  if (!props.loan || props.loading) return

  emit('returnBook', props.loan.id)
}
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="loan-details-dialog">
      <q-card-section class="dialog-header">
        <h2 class="dialog-title">
          Realizar Empréstimo
        </h2>

        <q-btn
          flat
          round
          dense
          icon="close"
          class="close-button"
          :disable="loading"
          @click="isOpen = false"
        />
      </q-card-section>

      <q-card-section v-if="loan" class="dialog-content">
        <q-list class="loan-details">
          <q-item class="detail-item">
            <q-item-section avatar>
              <q-icon name="person_outline" />
            </q-item-section>

            <q-item-section>
              {{ loan.userFullName }}
            </q-item-section>
          </q-item>

          <q-item class="detail-item">
            <q-item-section avatar>
              <q-icon name="menu_book" />
            </q-item-section>

            <q-item-section>
              {{ loan.bookTitle }}
            </q-item-section>
          </q-item>

          <q-item class="detail-item">
            <q-item-section avatar>
              <q-icon name="calendar_today" />
            </q-item-section>

            <q-item-section>
              {{ formatDate(loan.borrowedAt) }}
            </q-item-section>
          </q-item>

          <q-item class="detail-item">
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>

            <q-item-section>
              {{ formatDate(loan.dueDate) }}
            </q-item-section>
          </q-item>
        </q-list>

        <div class="dialog-actions">
          <q-btn
            v-if="loan.status !== 'RETURNED'"
            unelevated
            no-caps
            label="Confirmar Devolução"
            :loading="loading"
            :disable="loading"
            class="return-button"
            @click="requestReturn"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.loan-details-dialog {
  width: 85vw;
  max-width: 1100px;
  min-height: 550px;
  border-radius: 0;
  background-color: white;
}

.dialog-header {
  position: relative;
  padding: 36px 48px 20px;
}

.dialog-title {
  margin: 0;
  color: #0b5e69;
  font-size: 36px;
  font-weight: 600;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 18px;
  right: 24px;
  color: #193b45;
}

.dialog-content {
  padding: 10px 10% 44px;
}

.loan-details {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-item {
  min-height: 48px;
  background-color: #ddd;
  color: #555;
}

.detail-item :deep(.q-item__section--avatar) {
  min-width: 48px;
  color: #222;
}

.detail-item :deep(.q-item__section) {
  font-size: 16px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 100px;
}

.return-button {
  min-width: 210px;
  min-height: 40px;
  border-radius: 0;
  background-color: #19e829 !important;
  color: #111 !important;
  font-size: 17px;
}

@media (max-width: 650px) {
  .loan-details-dialog {
    width: 96vw;
    min-height: 0;
  }

  .dialog-title {
    font-size: 25px;
  }

  .dialog-content {
    padding: 12px 24px 32px;
  }

  .dialog-actions {
    justify-content: center;
    margin-top: 36px;
  }
}
</style>
