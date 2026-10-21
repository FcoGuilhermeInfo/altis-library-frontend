<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
</script>

<template>
  <AuthLayout :reverse="true">
    <RegisterForm />
  </AuthLayout>
</template>