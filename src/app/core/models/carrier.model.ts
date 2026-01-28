export enum CarrierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface CarrierRequest {
  code: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  baseShippingRate: number;
  maxDailyCapacity: number;
  cutOffTime?: string;
}

export interface CarrierResponse {
  id: number;
  code: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  baseShippingRate: number;
  maxDailyCapacity: number;
  currentDailyShipments: number;
  cutOffTime: string | null;
  status: CarrierStatus;
  availableCapacity: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
