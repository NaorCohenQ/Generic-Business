export type ID = string;
export type BusinessType = 'food' | 'supermarket' | 'carpentry' | 'factory';

export interface BusinessSettings {
  id: ID;
  name: string;
  type: BusinessType;
  deliverySeconds: number;
  productionSlots: number;
  queues: QueueConfig[];
  clockTickMs: number;
}
export interface QueueConfig { id: ID; name: string; }

export interface MaterialDef {
  id: ID;
  name: string;
  icon?: string;
  buildSeconds: number;
}
export interface ProductDef {
  id: ID;
  name: string;
  materialIds: ID[];
}

export interface Customer {
  id: ID;
  name?: string;
  orderTimeSeconds: number;
  intention: 'order' | 'cancel' | 'reorder';
  requestedProductId?: ID;
}

export type OrderStatus =
  | 'Queued' | 'Ordering' | 'Failed' | 'Accepted'
  | 'Creating' | 'Created' | 'Delivering' | 'Delivered' | 'Canceled';

export interface Order {
  id: ID;
  customerId: ID;
  queueId: ID;
  productId: ID;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  orderingSecondsLeft: number;
  currentMaterialIndex: number;
  currentMaterialSecondsLeft: number;
  deliverySecondsLeft: number;
  failureReason?: string;
}

export interface QueueState { id: ID; customerIds: ID[]; }
