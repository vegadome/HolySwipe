import { createClient } from '@supabase/supabase-js';

// Récupère les variables d'environnement
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// Vérifie que les variables sont bien définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes dans .env');
}

// Crée le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


/*
Pour les builds production (EAS Build)
Si tu fais des builds avec eas build, les variables locales du .env ne sont pas automatiquement incluses.
Tu dois :

Créer les mêmes variables comme secrets sur expo.dev (dans ton projet → Secrets).
Ou pousser ton .env avec : eas secret:push --scope project --env-file .env
*/