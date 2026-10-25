<script setup lang="ts">
import { useLocalizedValidation } from '@/utils/localizedValidation';
import { useI18n } from 'vue-i18n';
import { computed, ref, watch } from 'vue';
import type { QSelectProps } from 'quasar';

import { publisherService } from '@/services/publisherService';
import { formatDateTime } from '@/utils/dateUtils';
import { requiredRule } from '@/utils/validationRules';

import type { BookRequest, BookResponse } from '@/types/book';

const { t } = useI18n({ useScope: 'global' });

interface PublisherOption {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    book: BookResponse | null;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [data: BookRequest];
  delete: [id: string];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const isEditing = computed(() => props.book !== null);

const title = ref('');
const author = ref('');
const releaseYear = ref<number | null>(null);
const publisherName = ref<string | null>(null);
const totalQuantity = ref<number | null>(null);

const publisherOptions = ref<PublisherOption[]>([]);
const loadingPublishers = ref(false);

let publisherRequestId = 0;

const yearRule = (value: number | null) =>
  (value !== null &&
    Number.isInteger(Number(value)) &&
    Number(value) >= 1 &&
    Number(value) <= 32767) ||
  t('validation.year');

const quantityRule = (value: number | null) =>
  (value !== null && Number.isInteger(Number(value)) && Number(value) >= 1) ||
  t('validation.quantity');

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return;

    title.value = props.book?.title ?? '';
    author.value = props.book?.author ?? '';
    releaseYear.value = props.book?.releaseYear ?? null;
    publisherName.value = props.book?.publisherName ?? null;
    totalQuantity.value = props.book?.totalQuantity ?? null;

    publisherOptions.value = props.book
      ? [
          {
            label: props.book.publisherName,
            value: props.book.publisherName,
          },
        ]
      : [];
  },
);

const filterPublishers: NonNullable<QSelectProps['onFilter']> = (value, update, abort) => {
  const currentRequest = ++publisherRequestId;

  loadingPublishers.value = true;

  void publisherService
    .findAll(value, 1, 100)
    .then((response) => {
      if (currentRequest !== publisherRequestId) {
        abort();
        return;
      }

      update(() => {
        publisherOptions.value = response.content.map((publisher) => ({
          label: publisher.name,
          value: publisher.name,
        }));
      });
    })
    .catch(() => {
      abort();
    })
    .finally(() => {
      if (currentRequest === publisherRequestId) {
        loadingPublishers.value = false;
      }
    });
};

function onSubmit() {
  if (releaseYear.value === null || totalQuantity.value === null || !publisherName.value) return;

  emit('save', {
    title: title.value.trim(),
    author: author.value.trim(),
    releaseYear: Number(releaseYear.value),
    publisherName: publisherName.value,
    totalQuantity: Number(totalQuantity.value),
  });
}

function onDelete() {
  if (!props.book) return;

  emit('delete', props.book.id);
}
const localizedForm = useLocalizedValidation();
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="book-dialog">
      <q-card-section class="dialog-header">
        <h2 class="dialog-title">
          {{ isEditing ? $t('books.edit') : $t('books.create') }}
        </h2>

        <q-btn
          flat
          round
          dense
          icon="close"
          :aria-label="$t('common.close')"
          class="close-button"
          :disable="loading"
          @click="isOpen = false"
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <q-form ref="localizedForm" class="book-form" @submit="onSubmit">
          <q-input
            v-model="title"
            filled
            bg-color="grey-4"
            :label="$t('books.title')"
            :rules="[requiredRule]"
            lazy-rules="ondemand"
            class="book-input"
          >
            <template #prepend>
              <q-icon name="title" />
            </template>
          </q-input>

          <q-input
            v-model="author"
            filled
            bg-color="grey-4"
            :label="$t('books.author')"
            :rules="[requiredRule]"
            lazy-rules="ondemand"
            class="book-input"
          >
            <template #prepend>
              <q-icon name="person_outline" />
            </template>
          </q-input>

          <q-input
            v-model.number="releaseYear"
            filled
            bg-color="grey-4"
            type="number"
            :label="$t('books.year')"
            :rules="[yearRule]"
            lazy-rules="ondemand"
            class="book-input"
          >
            <template #prepend>
              <q-icon name="calendar_today" />
            </template>
          </q-input>

          <q-select
            v-model="publisherName"
            :options="publisherOptions"
            :loading="loadingPublishers"
            filled
            bg-color="grey-4"
            :label="$t('books.publisher')"
            use-input
            input-debounce="300"
            emit-value
            map-options
            clearable
            :rules="[(value: string | null) => !!value || $t('validation.publisher')]"
            lazy-rules="ondemand"
            class="book-input"
            @filter="filterPublishers"
          >
            <template #prepend>
              <q-icon name="web" />
            </template>

            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ $t('publishers.empty') }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-model.number="totalQuantity"
            filled
            bg-color="grey-4"
            type="number"
            :label="$t('books.totalQuantity')"
            :rules="[quantityRule]"
            lazy-rules="ondemand"
            class="book-input"
          >
            <template #prepend>
              <q-icon name="inventory_2" />
            </template>
          </q-input>

          <div v-if="isEditing && book" class="book-dates">
            <div class="date-item">
              <q-icon name="event" size="22px" />
              <div>
                <div class="date-label">
                  {{ $t('common.createdAt') }}
                </div>
                <div class="date-value">
                  {{ formatDateTime(book.createdAt) }}
                </div>
              </div>
            </div>

            <div class="date-item">
              <q-icon name="update" size="22px" />
              <div>
                <div class="date-label">
                  {{ $t('common.updatedAt') }}
                </div>
                <div class="date-value">
                  {{ formatDateTime(book.updatedAt) }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions" :class="{ 'form-actions-edit': isEditing }">
            <q-btn
              v-if="isEditing"
              type="button"
              unelevated
              no-caps
              :label="$t('books.delete')"
              class="delete-button"
              :disable="loading"
              @click="onDelete"
            />

            <q-btn
              type="submit"
              unelevated
              no-caps
              :label="isEditing ? $t('common.edit') : $t('common.create')"
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
.book-dialog {
  width: 85vw;
  max-width: 1100px;
  min-height: 620px;
  border-radius: 0;
  background: white;
}

.dialog-header {
  position: relative;
  padding: 36px 48px 22px;
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

.book-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.book-input {
  width: 100%;
}

.book-input :deep(.q-field__control) {
  border-radius: 0;
}

.book-input :deep(.q-field__native),
.book-input :deep(.q-field__label) {
  font-size: 15px;
}

.book-dates {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 0;
  margin-top: 10px;
  border-top: 1px solid #ddd;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  color: #0b5e69;
}

.date-label {
  font-size: 13px;
  color: #777;
}

.date-value {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.form-actions-edit {
  justify-content: space-between;
  margin-top: 24px;
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

@media (max-width: 650px) {
  .book-dialog {
    width: 96vw;
    min-height: 0;
  }

  .dialog-title {
    font-size: 26px;
  }

  .dialog-content {
    padding: 12px 24px 32px;
  }

  .book-dates {
    flex-direction: column;
    gap: 16px;
  }

  .form-actions-edit {
    gap: 12px;
  }

  .submit-button,
  .delete-button {
    width: 46%;
    font-size: 14px;
  }
}
</style>
