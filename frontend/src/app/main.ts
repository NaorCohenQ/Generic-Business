import { createApp } from 'vue';
import { createPinia } from 'pinia';
import AppShell from '@/layouts/AppShell.vue';
import router from './router';
import './app.scss';

const app = createApp(AppShell);
app.use(createPinia());
app.use(router);
app.mount('#app');
