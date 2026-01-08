// src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($channel: String!, $first: Int!) {
    products(first: $first, channel: $channel) {
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
          category {
            name
          }
        }
      }
    }
  }
`;