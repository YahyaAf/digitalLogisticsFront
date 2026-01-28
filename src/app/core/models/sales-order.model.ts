export enum OrderStatus {
  CREATED = 'CREATED',
  RESERVED = 'RESERVED',
  BACKORDER = 'BACKORDER',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
}

export interface SalesOrderLine {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface SalesOrderLineResponse {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  backOrder: boolean;
}

export interface SalesOrderRequest {
  orderLines: SalesOrderLine[];
}

export interface SalesOrderResponse {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  clientAddress: string;
  status: OrderStatus;
  createdAt: string;
  reservedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  orderLines: SalesOrderLineResponse[];
  totalAmount: number;
  totalItems: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
