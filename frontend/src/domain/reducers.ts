// frontend/src/domain/reducers.ts
import type {
  Order,
  QueueState,
  Customer,
  ProductDef,
  MaterialDef
} from './types';

type SimLike = {
  settings: { deliverySeconds: number } | null;
  queues: Map<string, QueueState>;
  orders: Map<string, Order>;
  activeCreating: Set<string>;
  delivering: Set<string>;
  products: ProductDef[];
  materials: MaterialDef[];
  productsById: Record<string, ProductDef>;
  materialsById: Record<string, MaterialDef>;
  customersById: Record<string, Customer>;
};

function secs(ms: number) { return ms / 1000; }

export const reducers = {
  seedCustomersIntoQueues(state: SimLike, customers: Customer[], queueId: string) {
    const q = state.queues.get(queueId);
    if (!q) return;

    q.customerIds.push(...customers.map(c => c.id));

    for (const c of customers) {
      // ✅ TS-safe: compute productId with fallback, skip if none
      const productId = c.requestedProductId ?? state.products[0]?.id;
      if (!productId) {
        console.warn('[seed] No productId for customer', c.id);
        continue;
      }

      const now = Date.now();
      const o: Order = {
        id: `o_${c.id}_${now}`,
        customerId: c.id,
        queueId,
        productId,
        status: 'Queued',
        createdAt: now,
        updatedAt: now,
        orderingSecondsLeft: c.orderTimeSeconds,
        currentMaterialIndex: -1,
        currentMaterialSecondsLeft: 0,
        deliverySecondsLeft: 0
      };
      state.orders.set(o.id, o);
    }
  },

  advanceOrdering(state: SimLike, dtMs: number) {
    // Only head of each queue can order
    for (const q of state.queues.values()) {
      const headCustomerId = q.customerIds[0];
      if (!headCustomerId) continue;

      const order = [...state.orders.values()].find(
        (o) =>
          o.customerId === headCustomerId &&
          o.queueId === q.id &&
          (o.status === 'Queued' || o.status === 'Ordering')
      );
      if (!order) continue;

      if (order.status === 'Queued') order.status = 'Ordering';

      if (order.status === 'Ordering') {
        order.orderingSecondsLeft = Math.max(0, order.orderingSecondsLeft - secs(dtMs));
        if (order.orderingSecondsLeft === 0) {
          order.status = 'Accepted';
          order.updatedAt = Date.now();
          // customer leaves queue after ordering completes
          q.customerIds.shift();
        }
      }
    }
  },

  advanceCreation(state: SimLike, dtMs: number) {
    for (const id of [...state.activeCreating]) {
      const order = state.orders.get(id);
      if (!order || order.status !== 'Creating') continue;

      if (order.currentMaterialSecondsLeft > 0) {
        order.currentMaterialSecondsLeft = Math.max(0, order.currentMaterialSecondsLeft - secs(dtMs));
      }

      if (order.currentMaterialSecondsLeft === 0) {
        // Move to next material
        order.currentMaterialIndex++;
        const p = state.productsById[order.productId];
        if (!p) continue;

        if (order.currentMaterialIndex >= p.materialIds.length) {
          // Finished creation -> handoff to delivery
          order.status = 'Created';
          state.activeCreating.delete(order.id);

          order.status = 'Delivering';
          order.deliverySecondsLeft = state.settings?.deliverySeconds ?? 0;
          state.delivering.add(order.id);
        } else {
          // ✅ TS-safe: index is in-bounds here
          const mid = p.materialIds[order.currentMaterialIndex]!;
          const md = state.materialsById[mid];
          order.currentMaterialSecondsLeft = md ? md.buildSeconds : 0;
        }
      }
    }
  },

  advanceDelivery(state: SimLike, dtMs: number) {
    for (const id of [...state.delivering]) {
      const o = state.orders.get(id);
      if (!o || o.status !== 'Delivering') continue;

      if (o.deliverySecondsLeft > 0) {
        o.deliverySecondsLeft = Math.max(0, o.deliverySecondsLeft - secs(dtMs));
      }
      if (o.deliverySecondsLeft === 0) {
        o.status = 'Delivered';
        state.delivering.delete(id);
      }
    }
  }
};
