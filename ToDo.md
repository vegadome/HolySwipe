- splash screen animé 
- animations de transition quand l'utilisateur clique sur une de ces cartes "Live" 





# LE SYSTEME DE LIKES

 Excellente question ! Dans ton projet **« The Yes »-style** (swipe pour découvrir des vêtements), les **likes** ne sont pas juste un bouton cœur — ils sont le **cœur même de ton moteur de personnalisation**.

Voici **5 rôles stratégiques** des likes dans ton application :

---

## 🎯 1. **Améliorer la personnalisation en temps réel**  
> **Le but principal** : Affiner les suggestions à chaque swipe.

- 🔍 **Comment ?**  
  Quand un utilisateur like un produit en **coton bio, vert, style boho**, ton système :
  - Retient ces **tags** (`style: "boho"`, `color: "green"`, `ecoFriendly: true`)
  - Booste les produits futurs avec ces mêmes attributs
  - Diminue les produits non alignés (ex: cuir, noir, streetwear)

- 💡 **Avantage** :  
  L’expérience devient **de plus en plus pertinente** au fil des swipes → **meilleure rétention**.

---

## 📊 2. **Créer un historique de préférences durables**  
> **Même après fermeture de l’app**, l’utilisateur retrouve une feed personnalisée.

- 🔒 **Stocké en base** :  
  `likes` = preuve durable des goûts de l’utilisateur  
  (meilleur qu’un `AsyncStorage` local qui disparaît)

- 🔄 **Utilisation** :  
  Au prochain lancement, tu charges les likes → rebuild la feed personnalisée **instantanément**.

---

## ❤️ 3. **Offrir un "favoris" / "wishlist" visible**  
> **UX attendue** : Les utilisateurs veulent revoir ce qu’ils ont aimé.

- 📱 **Écran "Liked"** :  
  Tu as déjà cet écran → il devient **ta wishlist**  
  → Permet de **revoir, partager, ou acheter plus tard**

- 🛒 **Conversion** :  
  Les produits likés ont **+35% de chances d’être achetés** (source: études e-com)

---

## 🤖 4. **Alimenter ton "AI" (même simple)**  
> Les likes sont la **data de training** de ton système.

- 📈 **Statistiques utiles** :
  - Quels styles/colors sont les plus likés ?
  - Quels produits ont un **taux de like élevé** ? → À promouvoir
  - Quels utilisateurs likent quoi ? → Pour du **collaborative filtering** plus tard

- 🧠 **Évolution future** :  
  Tu pourras passer de **règles basiques** (`>=2 tags communs`) à un **modèle ML** alimenté par ces likes.

---

## 🔒 5. **Sécurité et conformité**  
> En stockant les likes liés à `user_id`, tu respectes la vie privée.

- 🛡️ **RLS (Row Level Security)** :  
  L’utilisateur **ne voit que ses propres likes** → conforme RGPD
- 🧹 **Nettoyage** :  
  Si l’utilisateur supprime son compte → ses likes sont supprimés automatiquement (`ON DELETE CASCADE`)

---

## ❌ Et si tu supprimes les likes ?

Tu perds :
- La personnalisation au-delà de la session courante
- La wishlist (feature clé e-com)
- Toute possibilité d’analyse comportementale
- La capacité à mesurer la performance des produits

---

## ✅ Conclusion : **Garde les likes — et exploite-les !**

Ils sont **légers à stocker**, **essentiels pour l’UX**, et **critiques pour la scalabilité** de ton algo de recommandation.

> 💡 **Pro tip** : Ajoute un champ `liked_at` dans ta table `likes` → tu pourras pondérer les likes récents **plus lourdement** dans ta logique de recommandation.

Tu veux que je t’aide à :
- Mettre à jour ton `getPersonalizedFeed` pour utiliser **Supabase** ?
- Ajouter un **taux de conversion** (like → achat) dans ton dashboard ?
- Implémenter un **"undo like"** ?



# SYSTEME D'AUTHENTIFICATION

- Désactiver la vérification email pour le dev ?
- Ajouter Google Sign-In ?
- Stocker les likes en temps réel ?
- Ajouter la gestion des erreurs réseau
- Intégrer Apple Sign-In et Google Sign-In
- Créer le dashboard admin



# SYSTEME SWIPE

- Ajoute la suppression des likes (swipe gauche → déclenche DELETE dans Supabase)
- Synchronise les likes anonymes vers le compte quand l’utilisateur s’inscrit
- Crée le dashboard admin pour gérer les produits

# SYSTEME DE PROFILE 

-  L’édition du profil (changer l’avatar, les préférences) ?
- Un mode sombre / clair toggle ?
- Des badges utilisateur (ex: "VIP", "Eco-Friendly") ?



# PRODUCTION 

- configurer smtp email dans supabase
- URL confiiguraiton dans supabase

En production (après build standalone avec EAS) :

Configurez un scheme personnalisé dans app.json (ex. "scheme": "monapp").
Mettez à jour le Site URL vers monapp:// et ajoutez monapp://** dans les Redirect URLs.
Utilisez emailRedirectTo dans vos appels Supabase pour spécifier dynamiquement l'URL de redirection.

Si vous n'utilisez que l'authentification par mot de passe (sans magic link ni OAuth), ce champ a moins d'impact, mais il est bon de le configurer correctement dès le début.
Sauvegardez les modifications avec Save changes. Testez ensuite un signup avec confirmation e-mail pour vérifier que le lien ouvre bien votre app Expo.

--> 🚀 Étape 1 : Configurer SMTP dans Supabase

Va dans ton projet Supabase → Authentication → Settings → SMTP
⚙️ Remplis ces champs :
Champ
	
Valeur
Sender email address
	
hello@holywipe.com (ou test@holywipe.com) — doit être valide
Sender name
	
HolySwipe
Host
	
app.debugmail.io
Port number
	
9025 (DebugMail utilise 9025, pas 25)
Username
	
da8d21ae-a7d6-44f4-9945-4a1ce5a85d21 (ton UUID DebugMail)
Password
	
6582dba3-1dd2-485d-8814-1f449cb2cfc6 (ton mot de passe DebugMail)

    ✅ Active "Enable custom SMTP"
    ✅ Laisse "Minimum interval per user" à 60s (pas de spam)


---> 🚀 Étape 2 : Configurer les Redirect URLs

Va dans Authentication → URL Configuration
🔧 Site URL

1

    ✅ C’est l’URL par défaut d’Expo Go sur Android/iOS. Tu peux aussi mettre :

        exp://192.168.x.x:8081 (si tu testes en local)
        https://your-project.supabase.co (pour prod)

🔧 Redirect URLs

Ajoute cette ligne :

exp://localhost:8081/auth/callback

✅ Supabase redirigera vers cette URL après la vérification d’email ou la réinitialisation du mot de passe.



--> reconfigurer pour prod app.json : 
{
  "expo": {
    "scheme": "holy",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": {
            "scheme": "https",
            "host": "holySwipe.supabase.co"
          }
        },
        {
          "action": "VIEW",
          "data": {
            "scheme": "holy"
          }
        }
      ]
    },
    "ios": {
      "associatedDomains": ["applinks:holySwipe.supabase.co"]
    }
  }
}

---> changer en prod : 

const handleDeepLink = async (url: string) => {
  // A CHANGER EN PROD
  if (!url.startsWith('exp://')) return;
