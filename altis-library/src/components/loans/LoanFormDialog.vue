
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { userService } from '@/services/userService'
import { bookService } from '@/services/bookService'
import { requiredRule } from '@/utils/validationRules'

import type { LoanRequest } from '@/types/loan'

interface SelectOption {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    loading?: boolean
  }>(),
  {
    loading: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: LoanRequest]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const userId = ref<string | null>(null)
const bookId = ref<string | null>(null)
const dueDate = ref('')
const borrowedAt = ref('')

const userOptions = ref<SelectOption[]>([])
const bookOptions = ref<SelectOption[]>([])

const loadingUsers = ref(false)
const loadingBooks = ref(false)

let userRequestId = 0
let bookRequestId = 0

function getLocalDate(): string {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDisplayDate(value: string): string {
  if (!value) return ''

  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

const dueDateRule = (value: string) => {
  if (!value) return true

  return (
    value > getLocalDate() ||
    'A devolução prevista deve ser uma data futura.'
  )
}

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      userRequestId++
      bookRequestId++
      return
    }

    userId.value = null
    bookId.value = null
    dueDate.value = ''
    borrowedAt.value = formatDisplayDate(getLocalDate())

    userOptions.value = []
    bookOptions.value = []
  },
)

async function filterUsers(
  value: string,
  update: (fn: () => void) => void,
  abort: () => void,
) {
  const request = ++userRequestId
  loadingUsers.value = true

  try {
    const response = await userService.findAll(value, 1, 100)

    if (request !== userRequestId || !props.modelValue) {
      abort()
      return
    }

    update(() => {
      userOptions.value = response.content
        .filter((user) => user.active && !user.admin)
        .map((user) => ({
          label: user.name,
          value: user.id,
        }))
    })
  } catch {
    abort()
  } finally {
    if (request === userRequestId) {
      loadingUsers.value = false
    }
  }
}

async function filterBooks(
  value: string,
  update: (fn: () => void) => void,
  abort: () => void,
) {
  const request = ++bookRequestId
  loadingBooks.value = true

  try {
    const response = await bookService.findAll(value, 1, 100)

    if (request !== bookRequestId || !props.modelValue) {
      abort()
      return
    }

    update(() => {
      bookOptions.value = response.content
        .filter((book) => book.availableQuantity > 0)
        .map((book) => ({
          label: `${book.title} — ${book.author}`,
          value: book.id,
        }))
    })
  } catch {
    abort()
  } finally {
    if (request === bookRequestId) {
      loadingBooks.value = false
    }
  }
}

function onSubmit() {
  if (!userId.value || !bookId.value || !dueDate.value) {
    return
  }

  emit('save', {
    userId: userId.value,
    bookId: bookId.value,
    dueDate: `${dueDate.value}T23:59:59`,
  })
}
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="loan-dialog">
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

      <q-card-section class="dialog-content">
        <q-form class="loan-form" @submit="onSubmit">
          <q-select
            v-model="userId"
            :options="userOptions"
            :loading="loadingUsers"
            filled
            bg-color="grey-4"
            label="Locatário"
            use-input
            input-debounce="300"
            emit-value
            map-options
            clearable
            :rules="[requiredRule]"
            lazy-rules="ondemand"
            class="loan-input"
            @filter="filterUsers"
          >
            <template #prepend>
              <q-icon name="person_outline" />
            </template>

            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Nenhum locatário encontrado.
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            v-model="bookId"
            :options="bookOptions"
            :loading="loadingBooks"
            filled
            bg-color="grey-4"
            label="Livro"
            use-input
            input-debounce="300"
            emit-value
            map-options
            clearable
            :rules="[requiredRule]"
            lazy-rules="ondemand"
            class="loan-input"
            @filter="filterBooks"
          >
            <template #prepend>
              <q-icon name="menu_book" />
            </template>

            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Nenhum livro disponível encontrado.
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-model="borrowedAt"
            filled
            readonly
            bg-color="grey-4"
            label="Data do Empréstimo"
            class="loan-input"
          >
            <template #prepend>
              <q-icon name="calendar_today" />
            </template>
          </q-input>

          <q-input
            :model-value="formatDisplayDate(dueDate)"
            filled
            readonly
            bg-color="grey-4"
            label="Devolução Prevista"
            :rules="[
              () => !!dueDate || 'Selecione a data de devolução.',
              () => dueDateRule(dueDate)
            ]"
            lazy-rules="ondemand"
            class="loan-input"
          >
            <template #prepend>
              <q-icon name="event" />
            </template>

            <template #append>
              <q-icon
                name="calendar_month"
                class="cursor-pointer"
              >
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="dueDate"
                    mask="YYYY-MM-DD"
                    :options="(date) =>
                      date.replaceAll('/', '-') > getLocalDate()
                    "
                  >
                    <div class="row justify-end">
                      <q-btn
                        v-close-popup
                        flat
                        label="Fechar"
                        color="primary"
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <div class="form-actions">
            <q-btn
              type="submit"
              unelevated
              no-caps
              label="Realizar Empréstimo"
              :loading="loading"
              :disable="loading"
              class="submit-button"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.loan-dialog {
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
  text-align: center;
  color: #0b5e69;
  font-size: 36px;
  font-weight: 600;
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

.loan-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.loan-input {
  width: 100%;
}

.loan-input :deep(.q-field__control) {
  border-radius: 0;
}

.loan-input :deep(.q-field__native),
.loan-input :deep(.q-field__label) {
  font-size: 15px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 36px;
}

.submit-button {
  min-width: 210px;
  min-height: 40px;
  border-radius: 0;
  background-color: #0b717f !important;
  color: white !important;
  font-size: 18px;
}

@media (max-width: 650px) {
  .loan-dialog {
    width: 96vw;
    min-height: 0;
  }

  .dialog-title {
    font-size: 25px;
  }

  .dialog-content {
    padding: 12px 24px 32px;
  }
}
</style>
