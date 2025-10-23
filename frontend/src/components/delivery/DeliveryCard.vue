<template>
  <div class="delivery" v-if="order">
    <div class="row">
      <strong>Order:</strong> {{ short(order.id) }}
    </div>
    <div class="row">
      <strong>Time Left:</strong> {{ order.deliverySecondsLeft.toFixed(0) }}s
    </div>
    <div class="badge">In delivery</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSimStore } from '../../stores/useSimStore';

// ✅ camelCase in TS
const props = defineProps<{ orderId: string }>();

const sim = useSimStore();
const order = computed(() => sim.orders.get(props.orderId));

function short(id: string) { return id.slice(0, 6); }
</script>

<style scoped>
.delivery { padding:12px; background:#1f2937; border-radius:10px; display:flex; align-items:center; gap:12px; }
.row { min-width: 120px; }
.badge { margin-left:auto; padding:4px 10px; background:#f59e0b; color:#111827; border-radius:999px; font-weight:600; }
</style>
