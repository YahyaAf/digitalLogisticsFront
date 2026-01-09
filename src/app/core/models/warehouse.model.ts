export interface WarehouseRequest {
  name: string;
  code: string;
  capacity: number;
  active: boolean;
  managerId: number;
}

export interface WarehouseResponse {
  id: number;
  name: string;
  code: string;
  capacity: number;
  active: boolean;
  managerId: number;
  managerName: string;
  managerEmail: string;
}
