<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  // 로그아웃 처리
  alert('로그아웃 되었습니다!');
  authStore.logout();
  // 로그인 페이지로 리다이렉트
  router.push('/auth/login');
});
</script>

<template>
  <div></div>
</template>
