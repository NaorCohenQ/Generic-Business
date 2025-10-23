// frontend/src/services/persistence.ts
import type {
  BusinessSettings,
  MaterialDef,
  ProductDef,
  QueueState,
  Order
} from '../domain/types';

// ---- snapshot schema
export type SnapshotV1 = {
  version: 1;
  savedAt: number;
  biz: {
    settings: BusinessSettings;
    materials: MaterialDef[];
    products: ProductDef[];
  };
  sim: {
    simTimeMs: number;
    queues: Record<string, QueueState>;
    orders: Record<string, Order>;
    activeCreating: string[];
    delivering: string[];
  };
};

type AnySnapshot = SnapshotV1;

const KEY = 'business-sim:snapshot';
const VERSION = 1;

// Map -> plain object
function mapToObj<V>(m: Map<string, V>): Record<string, V> {
  const o: Record<string, V> = {};
  for (const [k, v] of m.entries()) o[k] = v;
  return o;
}

// plain object -> Map
function objToMap<V>(o: Record<string, V> | undefined | null): Map<string, V> {
  const m = new Map<string, V>();
  if (!o) return m;
  // Object.entries gives us [key, value] so we don't risk undefined
  for (const [k, v] of Object.entries(o) as [string, V][]) {
    m.set(k, v);
  }
  return m;
}

export function buildSnapshot(args: {
  biz: { settings: BusinessSettings; materials: MaterialDef[]; products: ProductDef[] };
  sim: {
    simTimeMs: number;
    queues: Map<string, QueueState>;
    orders: Map<string, Order>;
    activeCreating: Set<string>;
    delivering: Set<string>;
  };
}): SnapshotV1 {
  return {
    version: 1,
    savedAt: Date.now(),
    biz: {
      settings: args.biz.settings,
      materials: args.biz.materials,
      products: args.biz.products,
    },
    sim: {
      simTimeMs: args.sim.simTimeMs,
      queues: mapToObj(args.sim.queues),
      orders: mapToObj(args.sim.orders),
      activeCreating: Array.from(args.sim.activeCreating),
      delivering: Array.from(args.sim.delivering),
    },
  };
}

export function saveSnapshot(snap: AnySnapshot) {
  try {
    localStorage.setItem(KEY, JSON.stringify(snap));
  } catch (e) {
    console.warn('[persistence] save failed', e);
  }
}

export function loadSnapshot(): AnySnapshot | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as AnySnapshot;
    if (snap.version !== VERSION) return null;
    return snap;
  } catch (e) {
    console.warn('[persistence] load failed', e);
    return null;
  }
}

export function clearSnapshot() {
  try { localStorage.removeItem(KEY); } catch {}
}

// Restore the sim’s runtime data from a snapshot
export function hydrateSimFromSnapshot(sim: any, snap: SnapshotV1['sim']) {
  sim.simTimeMs = snap.simTimeMs || 0;
  sim.queues = objToMap<QueueState>(snap.queues);
  sim.orders = objToMap<Order>(snap.orders);
  sim.activeCreating = new Set<string>(snap.activeCreating || []);
  sim.delivering = new Set<string>(snap.delivering || []);
}
