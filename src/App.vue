<script setup>
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// 앱 시작 시 인증 상태 초기화
const authStore = useAuthStore();
authStore.initializeAuth();
</script>

<template>
  <RouterView />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
