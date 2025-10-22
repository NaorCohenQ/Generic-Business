<!-- <script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style> -->


<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="logo">🏗️</div>
      <h1>Business Dashboard</h1>
      <div class="controls">
        <button @click="toggleSidebar">{{ sidebarOpen ? '⟨' : '⟩' }}</button>
      </div>
    </header>
    <div class="content">
      <SideNav :open="sidebarOpen" />
      <main><router-view /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SideNav from './layouts/SideNav.vue';
import { useBusinessStore } from './stores/useBusinessStore';

const sidebarOpen = ref(true);
function toggleSidebar(){ sidebarOpen.value = !sidebarOpen.value; }

const biz = useBusinessStore();
biz.bootstrap(); // Day 2: loads /init and hydrates stores
</script>

<style scoped lang="scss">
.app-shell { display: grid; grid-template-rows: 56px 1fr; height: 100vh; }
.topbar { display:flex; align-items:center; gap:1rem; padding:0 1rem; background:#0f172a; color:#fff; }
.content { display:flex; height: calc(100vh - 56px); }
main { flex:1; padding: 1rem; overflow:auto; background:#0b1020; color:#e5e7eb; }
</style>
