import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/pages/LoginPage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import CalendarPage from '@/pages/CalendarPage.vue';
import AnalysisPage from '@/pages/AnalysisPage.vue';
import LogoutPage from '@/pages/LogoutPage.vue';
import MyPage from '@/pages/MyPage.vue';
import AnalysisPage from '@/pages/AnalysisPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth/login',
    },
    {
      path: '/auth/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/auth/signup',
      name: 'signup',
      component: RegisterPage,
    },
    {
      path: '/auth/logout',
      name: 'logout',
      component: LogoutPage,
    },
    {
      path: '/ledgers',
      name: 'ledgers',
      component: CalendarPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/analysis',
      name: 'Analysis',
      component: AnalysisPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/user/me',
      name: 'MyPage',
      component: MyPage,
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: AnalysisPage,
    },
  ],
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.currentUser) {
    return '/auth/login';
  }
});

export default router;
