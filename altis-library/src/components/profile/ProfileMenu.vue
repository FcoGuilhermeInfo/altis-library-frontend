<script setup lang="ts">
import LanguageDialog from './LanguageDialog.vue';

import { ref } from 'vue'

const showLanguageDialog = ref(false)

function handleMenuItem(item: typeof menuItems[number]) {
    if (item.action === 'language') {
        showLanguageDialog.value = true
    }
}

const user = {
    name: 'Usuario da Silva'
}

const menuItems = [
    {
        label: 'menuprofile.profile',
        to: '/profile',
        icon: 'account_box',
    },
    {
        label: 'menuprofile.change_language',
        icon: 'language',
        action: 'language'
    },
    {
        label: 'menuprofile.logout',
        to: '/login',
        icon: 'logout',
    },

]

</script>

<template>
    <q-btn-dropdown
        flat
        dense
        icon="account_circle"
        color="white"
        size="30px"
        class="profile-dropdown"
        content-class="bg-transparent no-shadow"
        menu-anchor="bottom right"
        menu-self="top right"
        :offset="[0, 0]"
    >
        <q-list class="profile-menu">
            <q-item class="profile-header">
                <q-item-section class="profile-user">
                    <q-avatar size="45px">
                        <q-icon name="account_circle" size="50px" />
                    </q-avatar>

                    <q-item-label class="profile-name">
                        {{ user.name }}
                    </q-item-label>
                </q-item-section>
            </q-item>

            <q-separator />

            <q-item
                v-for="(item, index) in menuItems"
                :key="item.label"
                clickable
                :to="item.to"
                class="menu-options"
                @click="handleMenuItem(item)"
                :class="{ 'logout-item': index === 2 }"
                active-class="menu-item-active"
            >
                <q-item-section avatar>
                    <q-icon :name="item.icon" size="30px" />
                </q-item-section>

                <q-item-section>
                    <q-item-label class="menu-label">
                        {{ $t(item.label) }}
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </q-btn-dropdown>

    <LanguageDialog v-model="showLanguageDialog"/>
</template>

<style scoped>
.profile-dropdown {
    margin: 0;
    padding: 0;
}

.profile-dropdown :deep(.q-btn) {
    width: 48px;
    min-width: 48px;
    height: 48px;
    min-height: 48px;
    padding: 0;
    margin: 0;
}

.profile-dropdown :deep(.q-btn__content) {
    justify-content: center;
    padding: 0;
}

.profile-menu {
    width: 220px;
    height: 360px;
    background-color: #0E5E69;
    border-radius: 24px 0 0 24px;
    color: white;
    margin: 0;
}

.profile-header {
    padding: 12px 16px;
}

.profile-user {
    align-items: center;
    text-align:center;
}
.profile-name {
    margin-top: 10px;
    font-size: 16px;
    font-weight: 600;
}

.menu-item {
    min-height: 48px;
    padding: 8px 16px;
} 

.menu-icon {
    font-size: 24px
}

.logout-item {
    margin-top: 100px;
}
.menu-item-active {
    background-color: rgba(14, 94, 105, 0.12);
    border-radius: 6px;
}
</style>