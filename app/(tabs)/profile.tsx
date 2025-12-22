import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput, Alert, Image, Platform, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, InputAccessoryView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProfileStore } from '../../src/stores/profileStore';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoading, updateProfile } = useProfileStore();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    avatar: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setRefreshing(false);
  }, []);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, avatar: result.assets[0].uri }));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        avatar: formData.avatar,
      });

      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, updateProfile]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => setError(null)}
            accessibilityLabel="Retry loading profile"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#14B8A6']}
                tintColor="#14B8A6"
              />
            }
          >
            <Text style={styles.title}>Profile</Text>

            <View style={styles.avatarContainer}>
              <TouchableOpacity 
                onPress={handlePickImage}
                accessibilityLabel="Change profile picture"
                accessibilityRole="button"
                style={styles.avatarTouchable}
              >
                {formData.avatar ? (
                  <Image source={{ uri: formData.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <Text style={styles.avatarEditText}>Edit</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  accessibilityLabel="Name input"
                  accessibilityHint="Enter your full name"
                  autoCapitalize="words"
                  returnKeyType="next"
                  inputAccessoryViewID="profile-keyboard"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  inputAccessoryViewID="profile-keyboard"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  accessibilityLabel="Phone input"
                  accessibilityHint="Enter your phone number"
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  inputAccessoryViewID="profile-keyboard"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSaving}
                accessibilityLabel="Save profile"
                accessibilityRole="button"
                accessibilityState={{ disabled: isSaving }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="profile-keyboard">
          <View style={styles.keyboardAccessory}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity 
              onPress={() => Keyboard.dismiss()} 
              style={styles.keyboardDoneButton}
              accessibilityLabel="Dismiss keyboard"
              accessibilityRole="button"
            >
              <Text style={styles.keyboardDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  keyboardView: { 
    flex: 1 
  },
  content: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    fontSize: 16, 
    color: '#EF4444', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  retryButton: { 
    backgroundColor: '#14B8A6', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#F8FAFC',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarTouchable: {
    position: 'relative',
    minHeight: 44,
    minWidth: 44,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#334155',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  avatarEditText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F8FAFC',
    minHeight: 44,
  },
  submitButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 44,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardAccessory: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderTopWidth: 1,
    borderTopColor: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  keyboardDoneButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  keyboardDoneText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
});
