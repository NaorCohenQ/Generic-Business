<template>
  <div class="controls">
    <button class="btn" @click="togglePause">
      {{ sim.paused ? '▶︎ Resume' : '⏸ Pause' }}
    </button>

    <label class="speed">
      Speed
      <select v-model.number="speed" @change="changeSpeed">
        <option :value="1">1×</option>
        <option :value="2">2×</option>
        <option :value="4">4×</option>
      </select>
    </label>

    <span class="clock">t={{ (sim.simTimeMs/1000).toFixed(1) }}s</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useSimStore } from '../stores/useSimStore';

const sim = useSimStore();
const speed = ref(sim.speed ?? 1);

function togglePause(){ sim.setPaused(!sim.paused); }
function changeSpeed(){ sim.setSpeed(speed.value); }

// optional: keyboard shortcuts local to this bar (Space / 1 / 2 / 4)
function onKey(e: KeyboardEvent) {
  if (e.code === 'Space') { e.preventDefault(); togglePause(); }
  else if (e.key === '1') { speed.value = 1; changeSpeed(); }
  else if (e.key === '2') { speed.value = 2; changeSpeed(); }
  else if (e.key === '4') { speed.value = 4; changeSpeed(); }
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
.controls { display:flex; align-items:center; gap:.5rem; }
.btn {
  padding:.35rem .6rem; background:#1f2937; color:#e5e7eb;
  border:1px solid #334155; border-radius:8px; cursor:pointer;
}
.btn:hover { background:#111827; }
.speed select {
  margin-left:.4rem; padding:.25rem .4rem;
  background:#0b1020; color:#e5e7eb; border:1px solid #334155; border-radius:6px;
}
.clock { font-variant-numeric: tabular-nums; opacity:.85; margin-left:.25rem; }
</style>
