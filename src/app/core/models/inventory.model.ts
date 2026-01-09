export interface InventoryRequest {
  warehouseId: number;
  productId: number;
  qtyOnHand: number;
  qtyReserved: number;
}

export interface InventoryResponse {
  id: number;
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  productId: number;
  productSku: string;
  productName: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
}

export interface InventorySummary {
  productId: number;
  productSku: string;
  productName: string;
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  warehouseCount: number;
}
