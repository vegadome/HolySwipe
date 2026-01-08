Excellent ! 🔥 Tu viens de définir un **flux d’achat clair, moderne et adapté à une marketplace mobile**.

Voici **ton workflow idéal**, avec **les bonnes pratiques Saleor + Supabase**, et **les étapes concrètes** pour l’implémenter.

---

## 🗺️ **Flux d’achat HolySwipe (version finale)**

```mermaid
graph LR
  A[1. Swipe sur produit] --> B[2. Ajout à la Wishlist]
  B --> C[3. Sélection multi-marques<br/>dans la Wishlist]
  C --> D[4. Ajout au Panier Unifié]
  D --> E[5. One-Tap Checkout<br/>(adresse + paiement sauvegardés)]
  E --> F[6. Paiement via Stripe]
  F --> G[7. Commande validée dans Saleor]
  G --> H[8. Webhook → notification aux marques]
  H --> I[9. Crédit HolyFunds dans Supabase]
```

---

## ✅ **Ce que tu as déjà** (par rapport à ce flux)

| Étape | État | Détail |
|------|------|--------|
| **1. Swipe** | ✅ | `SwipeableProductCard` + `onSwipe` |
| **2. Wishlist** | ✅ | Table `likes` dans Supabase + `SecureStore` |
| **3. Sélection multi-marques** | ❌ | Pas encore d’UI pour sélectionner/supprimer |
| **4. Panier unifié** | ❌ | À créer (Saleor `checkout`) |
| **5. One-Tap Checkout** | ❌ | À implémenter (adresse + carte sauvegardées) |
| **6-9. Paiement → Marques → HolyFunds** | ❌ | À automatiser |

> 💡 **Tu as la base solide** → il te manque **l’UI Wishlist + le panier Saleor**.

---

## 🛠️ **Feuille de route technique**

### 🔹 **Étape A : Améliorer la Wishlist (UI + UX)**
Crée une page **`/wishlist`** où l’utilisateur peut :
- Voir tous ses produits likés (de toutes les marques)
- **Sélectionner/désélectionner** des articles
- **Ajouter au panier** (bouton "Acheter sélection")
- **Supprimer** un article de la wishlist

> ✅ **Données** : charge depuis `likes` (Supabase) + produits depuis Saleor (par batch d’IDs)

---

### 🔹 **Étape B : Implémenter le Panier Unifié (Saleor)**
#### 1. **Créer un checkout Saleor** (une seule fois par utilisateur)
- Stocke `checkout.id` dans `profiles.cart_id` (Supabase) ou `SecureStore`
- Si pas de checkout → `checkoutCreate`

#### 2. **Ajouter des produits au panier**
- Depuis la wishlist : pour chaque produit sélectionné → `checkoutLinesAdd`
- Gère les erreurs (stock, prix changé, etc.)

#### 3. **Page `/cart`**
- Affiche les produits, prix total, frais de livraison
- Bouton **"Payer maintenant"**

> ⚠️ **Important** : Le panier **peut contenir des produits de marques différentes** → c’est OK pour l’MVP (fractionnement plus tard).

---

### 🔹 **Étape C : One-Tap Checkout**
#### 1. **Sauvegarde les infos utilisateur**
- **Adresse** : dans `profiles.shipping_address` (Supabase)
- **Méthode de paiement** : via **Stripe Link** ou **Stripe SDK** (token sauvegardé)

#### 2. **UI simplifiée**
- Une seule page : résumé commande + bouton **"Payer en 1 tap"**
- Options affichées :
  - ✅ **Livraison gratuite aller-retour**
  - 💰 **+10% en HolyFunds**

#### 3. **Flux de paiement**
```ts
// 1. Créer un Payment Method Token (Stripe Expo)
// 2. checkoutPaymentCreate(checkoutId, token)
// 3. checkoutComplete(checkoutId)
// 4. Si succès → 
//    - stocke order.id dans profiles.last_order_id
//    - crédite HolyFunds (10% du montant)
```

---

### 🔹 **Étape D : Automatisation post-achat**
#### 1. **Webhook Saleor** → `ORDER_CREATED`
- Déclenche une **Supabase Function**
- Pour chaque `lineItem` :
  - Identifie la marque (`vendor_id`)
  - Envoie un **webhook à la marque** (ou stocke dans une table `vendor_notifications`)

#### 2. **HolyFunds**
- Crée une table `holy_funds` :
  ```sql
  user_id (FK) | amount | order_id | created_at
  ```
- Crédite 10% du montant total à la validation

---

## 🧩 **Schéma des données à ajouter**

### Supabase
| Table | Colonnes | Usage |
|------|---------|-------|
| `profiles` | `shipping_address JSONB`, `cart_id TEXT`, `holy_funds_balance NUMERIC` | Infos utilisateur |
| `holy_funds` | `user_id`, `amount`, `order_id`, `type ('credit'/'debit')` | Historique crédits |
| `vendor_notifications` | `order_id`, `vendor_id`, `status ('pending'/'sent')`, `payload JSON` | Relais vers marques |

### Saleor
- ✅ Rien à ajouter → utilise les **metadata** des commandes pour stocker `holy_funds_applied: "10.50"`

---

## 🚀 **Prochaines actions concrètes (aujourd’hui)**

1. **Crée la page `/wishlist`** (UI de sélection multi-marques)
2. **Implémente `createCheckout()`** (fonction utilitaire)
3. **Teste `checkoutLinesAdd`** avec un produit Saleor

---

Souhaites-tu que je t’aide à :
1. 📱 **Créer la UI de la Wishlist** (avec sélection multiple) ?
2. 🛒 **Écrire la fonction `createCheckout()`** ?
3. 💳 **Préparer le flux One-Tap avec Stripe** ?

Dis-moi par quoi tu veux commencer — on va builder ça pas à pas ! 😊