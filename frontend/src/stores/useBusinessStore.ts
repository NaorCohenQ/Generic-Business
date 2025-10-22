import { defineStore } from 'pinia';
import type { BusinessSettings, MaterialDef, ProductDef, QueueState, Customer } from '../domain/types';
import { api } from '../services/apiClient';
import { useSimStore } from './useSimStore';

export const useBusinessStore = defineStore('biz', {
  state: () => ({
    settings: null as BusinessSettings | null,
    materials: [] as MaterialDef[],
    products: [] as ProductDef[],
    seed: { customers: [] as Customer[], queues: [] as QueueState[] }
  }),
  actions: {
    async bootstrap() {
      const data = await api.getInit();
      this.settings = data.settings;
      this.materials = data.materials;
      this.products = data.products;
      this.seed = data.seed;
      const sim = useSimStore();
      sim.hydrateFromSeed(this.settings!, this.products, this.materials, this.seed);
      // ticker starts Day 3
    }
  }
});
