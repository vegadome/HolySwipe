// app/onboarding/index.tsx

import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

// 🔹 Définir le type des préférences utilisateur
interface UserPreferences {
  styles: string[];
  colors: string[];
  brands: string[];
  size: string;
}

// 🔹 Définir la structure d'une question
interface Question {
  key: keyof UserPreferences; // ✅ Garantit que 'key' est une propriété valide de UserPreferences
  title: string;
  options: string[];
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  option: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 4,
  },
  selected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#4a90e2',
  },
});

const OnboardingScreen = () => {
  const [step, setStep] = useState<number>(0);

  const [prefs, setPrefs] = useState<UserPreferences>({
    styles: [],
    colors: [],
    brands: [],
    size: '',
  });

  const router = useRouter();

  const questions: Question[] = [
    {
      key: 'styles',
      title: 'Which styles do you like?',
      options: ['casual', 'formal', 'boho', 'minimal', 'streetwear'],
    },
    {
      key: 'colors',
      title: 'Favorite colors?',
      options: ['black', 'white', 'blue', 'green', 'beige', 'red'],
    },
    {
      key: 'brands',
      title: 'Preferred brands?',
      options: ['Zara', 'H&M', 'Everlane', 'Levi’s', 'Patagonia', 'Reformation'],
    },
    {
      key: 'size',
      title: 'Your size?',
      options: ['XS', 'S', 'M', 'L', 'XL', '24', '26', '28'],
    },
  ];

  const toggleSelection = (key: keyof UserPreferences, value: string) => {
    setPrefs((prev) => {
      if (key === 'size') {
        // ✅ size est une chaîne unique
        return { ...prev, size: value };
      } else {
        // ✅ styles, colors, brands sont des tableaux
        const current = prev[key] as string[]; // TypeScript sait que c'est un array ici
        const isSelected = current.includes(value);
        const updated = isSelected
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [key]: updated };
      }
    });
  };

  const handleNext = async () => {
    if (step === questions.length - 1) {
      try {
        await SecureStore.setItemAsync('user_preferences', JSON.stringify(prefs));
        await SecureStore.setItemAsync('onboarding_complete', 'true');
        router.replace('/');
      } catch (error) {
        console.error('Failed to save onboarding data', error);
        // Optionnel : afficher une alerte à l’utilisateur
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const currentQ = questions[step];
  const selected = prefs[currentQ.key];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{currentQ.title}</Text>
      {currentQ.options.map((opt) => {
        const isSelected =
          typeof selected === 'string'
            ? selected === opt
            : Array.isArray(selected) && selected.includes(opt);

        return (
          <TouchableOpacity
            key={opt}
            style={[styles.option, isSelected && styles.selected]}
            onPress={() => toggleSelection(currentQ.key, opt)}
          >
            <Text>{opt}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        onPress={handleNext}
        style={{
          marginTop: 40,
          padding: 15,
          backgroundColor: '#4a90e2',
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {step === questions.length - 1 ? 'Start Swiping!' : 'Next'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default OnboardingScreen;