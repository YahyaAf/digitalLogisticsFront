export enum ShipmentStatus {
  PLANNED = 'PLANNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED'
}

export interface ShipmentRequest {
  salesOrderId: number;
  trackingNumber?: string;
  plannedDate?: string;
}

export interface ShipmentResponse {
  id: number;
  salesOrderId: number;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  clientAddress: string;
  carrierId: number | null;
  carrierCode: string | null;
  carrierName: string | null;
  trackingNumber: string;
  status: ShipmentStatus;
  plannedDate: string | null;
  shippedDate: string | null;
  deliveredDate: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
