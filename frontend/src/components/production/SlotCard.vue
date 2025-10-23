<template>
  <div class="slot-card" v-if="order">
    <div class="title">
      <strong>Order {{ short(order.id) }}</strong>
      <span class="status">Creating</span>
    </div>
    <div class="sub">Product: {{ product?.name || '—' }}</div>

    <div class="materials">
      <span
        v-for="(mid, idx) in product?.materialIds || []"
        :key="mid"
        class="chip"
        :class="{
          done: idx < order.currentMaterialIndex,
          current: idx === order.currentMaterialIndex,
          pending: idx > order.currentMaterialIndex
        }"
        :title="materialName(mid)"
      >
        {{ materialIcon(mid) }} {{ materialName(mid) }}
        <template v-if="idx === order.currentMaterialIndex">
          ({{ order.currentMaterialSecondsLeft.toFixed(0) }}s)
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSimStore } from '../../stores/useSimStore';

// ✅ camelCase in TS
const props = defineProps<{ orderId: string }>();

const sim = useSimStore();
const order = computed(() => sim.orders.get(props.orderId));
const product = computed(() => order.value ? sim.productsById[order.value.productId] : null);

function materialName(id: string) { return sim.materialsById[id]?.name || id; }
function materialIcon(id: string) { return sim.materialsById[id]?.icon || '🧩'; }
function short(id: string) { return id.slice(0, 6); }
</script>

<style scoped>
.slot-card { padding:12px; background:#1f2937; border-radius:12px; }
.title { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.sub { opacity:.85; margin-bottom:8px; }
.materials { display:flex; flex-wrap:wrap; gap:6px; }
.chip { padding:4px 8px; border-radius:999px; background:#374151; }
.chip.done { background:#065f46; }
.chip.current { background:#2563eb; }
.chip.pending { background:#374151; opacity:.8; }
.status { font-size:12px; opacity:.8; }
</style>
