
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatDateTime } from '@/utils/dateUtils'
import type {
  PublisherRequest,
  PublisherResponse,
} from '@/types/publisher'

import {
  requiredRule,
  emailRule,
  gmailRule,
  phoneRule,
} from '@/utils/validationRules'

const props = defineProps<{
  modelValue: boolean
  publisher: PublisherResponse | null
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: PublisherRequest]
  delete: [id: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const isEditing = computed(() => props.publisher !== null)

const name = ref('')
const email = ref('')
const phone = ref('')
const site = ref('')

const siteRule = (value: string) =>
  /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d{1,5})?(?:\/\S*)?$/.test(
    value,
  ) || 'Informe um site válido.'

watch(
  () => props.modelValue,
  (isVisible) => {
    if (!isVisible) return

    name.value = props.publisher?.name ?? ''
    email.value = props.publisher?.email ?? ''
    phone.value = props.publisher?.phone ?? ''
    site.value = props.publisher?.site ?? ''
  },
)

function onSubmit() {
  emit('save', {
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value,
    site: site.value.trim(),
  })
}

function onDelete() {
  if (!props.publisher) return

  emit('delete', props.publisher.id)
}
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card class="publisher-dialog">
      <q-card-section class="dialog-header">
        <h2 class="dialog-title">
          {{ isEditing ? 'Editar Editora' : 'Cadastrar Editora' }}
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
        <q-form class="publisher-form" @submit="onSubmit">
          <q-input
            v-model="name"
            filled
            bg-color="grey-4"
            label="Nome"
            class="publisher-input"
            :rules="[requiredRule]"
            lazy-rules="ondemand"
          >
            <template #prepend>
              <q-icon name="person_outline" />
            </template>
          </q-input>

          <q-input
            v-model="email"
            filled
            bg-color="grey-4"
            type="email"
            label="E-mail"
            class="publisher-input"
            :rules="[requiredRule, emailRule, gmailRule]"
            lazy-rules="ondemand"
          >
            <template #prepend>
              <q-icon name="mail_outline" />
            </template>
          </q-input>

          <q-input
            v-model="phone"
            filled
            bg-color="grey-4"
            label="Telefone"
            mask="(##) #####-####"
            unmasked-value
            class="publisher-input"
            :rules="[requiredRule, phoneRule]"
            lazy-rules="ondemand"
          >
            <template #prepend>
              <q-icon name="phone" />
            </template>
          </q-input>

          <q-input
            v-model="site"
            filled
            bg-color="grey-4"
            label="Site"
            class="publisher-input"
            :rules="[requiredRule, siteRule]"
            lazy-rules="ondemand"
          >
            <template #prepend>
              <q-icon name="language" />
            </template>
          </q-input>


          <div v-if="isEditing && publisher" class="publisher-dates">
            <div class="date-item">
              <q-icon
                name="event"
                size="22px"
                color="primary"
              />

              <div>
                <div class="date-label">Data de criação</div>
                <div class="date-value">
                  {{ formatDateTime(publisher.createdAt) }}
                </div>
              </div>
            </div>

            <div class="date-item">
              <q-icon
                name="update"
                size="22px"
                color="primary"
              />

              <div>
                <div class="date-label">Última atualização</div>
                <div class="date-value">
                  {{ formatDateTime(publisher.updatedAt) }}
                </div>
              </div>
            </div>
          </div>


          <div
            class="form-actions"
            :class="{ 'form-actions-edit': isEditing }"
          >
            <q-btn
              v-if="isEditing"
              type="button"
              unelevated
              no-caps
              label="Excluir Editora"
              class="delete-button"
              :disable="loading"
              @click="onDelete"
            />

            <q-btn
              type="submit"
              unelevated
              no-caps
              :label="isEditing ? 'Editar' : 'Cadastrar'"
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
.publisher-dialog {
  width: 85vw;
  max-width: 1100px;
  min-height: 660px;
  border-radius: 0;
  background-color: white;
}

.dialog-header {
  position: relative;
  padding: 42px 48px 24px;
}

.dialog-title {
  margin: 0;
  text-align: center;
  color: #0b5e69;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.3;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 24px;
  color: #193b45;
  font-size: 26px;
}

.dialog-content {
  padding: 16px 10% 48px;
}

.publisher-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.publisher-input {
  width: 100%;
}

.publisher-input :deep(.q-field__control) {
  border-radius: 0;
}

.publisher-input :deep(.q-field__native),
.publisher-input :deep(.q-field__label) {
  font-size: 17px;
}


.publisher-dates {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-top: 12px;
  padding: 20px 0;
  border-top: 1px solid #ddd;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.date-label {
  font-size: 14px;
  color: #777;
}

.date-value {
  margin-top: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #0b5e69;
}

@media (max-width: 600px) {
  .publisher-dates {
    flex-direction: column;
    gap: 16px;
  }
}


.form-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.form-actions-edit {
  justify-content: space-between;
  margin-top: 90px;
}

.submit-button,
.delete-button {
  width: 210px;
  min-height: 40px;
  border-radius: 0;
  font-size: 18px;
}

.submit-button {
  background-color: #0b717f !important;
  color: white !important;
}

.delete-button {
  background-color: #f00000 !important;
  color: white !important;
}

@media (max-width: 600px) {
  .publisher-dialog {
    width: 96vw;
    min-height: 0;
  }

  .dialog-title {
    font-size: 26px;
  }

  .dialog-content {
    padding: 16px 24px 32px;
  }

  .form-actions-edit {
    gap: 12px;
    margin-top: 24px;
  }

  .submit-button,
  .delete-button {
    width: 48%;
    font-size: 14px;
  }
}
</style>
