export interface InventoryMovementResponse {
  id: number;
  inventoryId: number;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  productId: number;
  productSku: string;
  productName: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  quantity: number;
  occurredAt: string;
  referenceDocument?: string;
  description?: string;
}
