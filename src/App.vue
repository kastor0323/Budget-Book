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
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  width: 100%;
  min-height: 100%;
}

body {
  font-family: sans-serif;
  background: #f9fafb;
  color: #111827;
}
</style>
