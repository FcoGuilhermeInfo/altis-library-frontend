<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { ref } from 'vue'

const selectedLanguage = ref ('pt-BR')

const { locale } = useI18n()

function changeLanguage() {
    locale.value = selectedLanguage.value
}
</script>

<template>
    <q-dialog>
        <q-card class="language-dialog">
            <q-card-section class="dialog-header">
                <q-card-label class="dialog-title">
                    {{ $t('menuprofile.languages') }}
                </q-card-label>

                <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    color="white"
                    v-close-popup
                />

            </q-card-section>
            <q-card-section class="language-options">

                <q-radio
                    v-model="selectedLanguage"
                    val="pt-BR"
                    :label="$t('menuprofile.portuguese')"
                    color="white"
                />

                <q-radio 
                    v-model="selectedLanguage"
                    val="es-ES"
                    :label="$t('menuprofile.spanish')"
                    color="white"
                    />

                <q-radio 
                    v-model="selectedLanguage"
                    val="en-US"
                    :label="$t('menuprofile.english')"
                    color="white"
                />
            </q-card-section>

            <q-card-actions align="center">
                <q-btn
                    unelevated
                    rounded
                    class="btn-save"
                    :label=" $t('common.save')"
                    @click="changeLanguage"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<style scoped>
    .language-dialog {
        width: 330px;
        min-height: 420px;
        background-color: #0E5E69;
        color: white;
        border-radius: 30px;
    }

    .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .dialog-title {
        font-size: 28px;
        font-weight: 600;
        color: white;
    }

    .language-options {
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    .language-options .q-radio {
        color: white;
        font-size: 18px;
    }

    .q-card-actions {
        padding-bottom: 30px;
    }

    .btn-save {
        min-width: 300px;
        width: 50%;
        height: 5px;
        margin-top: 100px;
        background-color: #0F9DB0;
    }
</style>