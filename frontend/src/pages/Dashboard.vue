<template>
  <section class="dashboard">
    <h2>Queue Status</h2>
    <div class="panel">
      <QueueBar
        v-for="q in biz.settings?.queues || []"
        :key="q.id"
        :queue="q"
        :state="sim.queues.get(q.id) || { id: q.id, customerIds: [] }"
      />
    </div>

    <h2>Production Status</h2>
    <div class="panel">
      <!-- ✅ camelCase -->
      <SlotCard v-for="o in sim.activeCreatingOrders" :key="o.id" :orderId="o.id" />
    </div>

    <h2>Delivery Status</h2>
    <div class="panel">
      <!-- ✅ camelCase -->
      <DeliveryCard v-for="o in sim.deliveringOrders" :key="o.id" :orderId="o.id" />
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
.panel { display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
h2 { margin: 24px 0 8px; }
</style>
