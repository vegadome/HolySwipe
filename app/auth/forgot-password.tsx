import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'exp://localhost:8081',
    });

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      Alert.alert(
        'Vérifiez vos emails',
        'Un lien de réinitialisation a été envoyé à votre adresse.'
      );
      router.replace('/auth/sign-in');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>MOT DE PASSE OUBLIÉ ?</Text>
          <Text style={styles.subtitle}>
            Pas d'inquiétude. Entrez votre email pour recevoir un lien de récupération.
          </Text>
        </View>

        <View style={styles.form}>
          <BlurView intensity={10} tint="light" style={styles.inputContainer}>
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

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.disabled]}
            onPress={handleSendResetLink}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>
              {loading ? 'ENVOI EN COURS...' : 'ENVOYER LE LIEN'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous l'avez retrouvé ? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
            <Text style={styles.signInLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '300',
  },
  header: {
    marginTop: 40,
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 15,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  input: {
    paddingVertical: 18,
    paddingHorizontal: 25,
    color: '#FFF',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#E2F163',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#E2F163',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  sendButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  footerText: {
    color: '#888',
    fontSize: 15,
  },
  signInLink: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ForgotPasswordScreen;