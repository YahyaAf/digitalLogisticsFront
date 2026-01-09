export enum Role {
  ADMIN = 'ADMIN',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  CLIENT = 'CLIENT'
}

export interface UserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}
