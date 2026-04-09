import { createRouter, createWebHistory } from 'vue-router';
import AnalysisPage from '@/pages/AnalysisPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: AnalysisPage,
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: AnalysisPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
