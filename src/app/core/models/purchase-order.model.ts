export enum PurchaseOrderStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  RECEIVED = 'RECEIVED',
  CANCELED = 'CANCELED'
}

export interface PurchaseOrderLine {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderLineResponse {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrderRequest {
  supplierId: number;
  expectedDelivery?: string;
  orderLines: PurchaseOrderLine[];
}

export interface PurchaseOrderResponse {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierContactInfo?: string;
  supplierMarticule?: string;
  status: PurchaseOrderStatus;
  createdAt: string;
  expectedDelivery?: string;
  approvedAt?: string;
  receivedAt?: string;
  canceledAt?: string;
  orderLines: PurchaseOrderLineResponse[];
  totalAmount: number;
  totalItems: number;
}
