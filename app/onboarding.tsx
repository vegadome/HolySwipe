// app/onboarding.tsx

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase'; // ✅ Importe Supabase

const { width } = Dimensions.get('window');

interface UserPreferences {
  styles: string[];
  colors: string[];
  brands: string[];
  size: string;
}

interface Question {
  key: keyof UserPreferences;
  title: string;
  subtitle: string;
  options: string[];
}

const OnboardingScreen = () => {
  const isMounted = useRef(true);
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [prefs, setPrefs] = useState<UserPreferences>({
    styles: [],
    colors: [],
    brands: [],
    size: '',
  });
  const [loading, setLoading] = useState(false); // ✅ Pour le bouton

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const questions: Question[] = [
    {
      key: 'styles',
      title: 'Quel est ton style ?',
      subtitle: 'Choisis-en un ou plusieurs',
      options: ['Casual', 'Formal', 'Boho', 'Minimal', 'Streetwear', 'Vintage'],
    },
    {
      key: 'colors',
      title: 'Couleurs favorites ?',
      subtitle: 'Tes nuances préférées',
      options: ['Black', 'White', 'Blue', 'Green', 'Beige', 'Red', 'Pastels'],
    },
    {
      key: 'brands',
      title: 'Marques préférées ?',
      subtitle: 'Sélectionne tes incontournables',
      options: ['Zara', 'H&M', 'Everlane', 'Levi’s', 'Patagonia', 'Nike'],
    },
    {
      key: 'size',
      title: 'Ta taille ?',
      subtitle: 'Pour un fit parfait',
      options: ['XS', 'S', 'M', 'L', 'XL', '24', '26', '28'],
    },
  ];

  const toggleSelection = (key: keyof UserPreferences, value: string) => {
    setPrefs((prev) => {
      if (key === 'size') return { ...prev, size: value };
      const current = prev[key] as string[];
      const isSelected = current.includes(value);
      const updated = isSelected ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  // ✅ Nouvelle fonction : sauvegarde dans Supabase + SecureStore (fallback)
  const saveOnboardingData = async (preferences: UserPreferences) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // ✅ Utilisateur connecté → sauvegarde dans Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferences,
          onboarding_complete: true,
        });

      if (error) {
        console.error('Supabase error:', error);
        Alert.alert('Error', `Failed to save: ${error.message}`);
        return false;
      }
    } else {
      // ⚠️ Utilisateur anonyme → fallback sur SecureStore
      await SecureStore.setItemAsync('user_preferences', JSON.stringify(preferences));
      await SecureStore.setItemAsync('onboarding_complete', 'true');
    }

    return true;
  };

  const handleNext = async () => {
    if (step === questions.length - 1) {
      setLoading(true);

      const success = await saveOnboardingData(prefs);
      if (!success) {
        setLoading(false);
        return;
      }

      if (isMounted.current) {
        router.replace('/home');
      }
    } else {
      if (isMounted.current) setStep(prev => prev + 1);
    }
  };

  const currentQ = questions[step];
  const selected = prefs[currentQ.key];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
      
      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        {questions.map((_, i) => (
          <View 
            key={i} 
            style={[styles.progressBar, { backgroundColor: i <= step ? '#E2F163' : '#333' }]} 
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentQ.title}</Text>
          <Text style={styles.subtitle}>{currentQ.subtitle}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {currentQ.options.map((opt) => {
            const isSelected = typeof selected === 'string' ? selected === opt : Array.isArray(selected) && selected.includes(opt);

            return (
              <TouchableOpacity
                key={opt}
                activeOpacity={0.8}
                onPress={() => toggleSelection(currentQ.key, opt)}
                style={styles.optionWrapper}
              >
                <BlurView intensity={isSelected ? 60 : 15} tint={isSelected ? "light" : "dark"} style={[styles.option, isSelected && styles.selectedOption]}>
                  <Text style={[styles.optionText, isSelected && styles.selectedText]}>{opt}</Text>
                </BlurView>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={handleNext} 
          disabled={loading}
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
        >
          <Text style={styles.nextBtnText}>
            {loading ? 'SAUVEGARDE...' : (step === questions.length - 1 ? 'COMMENCER' : 'SUIVANT')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { padding: 25, paddingBottom: 100 },
  progressContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 25, marginTop: 20 },
  progressBar: { flex: 1, height: 4, borderRadius: 2 },
  textContainer: { marginTop: 40, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#888', marginTop: 10 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionWrapper: { width: (width - 62) / 2 },
  option: {
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  selectedOption: { borderColor: '#E2F163', backgroundColor: 'rgba(226, 241, 99, 0.1)' },
  optionText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  selectedText: { color: '#000', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 40, left: 25, right: 25 },
  nextBtn: {
    backgroundColor: '#E2F163',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#E2F163',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextBtnDisabled: {
    opacity: 0.7,
  },
  nextBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});

export default OnboardingScreen;