// app/index.tsx

import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const done = await SecureStore.getItemAsync('onboarding_complete');
      setIsOnboarded(done === 'true');
    };
    check();
  }, []);

  if (isOnboarded === null) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>;
  }

  return <Redirect href={isOnboarded ? '/home' : '/onboarding'} />;
}