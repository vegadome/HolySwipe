import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const SALEOR_API_URL = 'https://holyswipe.eu.saleor.cloud/graphql/';
const CHANNEL = 'holy-swipe';

serve(async (req: { url: string | URL }) => {
  const url = new URL(req.url);
  const vendorSlug = url.searchParams.get('vendor'); // ex: holystyle

  if (!vendorSlug) {
    return new Response(
      JSON.stringify({ error: 'vendor requis' }),
      { status: 400 }
    );
  }

  try {
    const query = `
      query GetProductsByVendor($channel: String!, $vendor: [String!]) {
        products(
          first: 50
          channel: $channel
          filter: {
            attributes: [
              { slug: "vendor", values: $vendor }
            ]
          }
        ) {
          edges {
            node {
              id
              name
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

    const response = await fetch(SALEOR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          channel: CHANNEL,
          vendor: [vendorSlug],
        },
      }),
    });

    const result = await response.json();
    console.log('📥 Réponse Saleor brute:', JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('❌ Erreurs Saleor:', result.errors);
      return new Response(
        JSON.stringify({ error: 'Erreur Saleor' }),
        { status: 500 }
      );
    }

    const edges = result.data?.products?.edges ?? [];

    const products = edges.map((edge: any) => {
      const node = edge.node;

      let brand = '';
      let ecoFriendly = false;
      let vendorName = '';

      node.attributes?.forEach((attr: any) => {
        if (attr.attribute.slug === 'brand-name') {
          brand = attr.values?.[0]?.name ?? '';
        }
        if (attr.attribute.slug === 'eco-friendly') {
          ecoFriendly = attr.values?.[0]?.slug === 'yes';
        }
        if (attr.attribute.slug === 'vendor') {
          vendorName = attr.values?.[0]?.name ?? '';
        }
      });

      return {
        id: node.id,
        name: node.name,
        image: node.thumbnail?.url ?? '',
        price: node.pricing?.priceRange?.start?.gross?.amount ?? 0,
        currency: node.pricing?.priceRange?.start?.gross?.currency ?? 'EUR',
        brand,
        ecoFriendly,
        vendor: {
          slug: vendorSlug,
          name: vendorName,
        },
      };
    });

    console.log('📤 Produits envoyés:', products);

    return new Response(JSON.stringify(products), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('💥 Erreur Edge Function:', err);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500 }
    );
  }
});
