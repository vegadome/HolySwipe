// app/profile/edit-profile.tsx

import { decode } from 'base64-arraybuffer';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';
// 🔹 Types
interface UserPreferences {
  styles: string[];
  colors: string[];
  brands: string[];
  size: string;
}

interface ProfileData {
  username: string | null;
  preferences: UserPreferences | null;
}


// 🔹 Options (doivent correspondre à l'onboarding)
const styleOptions = ['Casual', 'Formal', 'Boho', 'Minimal', 'Streetwear', 'Vintage'];
const colorOptions = ['Black', 'White', 'Blue', 'Green', 'Beige', 'Red', 'Pastels'];
const brandOptions = ['Zara', 'H&M', 'Everlane', 'Levi’s', 'Patagonia', 'Nike'];
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '24', '26', '28'];

export default function EditProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    styles: [],
    colors: [],
    brands: [],
    size: '',
  });
  const [loading, setLoading] = useState(false);
  const masterAnim = useRef(new Animated.Value(0)).current;
  const [avatar, setAvatar] = useState<string | null>(null); // URI local
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // URL Supabase

  const pickImage = async () => {
  // Demande la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission refusée');
      return;
    }

    // Ouvre la galerie
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatar(uri); // ✅ Aperçu local
    }
  };

  const uploadAvatar = async (uri: string, currentAvatarUrl?: string): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not logged in');

    // Lire le fichier en Base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Décoder en ArrayBuffer
    const arrayBuffer = decode(base64);

    // Déterminer l'extension et le contentType
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const validExt = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt) ? fileExt : 'jpg';
    const mimeType = `image/${validExt === 'jpg' ? 'jpeg' : validExt}`;

    // Nom du fichier unique par utilisateur (remplace automatiquement l'ancien)
    const fileName = `${user.id}.${validExt}`;

    // Upload avec upsert pour remplacer l'ancien avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Obtenir l'URL publique
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (!data?.publicUrl) throw new Error('Failed to get public URL');

    return data.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

  useEffect(() => {
    startEntryAnimation();
    loadCurrentData();
  }, []);


  const loadCurrentData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, preferences, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url); // ✅ Charge l'URL de l'avatar
        setPreferences(data.preferences || {
          styles: [],
          colors: [],
          brands: [],
          size: '',
        });
      }
    }
  };

  const startEntryAnimation = () => {
    Animated.timing(masterAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const toggleSelection = (category: keyof UserPreferences, value: string) => {
    setPreferences(prev => {
      if (category === 'size') {
        // Taille unique
        return { ...prev, size: value };
      } else {
        // Multi-sélection
        const current = prev[category] as string[];
        if (current.includes(value)) {
          return { ...prev, [category]: current.filter(v => v !== value) };
        } else {
          return { ...prev, [category]: [...current, value] };
        }
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      let newAvatarUrl = avatarUrl;

      // ✅ Upload si nouvel avatar sélectionné
      if (avatar) {
        const uploadResult = await uploadAvatar(avatar);
        newAvatarUrl = uploadResult;
      }

      const { data:  { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          preferences,
          avatar_url: newAvatarUrl, // ✅ Met à jour l'URL
        })
        .eq('id', user?.id);

      if (!error) {
        router.back();
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const opacity = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.mainContent, { opacity, transform: [{ translateY }] }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Text style={styles.closeText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>MODIFIER</Text>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <Text style={[styles.saveText, loading && { opacity: 0.5 }]}>
                {loading ? '...' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollPadding}>
            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
              <Image
                source={{ 
                  uri: avatar || avatarUrl || 'https://avatar.iran.liara.run/public/60' 
                }}
                style={styles.avatar}
                contentFit="cover"
              />
              <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
                <Text style={styles.changePhotoText}>Changer la photo</Text>
              </TouchableOpacity>
            </View>

            {/* Username */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>NOM D'UTILISATEUR</Text>
              <BlurView intensity={15} tint="light" style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Votre pseudo"
                  placeholderTextColor="#444"
                  selectionColor="#E2F163"
                />
              </BlurView>
            </View>

            {/* Styles */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>STYLE</Text>
              <View style={styles.optionsGrid}>
                {styleOptions.map(option => {
                  const isSelected = preferences.styles.includes(option);
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionSelected
                      ]}
                      onPress={() => toggleSelection('styles', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

          {/* Taille */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>TAILLE</Text>
            <View style={styles.optionsGrid}>
              {sizeOptions.map(option => {
                const isSelected = preferences.size === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionSelected
                    ]}
                    onPress={() => toggleSelection('size', option)}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

            {/* Couleurs */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>COULEURS</Text>
              <View style={styles.optionsGrid}>
                {colorOptions.map(option => {
                  const isSelected = preferences.colors.includes(option);
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionSelected
                      ]}
                      onPress={() => toggleSelection('colors', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Marques */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>MARQUES</Text>
              <View style={styles.optionsGrid}>
                {brandOptions.map(option => {
                  const isSelected = preferences.brands.includes(option);
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionSelected
                      ]}
                      onPress={() => toggleSelection('brands', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={styles.infoText}>
              Ces informations sont visibles par les autres membres de la communauté.
            </Text>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mainContent: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: { color: '#FFF', fontWeight: '900', letterSpacing: 2, fontSize: 13 },
  closeText: { color: '#888', fontSize: 15 },
  saveText: { color: '#E2F163', fontSize: 15, fontWeight: 'bold' },
  scrollPadding: { paddingHorizontal: 25, paddingTop: 30 },
  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 15 },
  changePhotoText: { color: '#E2F163', fontWeight: '600', fontSize: 14 },
  
  // Form sections
  formSection: { marginBottom: 30 },
  sectionTitle: { 
    color: '#444', 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 1.5, 
    marginBottom: 12,
    textTransform: 'uppercase'
  },
  
  // Options
  optionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  optionSelected: {
    backgroundColor: 'rgba(226, 241, 99, 0.2)',
    borderColor: '#E2F163',
  },
  optionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#000',
  },
  
  // Inputs
  inputWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  
  infoText: { 
    color: '#333', 
    fontSize: 12, 
    textAlign: 'center', 
    marginTop: 20, 
    lineHeight: 18,
    paddingHorizontal: 20 
  }
});