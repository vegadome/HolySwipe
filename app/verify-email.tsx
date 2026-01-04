import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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
import { supabase } from '../lib/supabase';

const VerifyEmailScreen = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Refs pour gérer le focus automatique entre les cases
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    // On ne garde que le dernier caractère saisi
    newCode[index] = text.slice(-1);
    setCode(newCode);

    // Déplace le focus vers la case suivante si on a saisi un chiffre
    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Déplace le focus vers la case précédente si on appuie sur retour arrière
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    const otp = code.join('');
    if (otp.length !== 4) {
      Alert.alert('Erreur', 'Veuillez entrer le code à 4 chiffres');
      return;
    }

    setLoading(true);
    // Note: Supabase verifyOtp nécessite souvent l'email ou le téléphone
    const { error } = await supabase.auth.verifyOtp({
      email: '', // À récupérer via une state globale ou params si nécessaire
      token: otp,
      type: 'signup',
    });

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      Alert.alert('Succès', 'Email vérifié !');
      router.replace('/home');
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
          <Text style={styles.title}>VÉRIFICATION</Text>
          <Text style={styles.subtitle}>
            Entrez le code de sécurité envoyé à votre adresse email.
          </Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <BlurView key={index} intensity={15} tint="light" style={styles.inputWrapper}>
              <TextInput
                ref={(el) => (inputs.current[index] = el!)}
                style={[
                  styles.codeInput,
                  code[index] ? styles.codeInputActive : null
                ]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.1)"
                selectionColor="#E2F163"
              />
            </BlurView>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.disabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? 'VÉRIFICATION...' : 'CONFIRMER'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas reçu de code ? </Text>
          <TouchableOpacity onPress={() => Alert.alert('Infos', 'Un nouveau code a été envoyé.')}>
            <Text style={styles.resendLink}>Renvoyer</Text>
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
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 15,
    lineHeight: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  inputWrapper: {
    width: (Dimensions.get('window').width - 100) / 4,
    height: 70,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  codeInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  codeInputActive: {
    color: '#E2F163',
  },
  verifyButton: {
    backgroundColor: '#E2F163',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#E2F163',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  verifyButtonText: {
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
    marginTop: 30,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  resendLink: {
    color: '#E2F163',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

// Import Dimensions pour le calcul de largeur des inputs
import { Dimensions } from 'react-native';

export default VerifyEmailScreen;