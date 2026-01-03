// types.ts
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  style: string;
  color: string;
  size: string[];
  ecoFriendly: boolean;
}