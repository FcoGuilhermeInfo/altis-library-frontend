
<script setup lang="ts">
import { computed } from 'vue'
import type { UserResponse } from '@/types/user'

const props = defineProps<{
  modelValue: boolean
  user: UserResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function formatDate(value: string): string {
  if (!value) return '-'

  const date = value.substring(0, 10)
  const [year, month, day] = date.split('-')

  return `${day}/${month}/${year}`
}

function formatCpf(value: string): string {
  return value.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    '$1.$2.$3-$4',
  )
}

function formatPhone(value: string): string {
  if (value.length === 11) {
    return value.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      '($1) $2-$3',
    )
  }

  if (value.length === 10) {
    return value.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      '($1) $2-$3',
    )
  }

  return value
}
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card class="user-details-card">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6 details-title">
          Detalhes do Usuário
        </div>

        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
        />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="user">
        <q-list separator>
          <q-item>
            <q-item-section>
              <q-item-label caption>Nome completo</q-item-label>
              <q-item-label>{{ user.name }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>E-mail</q-item-label>
              <q-item-label>{{ user.email }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>CPF</q-item-label>
              <q-item-label>{{ formatCpf(user.cpf) }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Telefone</q-item-label>
              <q-item-label>{{ formatPhone(user.phone) }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Data de nascimento</q-item-label>
              <q-item-label>{{ formatDate(user.birthDate) }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Endereço</q-item-label>
              <q-item-label>{{ user.address }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Status</q-item-label>
              <q-badge
                :color="user.active ? 'positive' : 'negative'"
                :label="user.active ? 'Ativo' : 'Inativo'"
              />
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Data de cadastro</q-item-label>
              <q-item-label>{{ formatDate(user.createdAt) }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>Última atualização</q-item-label>
              <q-item-label>{{ formatDate(user.updatedAt) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          flat
          no-caps
          label="Fechar"
          color="primary"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.user-details-card {
  width: 100%;
  max-width: 540px;
  border-radius: 12px;
}

.details-title {
  color: #0b5e69;
  font-weight: 600;
}
</style>
