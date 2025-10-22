import { defineStore } from 'pinia';
import type { ID, BusinessSettings, QueueState, Order, Customer, ProductDef, MaterialDef } from '../domain/types';

export const useSimStore = defineStore('sim', {
  state: () => ({
    simTime: 0,
    settings: null as BusinessSettings | null,
    products: [] as ProductDef[],
    materials: [] as MaterialDef[],
    queues: new Map<ID, QueueState>(),
    orders: new Map<ID, Order>(),
    activeCreating: new Set<ID>(),
    delivering: new Set<ID>(),
    _speed: 1,
    _paused: false
  }),
  getters: {
    activeCreatingOrders(state){ return [...state.activeCreating].map(id => state.orders.get(id)!).filter(Boolean); },
    deliveringOrders(state){ return [...state.delivering].map(id => state.orders.get(id)!).filter(Boolean); }
  },
  actions: {
    hydrateFromSeed(settings: BusinessSettings, products: ProductDef[], materials: MaterialDef[], seed:{customers:Customer[], queues:QueueState[]}) {
      this.settings = settings; this.products = products; this.materials = materials;
      seed.queues.forEach(q => this.queues.set(q.id, { ...q }));
      // Orders will be seeded Day 3; for Day 2 we just load structure.
    },
    setPaused(v:boolean){ this._paused = v; },
    setSpeed(mult:number){ this._speed = mult; }
  }
});
