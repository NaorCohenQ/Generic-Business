<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="left">
        <div class="logo">🏗️</div>
        <h1>Business Dashboard</h1>
      </div>

      <div class="right">
        <!-- show only when debug is enabled or toggled via D -->
        <SimControls v-if="showDebug" />
        <button class="btn toggler" @click="toggleSidebar">{{ sidebarOpen ? '⟨' : '⟩' }}</button>
      </div>
    </header>

    <div class="content">
      <SideNav :open="sidebarOpen" />
      <main><router-view /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import SideNav from './layouts/SideNav.vue';
import { useBusinessStore } from './stores/useBusinessStore';
import { useSimStore } from './stores/useSimStore';
import SimControls from './components/SimControls.vue';

const sidebarOpen = ref(true);
function toggleSidebar(){ sidebarOpen.value = !sidebarOpen.value; }

const biz = useBusinessStore();
const sim = useSimStore();
biz.bootstrap();

// debug visibility: env flag OR press 'D' to toggle
const envDebug = (import.meta.env.VITE_DEBUG_UI ?? 'false').toString() === 'true';
const toggled = ref(false);
const showDebug = computed(() => envDebug || toggled.value);

function onKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() === 'd') { toggled.value = !toggled.value; }
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped lang="scss">
.app-shell { display:grid; grid-template-rows:56px 1fr; height:100vh; }
.topbar {
  display:flex; align-items:center; justify-content:space-between;
  gap:1rem; padding:0 1rem; background:#0f172a; color:#fff;
}
.left { display:flex; align-items:center; gap:.75rem; }
.logo { width:28px; height:28px; display:grid; place-items:center; background:#1f2937; border-radius:6px; }
.right { display:flex; align-items:center; gap:.5rem; }
.btn {
  padding:.35rem .6rem; background:#1f2937; color:#e5e7eb;
  border:1px solid #334155; border-radius:8px; cursor:pointer;
}
.btn:hover { background:#111827; }
.content { display:flex; height:calc(100vh - 56px); }
main { flex:1; padding:1rem; overflow:auto; background:#0b1020; color:#e5e7eb; }
</style>
