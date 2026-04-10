import { defineStore } from 'pinia';
import axios from 'axios';

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
      if (storedUser && storedUser !== "undefined") {
    try {
      this.currentUser = JSON.parse(storedUser);
      this.isAuthenticated = true;
    } catch (error) {
      // 혹시 저장된 데이터가 깨져있을 경우를 대비
      console.error("로컬 스토리지 데이터 파싱 에러:", error);
      this.logout(); 
    }
  } else {
    // 데이터가 없으면 초기 상태 유지
    this.currentUser = null;
    this.isAuthenticated = false;
  }
    },
    // 닉네임, 비밀번호 수정 및 저장
    async updateUser(nickname, password) {
      const res = await axios.patch(
        `http://localhost:3000/users/${this.currentUser.id}`,
        {
          nickname,
          password,
        },
      );
      this.currentUser = res.data;
      // ⭐ localStorage에 저장
      localStorage.setItem('currentUser', JSON.stringify(res.data));
    },
  },
});
