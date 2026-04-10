import { defineStore } from 'pinia';
import axios from 'axios';

function clearBudgetViewState() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem('budget:selected-date');
  window.sessionStorage.removeItem('budget:visible-month');
  window.sessionStorage.removeItem('budget:filters');
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    isAuthenticated: false,
  }),

  actions: {
    async login(email, password) {
      const res = await axios.get('http://localhost:3000/users', {
        params: { email, password },
      });

      const user = res.data[0];

      if (!user) {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      clearBudgetViewState();

      this.currentUser = user;
      this.isAuthenticated = true;

      const { useBudgetStore } = await import('./budgetStore');
      const budgetStore = useBudgetStore();
      budgetStore.resetSessionState();

      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    },

    logout() {
      this.currentUser = null;
      this.isAuthenticated = false;

      localStorage.removeItem('currentUser');
      clearBudgetViewState();
    },

    initializeAuth() {
      const storedUser = localStorage.getItem('currentUser');

      if (!storedUser || storedUser === 'undefined') {
        this.currentUser = null;
        this.isAuthenticated = false;
        return;
      }

      try {
        this.currentUser = JSON.parse(storedUser);
        this.isAuthenticated = true;
      } catch (error) {
        console.error('로그인 스토리지 데이터 파싱 오류:', error);
        this.logout();
      }
    },

    async updateUser(nickname, password) {
      const res = await axios.patch(
        `http://localhost:3000/users/${this.currentUser.id}`,
        {
          nickname,
          password,
        },
      );

      this.currentUser = res.data;
      localStorage.setItem('currentUser', JSON.stringify(res.data));
    },
  },
});
