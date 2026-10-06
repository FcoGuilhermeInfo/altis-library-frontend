<script setup lang="ts">
import ProfileMenu from '@/components/profile/ProfileMenu.vue'
</script>

<template>
  <q-toolbar class="app-toolbar">
    <img
      src="@/assets/lokbooks.svg"
      alt="LokBooks"
      class="app-logo"
    />

    <q-space />

    <ProfileMenu />
  </q-toolbar>
</template>

<style scoped>
.app-toolbar {
  min-height: 100%;
  padding: 0;
}

.app-logo {
  width: 75px;
  height: auto;
  margin-left: 70px;
  margin-top: 15px;
}
</style>