import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();
  const appVersion = '1.0.0';
  const buildNumber = '1';

  const handlePrivacyPolicy = () => {
    router.push('/settings/privacy');
  };

  const handleTermsOfService = () => {
    router.push('/settings/terms');
  };

  const handleLicenses = () => {
    router.push('/settings/licenses');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Ionicons name="apps" size={64} color="#14B8A6" />
          </View>
          <Text style={styles.appName}>PetPal</Text>
          <Text style={styles.appVersion}>Version {appVersion} ({buildNumber})</Text>
          <Text style={styles.appTagline}>Your Personal Companion</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <TouchableOpacity style={styles.option} onPress={handlePrivacyPolicy}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleTermsOfService}>
            <Ionicons name="document-text-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleLicenses}>
            <Ionicons name="code-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Open Source Licenses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>{buildNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>React Native / Expo</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with AppForge AI</Text>
          <Text style={styles.copyright}>© {new Date().getFullYear()} PetPal. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 56,
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    minHeight: 50,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});
