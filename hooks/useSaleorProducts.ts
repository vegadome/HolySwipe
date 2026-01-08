// src/hooks/useSaleorProducts.ts
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../graphql/queries';

const CHANNEL = 'holy-swipe'; // 👈 ton slug de channel

export const useSaleorProducts = (limit: number = 20) => {
  const { loading, error, data, fetchMore } = useQuery(GET_PRODUCTS, {
    variables: { channel: CHANNEL, first: limit },
  });

  const products = data?.products?.edges.map((edge: any) => {
    const node = edge.node;

    // Extraire les attributs personnalisés
    const attributes: Record<string, string | boolean> = {};
    node.attributes.forEach((attr: any) => {
      const slug = attr.attribute.slug;
      const value = attr.values[0]?.slug || attr.values[0]?.name || '';
      
      // Cas spécial : eco-friendly
      if (slug === 'eco-friendly') {
        attributes.isEcoFriendly = value === 'yes';
      } else if (slug === 'brand-name') {
        attributes.brandName = value;
      } else if (slug === 'commission-rate') {
        attributes.commissionRate = parseFloat(value) || 0;
      } else if (slug === 'vendor-id') {
        attributes.vendorId = value;
      }
    });

    return {
      id: node.id,
      name: node.name,
      description: node.description,
      price: node.pricing?.priceRange?.start?.gross?.amount || 0,
      currency: node.pricing?.priceRange?.start?.gross?.currency || 'EUR',
      imageUrl: node.thumbnail?.url || '',
      ...attributes,
    };
  });

  return { loading, error, products, fetchMore };
};