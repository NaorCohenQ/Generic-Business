import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', name: 'dashboard', component: Dashboard }]
});
