<template>
  <div class="delivery">
    <div><strong>Order:</strong> {{ order?.id?.slice(0,6) || '—' }}</div>
    <div><strong>Time Left:</strong> 00:00</div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ order: any }>();
</script>
<style scoped>
.delivery { padding:12px; background:#1f2937; border-radius:10px; }
</style>
