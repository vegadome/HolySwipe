// types.ts
export interface Product {
  id: string; // Saleor ID (ex: "UHJvZHVjdDoxMjM=")
  name: string;
  brand?: string; // vient de l'attribut "brand-name"
  price: number;
  currency: string;
  image: string;
  ecoFriendly?: boolean; // vient de l'attribut "eco-friendly"
  vendorId?: string; // technique (pas utilisé en UI)
  commissionRate?: number; // technique
  description?: string; // optionnel
  size?: string[]; // si tu veux gérer les tailles plus tard (pour l’instant on hardcode)
}