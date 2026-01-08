// src/services/saleorClient.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const SALEOR_API_URL = process.env.SALEOR_API_URL; // 👈 À REMPLACER

const saleorClient = new ApolloClient({
  link: new HttpLink({
    uri: SALEOR_API_URL,
    // Pas besoin de token ici → les produits sont publics
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['channel', 'filter'],
            merge(existing = { edges: [] }, incoming) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            },
          },
        },
      },
    },
  }),
});

export default saleorClient;