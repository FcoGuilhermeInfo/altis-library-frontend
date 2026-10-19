<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()

function goBack() {
    router.back()
}
</script>

<template>
    <q-page class="flex flex-center">
        <q-card flat border class="access-denied-card">
            <q-card-section class="text-center">
                <div class="column items-center q-gutter-md">
                    <q-icon     
                        name="lock"
                        size="64px" 
                        color="negative"
                    />
                
                    <h1 class="text-h2 q-ma-none">403</h1>

                    <h2 class="text-h5 q-ma-none">{{ $t('acessDenied.acessDenied') }}</h2>

                    <p class="text-body1 text-center">{{ $t('acessDenied.message') }}</p>

                    <q-btn
                        color="primary"
                        unelevated
                        no-caps
                        :label="$t('acessDenied.return')"
                        @click="goBack"
                    />
                </div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<style scoped> 
    .acess-denied-card {
        width: 100%;
        max-width: 420px;
        padding: 24px;
        border-radius: 12px;
    }
</style>