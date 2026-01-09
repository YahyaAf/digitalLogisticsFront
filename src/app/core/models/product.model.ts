export interface ProductRequest {
  sku: string;
  name: string;
  category: string;
  active: boolean;
  originalPrice: number;
  profite: number;
  image?: string;
}

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  category: string;
  active: boolean;
  originalPrice: number;
  profite: number;
  sellingPrice: number;
  imageUrl?: string;
  imageS3Url?: string;
}
