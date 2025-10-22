<template>
  <div class="queuebar">
    <strong>{{ queue.name }}</strong>
    <div class="lights">
      <span v-for="i in 5" :key="i" :class="{on: i <= intensity}"></span>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ queue: { id:string; name:string } }>();
const intensity = 2; // TODO: bind to actual queue length later
</script>
<style scoped>
.queuebar { padding:10px; background:#1f2937; border-radius:10px; }
.lights { display:flex; gap:6px; margin-top:8px; }
.lights span { width:10px; height:10px; border-radius:50%; background:#374151; }
.lights span.on { background:#10b981; }
</style>
