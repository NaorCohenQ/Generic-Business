<template>
  <div class="queuebar">
    <strong>{{ queue.name }}</strong>
    <div class="lights">
      <span
        v-for="i in totalDots"
        :key="i"
        :class="{ on: i <= filled }"
      />
    </div>
    <small>{{ state.customerIds.length }} in line</small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  queue: { id: string; name: string };
  state: { id: string; customerIds: string[] };
}>();

const totalDots = 5;

//recompute whenever queue length changes
const filled = computed(() =>
  Math.min(totalDots, props.state.customerIds.length)
);
</script>

<style scoped>
.queuebar { padding:12px; background:#1f2937; border-radius:12px; color:#e5e7eb; }
.lights { display:flex; gap:6px; margin:8px 0; }
.lights span { width:10px; height:10px; border-radius:50%; background:#374151; transition: background-color .2s; }
.lights span.on { background:#10b981; }
small { opacity:.7; }
</style>
