graph LR
  A[Ton app Expo] -->|GET /sale/zara| B(Supabase: private_sales)
  B -->|vendor_id = 'zara'| A
  A -->|Appelle Edge Function| C[get-vendor-products?vendor_id=zara]
  C -->|Requête GraphQL| D[Saleor: produits avec vendor-id='zara']
  D -->|Retourne produits| C --> A


      ✅ Le Vendor Portal n’est PAS nécessaire pour tester.
    Tu peux créer des produits manuellement dans Saleor Dashboard.