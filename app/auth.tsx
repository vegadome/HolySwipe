import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: 'HolySwipe://login' },
      });

      if (signUpError) {
        Alert.alert('Erreur', signUpError.message);
      } else {
        Alert.alert('Vérifie tes emails', 'Un lien de confirmation a été envoyé.');
      }
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', data.user.id)
        .single();

      router.replace(profile?.onboarding_complete ? '/home' : '/onboarding');
    }
    setLoading(false);
  };

  const signInAnonymously = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      router.replace('/onboarding');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <LinearGradient colors={['#1a1a1a', '#000']} style={StyleSheet.absoluteFill} />
      
      {/* Cercle lumineux diffus en arrière-plan */}
      <View style={styles.glow} />

      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>HOLY<Text style={{ color: '#E2F163' }}>SWIPE</Text></Text>
          <Text style={styles.subtitle}>Ta dose quotidienne de style.</Text>
        </View>

        <View style={styles.form}>
          <BlurView intensity={20} tint="light" style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </BlurView>

          <BlurView intensity={20} tint="light" style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </BlurView>

          <TouchableOpacity
            style={[styles.button, loading && styles.disabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>CONTINUER</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.anonButton}
            onPress={signInAnonymously}
            disabled={loading}
          >
            <Text style={styles.anonButtonText}>Continuer en tant qu'invité</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  glow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#E2F163',
    opacity: 0.15,
    filter: 'blur(80px)', // Note: fonctionne sur iOS, simulation via shadow sur Android si besoin
  },
  inner: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { marginBottom: 50 },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  form: { gap: 15 },
  inputWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    padding: 18,
    color: '#FFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#E2F163',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#E2F163',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  anonButton: {
    padding: 15,
    alignItems: 'center',
  },
  anonButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: { opacity: 0.6 },
});