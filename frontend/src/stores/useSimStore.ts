import { defineStore } from 'pinia';
import type {
  ID,
  BusinessSettings,
  QueueState,
  Order,
  Customer,
  ProductDef,
  MaterialDef
} from '../domain/types';

import { reducers } from '../domain/reducers';
import { scheduleToProductionSlots } from '../services/scheduler';
import { createTicker } from '../services/ticker';

function mapById<T extends { id: string }>(arr: T[]): Record<string, T> {
  return arr.reduce((acc, x) => { acc[x.id] = x; return acc; }, {} as Record<string, T>);
}

export const useSimStore = defineStore('sim', {
  state: () => ({
    // sim clock
    simTimeMs: 0,
    _speed: 1,
    _paused: false,
    _ticker: null as ReturnType<typeof createTicker> | null,

    // business config
    settings: null as BusinessSettings | null,
    products: [] as ProductDef[],
    materials: [] as MaterialDef[],
    productsById: {} as Record<string, ProductDef>,
    materialsById: {} as Record<string, MaterialDef>,

    // runtime
    queues: new Map<ID, QueueState>(),
    orders: new Map<ID, Order>(),
    activeCreating: new Set<ID>(),
    delivering: new Set<ID>(),

    // customers
    customersById: {} as Record<string, Customer>
  }),

  getters: {
    activeCreatingOrders(state) {
      return [...state.activeCreating].map(id => state.orders.get(id)!).filter(Boolean);
    },
    deliveringOrders(state) {
      return [...state.delivering].map(id => state.orders.get(id)!).filter(Boolean);
    }
  },

  actions: {
    hydrateFromSeed(
      settings: BusinessSettings,
      products: ProductDef[],
      materials: MaterialDef[],
      seed: { customers: Customer[]; queues: QueueState[] }
    ) {
      this.settings = settings;
      this.products = products;
      this.materials = materials;
      this.productsById = mapById(products);
      this.materialsById = mapById(materials);

      // queues
      this.queues.clear();
      seed.queues.forEach(q => this.queues.set(q.id, { ...q }));

      // customers
      this.customersById = mapById(seed.customers);

      // create initial orders for each customer currently in a queue
      for (const q of seed.queues) {
        for (const customerId of q.customerIds) {
          const c = this.customersById[customerId];
          if (!c) continue;
          const productId = c.requestedProductId || this.products[0]?.id;
          const now = Date.now();
          const order: Order = {
            id: `o_${customerId}_${now}`,
            customerId,
            queueId: q.id,
            productId: productId!,
            status: 'Queued',
            createdAt: now,
            updatedAt: now,
            orderingSecondsLeft: c.orderTimeSeconds,
            currentMaterialIndex: -1,
            currentMaterialSecondsLeft: 0,
            deliverySecondsLeft: 0,
          };
          this.orders.set(order.id, order);
        }
      }
    },

    startTicker() {
      if (!this.settings || this._ticker) return;
      this._ticker = createTicker(() => this.tick(), this.settings.clockTickMs);
      this._ticker.start();
    },
    setPaused(val: boolean) { this._paused = val; this._ticker?.setPaused(val); },
    setSpeed(mult: number) { this._speed = mult || 1; this._ticker?.setSpeed(mult || 1); },

    tick() {
      if (!this.settings || this._paused) return;
      const dtMs = this.settings.clockTickMs * this._speed;
      this.simTimeMs += dtMs;

      reducers.advanceOrdering(this, dtMs);
      scheduleToProductionSlots(this);
      reducers.advanceCreation(this, dtMs);
      reducers.advanceDelivery(this, dtMs);
    }
  }
});
