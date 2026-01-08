// src/hooks/useSaleorProduct.ts
import { gql, useQuery } from '@apollo/client';

const GET_PRODUCT = gql`
  query GetProduct($id: ID!, $channel: String!) {
    product(id: $id, channel: $channel) {
      id
      name
      description
      thumbnail(size: 800) {
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
`;

const CHANNEL = 'holy-swipe';

export const useSaleorProduct = (id: string) => {
  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id, channel: CHANNEL },
    skip: !id,
  });

  if (!data?.product) {
    return { loading, error, product: null };
  }

  const node = data.product;

  // Extraire attributs
  const attributes: Record<string, any> = {};
  node.attributes.forEach((attr: any) => {
    const slug = attr.attribute.slug;
    const value = attr.values[0]?.slug || attr.values[0]?.name || '';
    if (slug === 'eco-friendly') attributes.ecoFriendly = value === 'yes';
    if (slug === 'brand-name') attributes.brand = value;
    if (slug === 'commission-rate') attributes.commissionRate = parseFloat(value);
    if (slug === 'vendor-id') attributes.vendorId = value;
  });

  const product = {
    id: node.id,
    name: node.name,
    description: node.description,
    image: node.thumbnail?.url || '',
    price: node.pricing?.priceRange?.start?.gross?.amount || 0,
    currency: node.pricing?.priceRange?.start?.gross?.currency || 'EUR',
    size: ['S', 'M', 'L'], // à remplacer plus tard par des variantes
    ...attributes,
  };

  return { loading, error, product };
};