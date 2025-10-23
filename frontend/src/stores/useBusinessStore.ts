import { defineStore } from 'pinia';
import type { BusinessSettings, MaterialDef, ProductDef, QueueState, Customer } from '../domain/types';
import { api } from '../services/apiClient';
import { useSimStore } from './useSimStore';

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
      try {
        const data = await api.getInit();
        this.settings = data.settings;
        this.materials = data.materials;
        this.products = data.products;
        this.seed = data.seed;

        const sim = useSimStore();
        sim.hydrateFromSeed(this.settings!, this.products, this.materials, this.seed);
        sim.startTicker();

        this.isLoaded = true;
      } catch (e:any) {
        this.error = e?.message ?? 'Failed to load init';
        console.error(e);
      }
    }
  }
});
