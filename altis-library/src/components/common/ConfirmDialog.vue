<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    message: string;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

function cancel() {
  if (props.loading) return;
  isOpen.value = false;
}

function confirm() {
  if (props.loading) return;
  emit('confirm');
}
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="confirm-card">
      <q-card-section class="confirm-message">
        {{ message }}
      </q-card-section>

      <q-card-actions class="confirm-actions">
        <q-btn
          unelevated
          no-caps
          :label="$t('common.cancel')"
          class="cancel-button"
          :disable="loading"
          @click="cancel"
        />

        <q-btn
          unelevated
          no-caps
          :label="$t('common.yes')"
          class="accept-button"
          :loading="loading"
          :disable="loading"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.confirm-card {
  width: 90vw;
  max-width: 950px;
  min-height: 320px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background-color: white;
  border: 12px solid #0b5e69;
  border-radius: 90px;

  padding: 36px 70px 48px;
  box-shadow: 0 8px 18px rgb(0 0 0 / 20%);
}

.confirm-message {
  padding: 8px 0;
  color: black;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
}

.confirm-actions {
  display: flex;
  justify-content: space-between;
  padding: 0;
  gap: 30px;
}

.cancel-button,
.accept-button {
  width: 260px;
  min-height: 54px;
  border-radius: 40px;

  font-size: 25px;
  font-weight: 700;
  color: #111 !important;
}

.cancel-button {
  background-color: #ff2020 !important;
}

.accept-button {
  background-color: #15f52b !important;
}

@media (max-width: 650px) {
  .confirm-card {
    width: 95vw;
    min-height: 250px;
    padding: 30px 20px;
    border-width: 7px;
    border-radius: 38px;
  }

  .confirm-message {
    font-size: 20px;
  }

  .confirm-actions {
    gap: 12px;
  }

  .cancel-button,
  .accept-button {
    width: 45%;
    min-height: 44px;
    font-size: 17px;
  }
}
</style>
