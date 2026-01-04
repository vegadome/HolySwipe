// app/_layout.tsx

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// resetSecureStore : A SUPPRIMER UNIQUEMENT EN -----> DEV
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
const resetSecureStore = async () => {
  const keys = ['onboarding_complete', 'token', 'user_id'];
  for (const key of keys) {
    await SecureStore.deleteItemAsync(key).catch(() => {});
  }
  console.log('SecureStore partiellement réinitialisé');
};

export default function RootLayout() {
  useEffect(() => {
    if (__DEV__) {
      resetSecureStore();
    }
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="home" />
          <Stack.Screen name="sale/[id]" />
          <Stack.Screen name="product/[id]" />
          {/* Pas de (tabs) */}
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}