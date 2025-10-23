import type { Order } from '../domain/types';

export function scheduleToProductionSlots(state: any) {
  const settings = state.settings;
  if (!settings) return;

  const capacity = settings.productionSlots - state.activeCreating.size;
  if (capacity <= 0) return;

  const waiting: Order[] = [...state.orders.values()].filter(o => o.status === 'Accepted');

  for (const o of waiting.slice(0, capacity)) {
    const p = state.productsById[o.productId];
    if (!p) continue;

    o.status = 'Creating';
    o.currentMaterialIndex = 0;

    const firstMatId = p.materialIds[0];
    const md = state.materialsById[firstMatId];
    o.currentMaterialSecondsLeft = md?.buildSeconds ?? 0;

    state.activeCreating.add(o.id);
  }
}
