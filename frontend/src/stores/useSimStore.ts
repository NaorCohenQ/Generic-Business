// frontend/src/stores/useSimStore.ts
import { defineStore } from 'pinia';
import type {
  ID, BusinessSettings, QueueState, Order, Customer, ProductDef, MaterialDef
} from '../domain/types';
import { reducers } from '../domain/reducers';
import { scheduleToProductionSlots } from '../services/scheduler';
import { createTicker } from '../services/ticker';
import { buildSnapshot, saveSnapshot, hydrateSimFromSnapshot } from '../services/persistence';

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
    _ticksSinceSave: 0,           // <-- Day 4: throttle autosave

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
    },
    paused: (state) => state._paused,
    speed:  (state) => state._speed
  },

  actions: {
    // called by BusinessStore when fresh data arrives
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
      this.queues = new Map(); // replace to keep reactivity simple
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

    // ---- Day 4: apply snapshot (sim part only; biz will set config)
    applySimSnapshot(snapSim: {
      simTimeMs: number;
      queues: Record<string, QueueState>;
      orders: Record<string, Order>;
      activeCreating: string[];
      delivering: string[];
    }) {
      hydrateSimFromSnapshot(this as any, snapSim);
    },

    startTicker() {
      if (!this.settings || this._ticker) return;
      this._ticker = createTicker(() => this.tick(), this.settings.clockTickMs);
      this._ticker.start();

      // save on tab close (best-effort)
      if (typeof window !== 'undefined') {
        const onUnload = () => {
          try {
            const snap = buildSnapshot({
              biz: { settings: this.settings!, materials: this.materials, products: this.products },
              sim: {
                simTimeMs: this.simTimeMs,
                queues: this.queues,
                orders: this.orders,
                activeCreating: this.activeCreating,
                delivering: this.delivering
              }
            });
            saveSnapshot(snap);
          } catch {}
        };
        window.addEventListener('beforeunload', onUnload);
      }
    },

    setPaused(val: boolean) { this._paused = val; this._ticker?.setPaused(val); },
    setSpeed(mult: number)  { this._speed = mult || 1; this._ticker?.setSpeed(mult || 1); },

    tick() {
      if (!this.settings || this._paused) return;

      const dtMs = this.settings.clockTickMs * this._speed;
      this.simTimeMs += dtMs;

      reducers.advanceOrdering(this, dtMs);
      scheduleToProductionSlots(this);
      reducers.advanceCreation(this, dtMs);
      reducers.advanceDelivery(this, dtMs);

      // ---- Day 4: throttle autosave (e.g., every ~1s for 200ms tick)
      this._ticksSinceSave++;
      const SAVE_EVERY_TICKS = Math.max(1, Math.round(1000 / (this.settings.clockTickMs || 200)));
      if (this._ticksSinceSave >= SAVE_EVERY_TICKS) {
        this._ticksSinceSave = 0;
        try {
          const snap = buildSnapshot({
            biz: { settings: this.settings, materials: this.materials, products: this.products } as any,
            sim: {
              simTimeMs: this.simTimeMs,
              queues: this.queues,
              orders: this.orders,
              activeCreating: this.activeCreating,
              delivering: this.delivering
            }
          });
          saveSnapshot(snap);
        } catch (e) {
          // ignore persistence errors silently
        }
      }
    }
  }
});
