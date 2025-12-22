import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Share, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAppStore from '../../src/stores/appStore';

const PRIVACY_SETTINGS_KEY = 'app_privacy_settings';

export default function PrivacyScreen() {
  const { pets: items, reset } = useAppStore();
  const [settings, setSettings] = useState({ analytics: true, crashReports: true, shareUsageData: false, personalizedAds: false });
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => { loadSettings(); }, []);
  const loadSettings = async () => { try { const s = await AsyncStorage.getItem(PRIVACY_SETTINGS_KEY); if (s) setSettings(JSON.parse(s)); } catch {} };

  const toggleSetting = useCallback(async (key: keyof typeof settings) => {
    const n = { ...settings, [key]: !settings[key] };
    setSettings(n);
    try { await AsyncStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(n)); } catch {}
  }, [settings]);

  const handleDeleteData = () => {
    Alert.alert('Delete All Data', 'This will permanently delete all your data.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { reset(); await AsyncStorage.clear(); Alert.alert('Deleted'); }}]
    );
  };

  const handleExportData = async () => {
    try { await Share.share({ message: JSON.stringify({ items, settings }, null, 2) }); } catch { Alert.alert('Export Failed'); }
  };

  if (showPolicy) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.policyHeader}>
          <TouchableOpacity onPress={() => setShowPolicy(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.policyHeaderTitle}>Privacy Policy</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView style={styles.policyContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.policyTitle}>Privacy Policy</Text>
          <Text style={styles.effectiveDate}>Effective Date: December 22, 2024</Text>

          <Text style={styles.intro}>
            PetPal ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>1. Information We Collect</Text>

            <Text style={styles.subheading}>Personal Information</Text>
            <Text style={styles.paragraph}>When you create an account, we may collect:</Text>
            <Text style={styles.bulletPoint}>• Email address</Text>
            <Text style={styles.bulletPoint}>• Display name</Text>
            <Text style={styles.bulletPoint}>• Profile photo (optional)</Text>

            <Text style={styles.subheading}>Pet Information</Text>
            <Text style={styles.paragraph}>Information you provide about your pets:</Text>
            <Text style={styles.bulletPoint}>• Pet names, species, breeds, and ages</Text>
            <Text style={styles.bulletPoint}>• Health records and vaccination history</Text>
            <Text style={styles.bulletPoint}>• Appointment schedules</Text>
            <Text style={styles.bulletPoint}>• Photos of your pets</Text>

            <Text style={styles.subheading}>Usage Data</Text>
            <Text style={styles.paragraph}>We automatically collect:</Text>
            <Text style={styles.bulletPoint}>• Device information (type, operating system)</Text>
            <Text style={styles.bulletPoint}>• App usage statistics</Text>
            <Text style={styles.bulletPoint}>• Crash reports and error logs</Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>We use collected information to:</Text>
            <Text style={styles.bulletPoint}>• Provide and maintain the App's functionality</Text>
            <Text style={styles.bulletPoint}>• Sync your data across devices</Text>
            <Text style={styles.bulletPoint}>• Send reminder notifications</Text>
            <Text style={styles.bulletPoint}>• Improve our services and user experience</Text>
            <Text style={styles.bulletPoint}>• Respond to customer support requests</Text>
            <Text style={styles.bulletPoint}>• Process subscription payments</Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>3. Data Storage and Security</Text>
            <Text style={styles.paragraph}>
              Your data is stored securely using Supabase, a trusted cloud database provider. We implement industry-standard security measures including:
            </Text>
            <Text style={styles.bulletPoint}>• Encryption in transit (TLS/SSL)</Text>
            <Text style={styles.bulletPoint}>• Encryption at rest</Text>
            <Text style={styles.bulletPoint}>• Row-level security policies</Text>
            <Text style={styles.bulletPoint}>• Secure authentication tokens</Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>4. Data Sharing</Text>
            <Text style={styles.paragraph}>
              We do NOT sell your personal information. We may share data with:
            </Text>
            <Text style={styles.bulletPoint}>• Service providers who assist in operating our App</Text>
            <Text style={styles.bulletPoint}>• Payment processors for subscription management</Text>
            <Text style={styles.bulletPoint}>• Law enforcement when required by law</Text>
            <Text style={styles.paragraph}>
              Third-party services used include Supabase (database), RevenueCat (subscriptions), and Expo (push notifications).
            </Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>5. Your Rights</Text>
            <Text style={styles.paragraph}>You have the right to:</Text>
            <Text style={styles.bulletPoint}>• Access your personal data</Text>
            <Text style={styles.bulletPoint}>• Export your data</Text>
            <Text style={styles.bulletPoint}>• Request correction of inaccurate data</Text>
            <Text style={styles.bulletPoint}>• Delete your account and associated data</Text>
            <Text style={styles.bulletPoint}>• Opt-out of analytics and marketing</Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>6. Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your data for as long as your account is active. Upon account deletion, your data is permanently removed from our servers within 30 days, except where retention is required by law.
            </Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.paragraph}>
              PetPal is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover such information has been collected, we will delete it promptly.
            </Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>8. Push Notifications</Text>
            <Text style={styles.paragraph}>
              We may send push notifications for reminders and important updates. You can disable notifications at any time through your device settings or within the App.
            </Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>9. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy periodically. We will notify you of significant changes through the App or via email. Your continued use after changes constitutes acceptance.
            </Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.policySectionTitle}>10. Contact Us</Text>
            <Text style={styles.paragraph}>
              For privacy-related questions or to exercise your rights, contact us at:
            </Text>
            <Text style={styles.contactInfo}>privacy@petpal.app</Text>
          </View>

          <View style={styles.policyFooter}>
            <Text style={styles.footerText}>
              By using PetPal, you consent to the collection and use of information in accordance with this Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Collection</Text>

          <View style={styles.option}>
            <Ionicons name="analytics-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Analytics</Text>
              <Text style={styles.optionDescription}>Help improve the app with usage data</Text>
            </View>
            <Switch
              value={settings.analytics}
              onValueChange={() => toggleSetting('analytics')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.analytics ? '#14B8A6' : '#9CA3AF'}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="bug-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Crash Reports</Text>
              <Text style={styles.optionDescription}>Send crash reports to fix bugs</Text>
            </View>
            <Switch
              value={settings.crashReports}
              onValueChange={() => toggleSetting('crashReports')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.crashReports ? '#14B8A6' : '#9CA3AF'}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="eye-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Personalized Ads</Text>
              <Text style={styles.optionDescription}>Show relevant advertisements</Text>
            </View>
            <Switch
              value={settings.personalizedAds}
              onValueChange={() => toggleSetting('personalizedAds')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.personalizedAds ? '#14B8A6' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Documents</Text>

          <TouchableOpacity style={styles.actionButton} onPress={() => setShowPolicy(true)}>
            <Ionicons name="document-text-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Privacy Policy</Text>
              <Text style={styles.optionDescription}>Read our full privacy policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <Ionicons name="download-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Export My Data</Text>
              <Text style={styles.optionDescription}>Download a copy of your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDeleteData}>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: '#EF4444' }]}>Delete All Data</Text>
              <Text style={styles.optionDescription}>Permanently remove your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    minHeight: 72,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 72,
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  // Policy view styles
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  policyContent: {
    flex: 1,
    padding: 16,
  },
  policyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  effectiveDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  intro: {
    fontSize: 16,
    color: '#CBD5E1',
    lineHeight: 24,
    marginBottom: 24,
  },
  policySection: {
    marginBottom: 24,
  },
  policySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14B8A6',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 24,
    marginLeft: 8,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 15,
    color: '#14B8A6',
    marginTop: 8,
  },
  policyFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 24,
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
});
