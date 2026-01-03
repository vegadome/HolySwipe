// App.tsx ou app/_layout.tsx (selon ta structure Expo Router)

import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const done = await SecureStore.getItemAsync('onboarding_complete');
        setIsOnboarded(done === 'true');
      } catch (error) {
        console.warn('Failed to read onboarding status from SecureStore', error);
        setIsOnboarded(false); // fallback : traiter comme non onboardé
      }
    };

    checkOnboarding();
  }, []);

  // Affiche un écran de chargement ou rien pendant la vérification
  if (isOnboarded === null) {
    return null; // ou <LoadingScreen /> si tu en as un
  }

  return <Slot />;
}