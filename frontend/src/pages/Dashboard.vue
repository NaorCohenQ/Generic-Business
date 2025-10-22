<template>
  <section class="dashboard">
    <h2>Queue Status</h2>
    <div class="panel">
      <QueueBar v-for="q in biz.settings?.queues || []" :key="q.id" :queue="q" />
    </div>

    <h2>Production Status</h2>
    <div class="panel">
      <SlotCard v-for="o in sim.activeCreatingOrders" :key="o?.id" :order="o" />
    </div>

    <h2>Delivery Status</h2>
    <div class="panel">
      <DeliveryCard v-for="o in sim.deliveringOrders" :key="o?.id" :order="o" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useBusinessStore } from '../stores/useBusinessStore';
import { useSimStore } from '../stores/useSimStore';
import QueueBar from '../components/queue/QueueBar.vue';
import SlotCard from '../components/production/SlotCard.vue';
import DeliveryCard from '../components/delivery/DeliveryCard.vue';

const biz = useBusinessStore();
const sim = useSimStore();
</script>

<style scoped>
.panel { display:grid; gap:12px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
h2 { margin: 24px 0 8px; }
</style>
