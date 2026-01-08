// supabase/functions/get-vendor-products/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SALEOR_API_URL = Deno.env.get('SALEOR_API_URL');
const CHANNEL = 'holy-swipe';

// 🛑 Vérification critique
if (!SALEOR_API_URL) {
  throw new Error('SALEOR_API_URL non défini dans les secrets');
}

const GET_PRODUCTS_BY_VENDOR = `
  query GetProductsByVendor($channel: String!, $vendorSlug: String!) {
    products(
      first: 50,
      channel: $channel,
      filter: { attributes: [{ slug: "vendor-id", values: [$vendorSlug]}] }
    ) {
      edges {
        node {
          id
          name
          description
          thumbnail(size: 400) {
            url
          }
          pricing {
            priceRange {
              start {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          attributes {
            attribute { slug }
            values { name slug }
          }
        }
      }
    }
  }
`;

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  brand: string;
  ecoFriendly: boolean;
  vendorId: string;
  size: string[];
}

serve(async (req: { url: string | URL; }) => {
  try {
    // 🔑 Récupérer vendor_id depuis les query params (méthode Supabase)
    const { vendor_id } = Object.fromEntries(new URL(req.url, 'https://dummy').searchParams);
    
    if (!vendor_id) {
      return new Response(
        JSON.stringify({ error: 'Paramètre "vendor_id" requis' }),
        { status: 400 }
      );
    }

    // 📤 Appel à Saleor
    const saleorResponse = await fetch(SALEOR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_PRODUCTS_BY_VENDOR,
        variables: { channel: CHANNEL, vendorSlug: vendor_id }
      }),
    });

    const { data, errors } = await saleorResponse.json();

    if (errors) {
      console.error('Erreur Saleor:', errors);
      return new Response(
        JSON.stringify({ error: 'Erreur produits' }),
        { status: 500 }
      );
    }

    // 🔄 Mapper les données
    const products: Product[] = data.products.edges.map((edge: any) => {
      const node = edge.node;
      let brand = vendor_id;
      let ecoFriendly = false;

      node.attributes.forEach((attr: any) => {
        if (attr.attribute.slug === 'brand-name' && attr.values[0]) {
          brand = attr.values[0].name;
        }
        if (attr.attribute.slug === 'eco-friendly' && attr.values[0]) {
          ecoFriendly = attr.values[0].slug === 'yes';
        }
      });

      return {
        id: node.id,
        name: node.name,
        image: node.thumbnail?.url || '',
        price: node.pricing?.priceRange?.start?.gross?.amount || 0,
        currency: node.pricing?.priceRange?.start?.gross?.currency || 'EUR',
        brand,
        ecoFriendly,
        vendorId: vendor_id,
        size: ['S', 'M', 'L'],
      };
    });

    return new Response(JSON.stringify(products), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur Edge Function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500 }
    );
  }
});