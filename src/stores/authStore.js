import { defineStore } from 'pinia';
import budgetData from '/budget.json';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    isAuthenticated: false,
  }),
  actions: {
    async login(email, password) {
      const user = budgetData.users.find(
        (u) => u.email === email && u.password === password,
      );
      if (user) {
        this.currentUser = user;
        this.isAuthenticated = true;

        //세션 가능하지만 실제론 보안에 취약함
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      } else {
        throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
      }
    },
    logout() {
      this.currentUser = null;
      this.isAuthenticated = false;
      localStorage.removeItem('currentUser');
    },

    initializeAuth() {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        this.isAuthenticated = true;
      }
    },
  },
});
