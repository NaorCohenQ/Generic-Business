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

    <span class="sep" />

    <button class="btn danger" :disabled="busy" @click="resetSim">
      {{ busy ? 'Resetting…' : '⟲ Reset' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useSimStore } from '../stores/useSimStore';
import { useBusinessStore } from '../stores/useBusinessStore';
import { clearSnapshot } from '../services/persistence';

const sim = useSimStore();
const biz = useBusinessStore();

const speed = ref(sim.speed ?? 1);
const busy = ref(false);

function togglePause(){ sim.setPaused(!sim.paused); }
function changeSpeed(){ sim.setSpeed(speed.value); }

async function resetSim() {
  if (busy.value) return;
  const ok = window.confirm('Reset simulation and clear saved state?');
  if (!ok) return;

  try {
    busy.value = true;
    sim.setPaused(true);          // freeze current tick
    clearSnapshot();              // remove localStorage snapshot
    await biz.bootstrap();        // re-fetch /init and rehydrate sim fresh
  } finally {
    busy.value = false;
  }
}

// optional: keyboard shortcuts (Space/1/2/4; Shift+R for reset)
function onKey(e: KeyboardEvent) {
  if (e.code === 'Space') { e.preventDefault(); togglePause(); }
  else if (e.key === '1') { speed.value = 1; changeSpeed(); }
  else if (e.key === '2') { speed.value = 2; changeSpeed(); }
  else if (e.key === '4') { speed.value = 4; changeSpeed(); }
  else if ((e.key === 'R' || e.key === 'r') && e.shiftKey) { resetSim(); }
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
.btn:disabled { opacity:.6; cursor:not-allowed; }
.btn.danger { border-color:#7f1d1d; background:#3f1d1d; }
.btn.danger:hover { background:#5b1d1d; }
.speed select {
  margin-left:.4rem; padding:.25rem .4rem;
  background:#0b1020; color:#e5e7eb; border:1px solid #334155; border-radius:6px;
}
.clock { font-variant-numeric: tabular-nums; opacity:.85; margin-left:.25rem; }
.sep { width:1px; height:22px; background:#334155; display:inline-block; margin:0 .25rem; }
</style>
