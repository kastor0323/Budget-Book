import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/pages/LoginPage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import CalendarPage from '@/pages/CalendarPage.vue';
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
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.currentUser) {
    next('/auth/login');
  } else {
    next();
  }
});

export default router;
