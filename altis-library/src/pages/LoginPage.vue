<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="login-layout">
    <q-page-container>
      <q-page class="login-page">
        <section class="login-brand">
          <div class="brand-content">
            <img src="@/assets/lokbooks.svg" alt="Símbolo LokBooks" class="login-logo" />

            <h2 class="brand-name">LokBooks</h2>
          </div>
        </section>

        <section class="login-content">
          <LoginForm />
        </section>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.login-layout {
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background-color: white;
}

.login-page {
  height: 100vh;
  min-height: 100vh;
  display: flex;
  background-color: white;
}

.login-brand {
  width: 40.6%;
  height: 100%;
  flex: 0 0 40.6%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0b717f;
  box-sizing: border-box;
}

.brand-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-logo {
  display: block;
  width: 152px;
  height: auto;
}

.brand-name {
  margin: 0;
  color: white;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.2;
}

.login-content {
  width: 59.4%;
  height: 100%;
  flex: 1 1 59.4%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 24px 40px;
}
</style>
