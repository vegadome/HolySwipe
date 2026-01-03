// app/_layout.tsx

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
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