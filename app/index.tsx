// app/index.tsx

/*import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const done = await SecureStore.getItemAsync('onboarding_complete');
      setIsOnboarded(done === 'true');
      setIsLoading(false);
    };
    checkOnboarding();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  // 🔁 Redirection ici, PAS dans le layout
  return <Redirect href={isOnboarded ? '/home' : '/onboarding'} />;
}*/
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/auth" />; // ✅ Toujours vers auth
}
