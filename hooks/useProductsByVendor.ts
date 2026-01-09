// src/hooks/useProductsByVendor.ts
import { Product } from "@/types";
import { useEffect, useState } from "react";

export const useProductsByVendor = (vendor: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!vendor) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

        if (!SUPABASE_URL) {
          throw new Error("EXPO_PUBLIC_SUPABASE_URL non défini dans .env");
        }

        // ✅ PARAM = vendor (slug Saleor)
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/get-vendor-products?vendor=${encodeURIComponent(vendor)}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data: Product[] = await response.json();
        console.log("✅ Produits reçus:", data);

        setProducts(data);
        setError(null);
      } catch (err: any) {
        console.error("❌ Erreur chargement produits vendeur:", err);
        setError(err.message || "Impossible de charger les produits");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [vendor]);

  return { products, loading, error };
};
