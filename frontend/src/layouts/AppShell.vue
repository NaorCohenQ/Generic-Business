<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="logo">🏗️</div>
      <h1>Business Dashboard</h1>
      <div class="controls">
        <button @click="toggleSidebar">{{ sidebarOpen ? '⟨' : '⟩' }}</button>
        <button @click="toggleTick">{{ ticking ? 'Pause' : 'Resume' }}</button>
        <select v-model="speed">
          <option :value="1">x1</option>
          <option :value="2">x2</option>
        </select>
      </div>
    </header>
    <div class="content">
      <SideNav :open="sidebarOpen" />
      <main><router-view /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import SideNav from './SideNav.vue';
import { useBusinessStore } from '../stores/useBusinessStore';
import { useSimStore } from '../stores/useSimStore';

const sidebarOpen = ref(true);
const ticking = ref(true);
const speed = ref(1);

const biz = useBusinessStore();
const sim = useSimStore();

function toggleSidebar(){ sidebarOpen.value = !sidebarOpen.value; }
function toggleTick(){ ticking.value = !ticking.value; sim.setPaused(!ticking.value); }
watch(speed, v => sim.setSpeed(Number(v)));

biz.bootstrap(); // loads init, hydrates sim, starts ticker (Day 3)
</script>

<style scoped lang="scss">
.app-shell { display: grid; grid-template-rows: 56px 1fr; height: 100vh; }
.topbar { display:flex; align-items:center; gap:1rem; padding:0 1rem; background:#0f172a; color:#fff; }
.content { display:flex; height: calc(100vh - 56px); }
main { flex:1; padding: 1rem; overflow: auto; background:#0b1020; color:#e5e7eb; }
.controls button, .controls select { margin-left:.5rem; }
</style>
