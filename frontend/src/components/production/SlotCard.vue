<template>
  <div class="slot-card">
    <div class="title">Order {{ order?.id?.slice(0,6) || '—' }}</div>
    <div class="materials">
      <span class="chip">mat 1</span>
      <span class="chip">mat 2</span>
      <span class="chip">mat 3</span>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ order: any }>();
</script>
<style scoped>
.slot-card { padding:12px; background:#1f2937; border-radius:10px; }
.title { font-weight:700; margin-bottom:8px; }
.chip { padding:4px 8px; background:#374151; border-radius:999px; margin-right:6px; }
</style>
