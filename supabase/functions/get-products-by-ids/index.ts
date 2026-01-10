// supabase/functions/get-products-by-ids/index.ts
/**
 * npx supabase functions deploy get-products-by-ids
*/
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

// ⚙️ Configuration
const SALEOR_API_URL = Deno.env.get('SALEOR_API_URL')!;
const CHANNEL = 'holy-swipe';

// 📦 Types
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

// 📡 Requête GraphQL (par IDs)
const GET_PRODUCTS_BY_IDS = `
  query GetProductsByIds($channel: String!, $ids: [ID!]!) {
    products(first: 50, channel: $channel, filter: { ids: $ids }) {
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
            attribute {
              slug
            }
            values {
              name
              slug
            }
          }
        }
      }
    }
  }
`;

serve(async (req: { method: string; json: () => any; url: string | URL; }) => {
  // 🔍 Récupérer les IDs depuis le body (POST) ou query params (GET)
  let productIds: string[] = [];
  
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      productIds = Array.isArray(body.ids) ? body.ids : [];
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } else {
    // Support GET avec ?ids=id1,id2,id3
    const url = new URL(req.url);
    const idsParam = url.searchParams.get('ids');
    if (idsParam) {
      productIds = idsParam.split(',').map(id => id.trim());
    }
  }

  if (productIds.length === 0) {
    return new Response(JSON.stringify({ error: 'Paramètre "ids" requis (tableau non vide)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // ⚠️ Limite de sécurité
  if (productIds.length > 50) {
    return new Response(JSON.stringify({ error: 'Maximum 50 IDs par requête' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 📤 Appel à Saleor
    const saleorResponse = await fetch(SALEOR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_PRODUCTS_BY_IDS,
        variables: { channel: CHANNEL, ids: productIds }
      }),
    });

    const { data, errors } = await saleorResponse.json();

    if (errors) {
      console.error('Erreur Saleor:', errors);
      return new Response(JSON.stringify({ error: 'Erreur Saleor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🔄 Mapper les données
    // 🔄 Mapper les données
    const products: Product[] = data.products.edges.map((edge: any) => {
      const node = edge.node;
      let brand = 'Marque';
      let ecoFriendly = false;
      let vendorId = '';

      node.attributes.forEach((attr: any) => {
        if (attr.attribute.slug === 'brand-name' && attr.values[0]) {
          brand = attr.values[0].name; // ✅ Textbox → .name
        }
        if (attr.attribute.slug === 'eco-friendly' && attr.values[0]) {
          ecoFriendly = attr.values[0].slug === 'yes'; // ✅ Dropdown → .slug OK
        }
        if (attr.attribute.slug === 'vendor-id' && attr.values[0]) {
          vendorId = attr.values[0].name; // ✅ Textbox → .name (CORRIGÉ)
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
        vendorId,
        size: ['S', 'M', 'L'],
      };
    });

    return new Response(JSON.stringify(products), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erreur Edge Function:', error);
    return new Response(JSON.stringify({ error: 'Erreur interne' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});