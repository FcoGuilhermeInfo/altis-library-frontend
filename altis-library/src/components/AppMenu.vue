<script setup lang="ts">
import { computed } from 'vue';
import { ROLES } from '@/constants/roles';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const menuItems = [
  {
    label: 'menu.dashboard',
    to: '/dashboard',
    icon: 'home',
    roles: [ROLES.ADMIN, ROLES.USER],
  },
  {
    label: 'menu.loans',
    to: '/loans',
    icon: 'handshake',
    roles: [ROLES.ADMIN],
  },
  {
    label: 'menu.users',
    to: '/users',
    icon: 'people',
    roles: [ROLES.ADMIN],
  },
  {
    label: 'menu.publishers',
    to: '/publishers',
    icon: 'business',
    roles: [ROLES.ADMIN],
  },
  {
    label: 'menu.books',
    to: '/books',
    icon: 'menu_book',
    roles: [ROLES.ADMIN],
  },
];

const visibleMenuItems = computed(() => {
  const userRole = authStore.user?.role;

  if (!userRole) {
    return [];
  }

  return menuItems.filter((item) => item.roles.some((allowedRole) => allowedRole === userRole));
});
</script>

<template>
  <q-list>
    <q-item
      v-for="(item, index) in visibleMenuItems"
      :key="item.to"
      clickable
      :to="item.to"
      active-class="menu-item-active"
      class="menu-item"
      :class="{ 'dashboard-item': index === 0 }"
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
</template>

<style scoped>
.menu-item {
  margin-top: 20px;
  color: white;
}

.menu-icon {
  width: 20px;
  height: 20px;
}

.menu-item-active {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
}

.dashboard-item {
    margin-top: 30px;
    margin-bottom: 50px;
}

.menu-label {
    font-size: 25px;
    font-weight: 250;
}
</style>