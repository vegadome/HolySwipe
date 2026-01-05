// app/_layout.tsx

import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 🔁 Handler de deep linking pour les emails Supabase
const handleDeepLink = async (url: string) => {
  // A CHANGER EN PROD
  if (!url.startsWith('exp://')) return;

  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    const type = urlObj.searchParams.get('type');

    if (token && type) {
      // ✅ Supabase gère la session automatiquement, mais on peut log pour debug
      console.log(`Deep link reçu: type=${type}, token=${token.substring(0, 10)}...`);

      if (type === 'recovery') {
        // 🔑 Redirige directement vers reset-password
        // (la session est déjà active grâce à Supabase)
        const rootNav = require('expo-router').useRootNavigation();
        rootNav?.navigate('/auth/reset-password');
      } else if (type === 'email') {
        // ✅ Vérification d'email → onboarding
        const rootNav = require('expo-router').useRootNavigation();
        rootNav?.navigate('/onboarding');
      }
    }
  } catch (error) {
    console.error('Erreur lors du parsing du deep link:', error);
  }
};

// 🧹 Reset SecureStore (DEV uniquement)
const resetSecureStore = async () => {
  const keys = ['onboarding_complete', 'token', 'user_id', 'user_preferences', 'liked_ids'];
  for (const key of keys) {
    await SecureStore.deleteItemAsync(key).catch(() => {});
  }
  console.log('✅ SecureStore réinitialisé (DEV)');
};

export default function RootLayout() {
  useEffect(() => {
    // 🧪 Reset en dev
    if (__DEV__) {
      resetSecureStore();
    }

    // 🔗 Écoute les deep links (clics sur liens d'email)
    const linkingListener = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // 🔗 Vérifie aussi l'URL initiale (si l'app est lancée via un lien)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => {
      linkingListener.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/index" />
          <Stack.Screen name="auth/sign-in" />
          <Stack.Screen name="auth/sign-up" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="auth/reset-password" />
          <Stack.Screen name="auth/expired-link" />
          <Stack.Screen name="auth/check-email" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="/home/index" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="sale/[id]" />
          <Stack.Screen name="product/[id]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}