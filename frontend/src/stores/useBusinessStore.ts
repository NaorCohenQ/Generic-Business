// import { defineStore } from 'pinia';
// import type { BusinessSettings, MaterialDef, ProductDef, QueueState, Customer } from '../domain/types';
// import { api } from '../services/apiClient';
// import { useSimStore } from './useSimStore';

// export const useBusinessStore = defineStore('biz', {
//   state: () => ({
//     settings: null as BusinessSettings | null,
//     materials: [] as MaterialDef[],
//     products: [] as ProductDef[],
//     seed: { customers: [] as Customer[], queues: [] as QueueState[] },
//     isLoaded: false,
//     error: '' as string | ''
//   }),
//   actions: {
//     async bootstrap() {
//       try {
//         const data = await api.getInit();
//         this.settings = data.settings;
//         this.materials = data.materials;
//         this.products = data.products;
//         this.seed = data.seed;

//         const sim = useSimStore();
//         sim.hydrateFromSeed(this.settings!, this.products, this.materials, this.seed);
//         sim.startTicker();

//         this.isLoaded = true;
//       } catch (e:any) {
//         this.error = e?.message ?? 'Failed to load init';
//         console.error(e);
//       }
//     }
//   }
// });


// frontend/src/stores/useBusinessStore.ts
import { defineStore } from 'pinia';
import type { BusinessSettings, MaterialDef, ProductDef, QueueState, Customer } from '../domain/types';
import { api } from '../services/apiClient';
import { useSimStore } from './useSimStore';
import { loadSnapshot, buildSnapshot, saveSnapshot, clearSnapshot } from '../services/persistence';

export const useBusinessStore = defineStore('biz', {
  state: () => ({
    settings: null as BusinessSettings | null,
    materials: [] as MaterialDef[],
    products: [] as ProductDef[],
    seed: { customers: [] as Customer[], queues: [] as QueueState[] },
    isLoaded: false,
    error: '' as string | ''
  }),
  actions: {
    async bootstrap() {
      this.isLoaded = false;
      this.error = '';
      const sim = useSimStore();

      // ---- Day 4: try snapshot first
      const snap = loadSnapshot();
      if (snap) {
        try {
          // restore biz config from snapshot
          this.settings = snap.biz.settings;
          this.materials = snap.biz.materials;
          this.products = snap.biz.products;

          // hydrate sim indexes / lookups based on restored biz
          sim.settings = this.settings;
          sim.products = this.products;
          sim.materials = this.materials;
          sim.productsById = Object.fromEntries(this.products.map(p => [p.id, p]));
          sim.materialsById = Object.fromEntries(this.materials.map(m => [m.id, m]));

          // restore runtime sim
          sim.applySimSnapshot(snap.sim);

          // boot
          sim.startTicker();
          this.isLoaded = true;
          return;
        } catch (e) {
          console.warn('[bootstrap] snapshot restore failed; falling back to /init', e);
          // if snapshot corrupt, clear it to avoid loops
          clearSnapshot();
        }
      }

      // ---- No snapshot or restore failed: do fresh /init
      try {
        const data = await api.getInit();
        this.settings = data.settings;
        this.materials = data.materials;
        this.products = data.products;
        this.seed = data.seed;

        sim.hydrateFromSeed(this.settings!, this.products, this.materials, this.seed);
        sim.startTicker();

        // do an initial save so refresh immediately resumes
        const firstSnap = buildSnapshot({
          biz: { settings: this.settings!, materials: this.materials, products: this.products },
          sim: {
            simTimeMs: sim.simTimeMs,
            queues: sim.queues,
            orders: sim.orders,
            activeCreating: sim.activeCreating,
            delivering: sim.delivering
          }
        });
        saveSnapshot(firstSnap);

        this.isLoaded = true;
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load init';
        console.error(e);
      }
    }
  }
});
