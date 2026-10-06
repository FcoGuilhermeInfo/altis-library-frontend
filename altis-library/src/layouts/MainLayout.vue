<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppMenu from '@/components/AppMenu.vue'
</script>

<template>
  <q-layout view="hHh Lpr lFf">

    <q-header class="app-header">
      <AppHeader />
    </q-header>

    <q-drawer
      show-if-above
      :width="250"
      :breakpoint="600"
      class="app-drawer"
    >
      <AppMenu />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<style>
.app-header {
  background-color: #0B717F;
  height: 10vh;
}

.app-drawer {
  background-color: #0E5E69;
  color: white;
}
</style>