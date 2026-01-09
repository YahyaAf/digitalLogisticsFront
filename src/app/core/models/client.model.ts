import { Role } from './user.model';

export interface ClientRequest {
  name: string;
  email: string;
  password: string;
  active: boolean;
  phoneNumber: string;
  address: string;
}

export interface ClientResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  phoneNumber: string;
  address: string;
}
