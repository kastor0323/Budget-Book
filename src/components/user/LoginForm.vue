// 로그인 입력 폼 컴포넌트
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="title-section">
        <h1 class="main-title">💰 Duck Book</h1>
        <p class="subtitle">나만의 스마트 가계부</p>
      </div>
      <form class="login-form" @submit.prevent="login">
        <label class="input-label">이메일</label>
        <input v-model="email" type="email" class="text-input" required />

        <label class="input-label">비밀번호</label>
        <input
          v-model="password"
          type="password"
          class="text-input"
          autocomplete="current-password"
          required
        />

        <button type="submit" class="submit-btn">로그인</button>
      </form>
      <p class="signup-text">
        계정이 없으신가요?
        <router-link to="/auth/signup" class="signup-link"
          >회원가입</router-link
        >
      </p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';

export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
    };
  },
  methods: {
    async login() {
      const authStore = useAuthStore();
      try {
        await authStore.login(this.email, this.password);
        this.$router.push('/ledgers');
      } catch (error) {
        alert(error.message);
      }
    },
  },
};
</script>
