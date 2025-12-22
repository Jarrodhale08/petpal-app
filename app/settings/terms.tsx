import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  const effectiveDate = 'December 22, 2024';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.effectiveDate}>Effective Date: {effectiveDate}</Text>

        <Text style={styles.intro}>
          Welcome to PetPal. By downloading, installing, or using our mobile application, you agree to be bound by these Terms of Service. Please read them carefully.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using PetPal ("the App"), you agree to comply with and be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            PetPal is a pet care management application that allows users to:
          </Text>
          <Text style={styles.bulletPoint}>• Track pet profiles and information</Text>
          <Text style={styles.bulletPoint}>• Schedule and manage veterinary appointments</Text>
          <Text style={styles.bulletPoint}>• Set reminders for feeding, walks, medications, and grooming</Text>
          <Text style={styles.bulletPoint}>• Record health information and vaccination records</Text>
          <Text style={styles.bulletPoint}>• Access premium features through subscription</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            To use certain features of the App, you may need to create an account. You are responsible for:
          </Text>
          <Text style={styles.bulletPoint}>• Maintaining the confidentiality of your account credentials</Text>
          <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
          <Text style={styles.bulletPoint}>• Providing accurate and complete information</Text>
          <Text style={styles.bulletPoint}>• Notifying us immediately of any unauthorized use</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Subscriptions and Payments</Text>
          <Text style={styles.paragraph}>
            PetPal offers premium features through subscription plans. By subscribing:
          </Text>
          <Text style={styles.bulletPoint}>• You authorize us to charge your chosen payment method</Text>
          <Text style={styles.bulletPoint}>• Subscriptions automatically renew unless cancelled</Text>
          <Text style={styles.bulletPoint}>• You can cancel anytime through your app store account settings</Text>
          <Text style={styles.bulletPoint}>• Refunds are handled according to Apple App Store or Google Play Store policies</Text>
          <Text style={styles.paragraph}>
            Free trial periods, if offered, will automatically convert to paid subscriptions unless cancelled before the trial ends.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. User Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of any content you submit to the App (pet photos, notes, etc.). By submitting content, you grant us a non-exclusive license to use, store, and display that content solely for providing the service to you.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>
          <Text style={styles.bulletPoint}>• Use the App for any unlawful purpose</Text>
          <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems</Text>
          <Text style={styles.bulletPoint}>• Interfere with or disrupt the App's functionality</Text>
          <Text style={styles.bulletPoint}>• Upload malicious code or content</Text>
          <Text style={styles.bulletPoint}>• Impersonate any person or entity</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Medical Disclaimer</Text>
          <Text style={styles.paragraph}>
            PetPal is a pet management tool and does NOT provide veterinary medical advice. The App is not a substitute for professional veterinary care. Always consult a licensed veterinarian for medical concerns about your pet. We are not responsible for any decisions made based on information stored in or provided by the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The App, including its design, features, and content (excluding user content), is owned by us and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express permission.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
          <Text style={styles.paragraph}>
            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE APP WILL BE ERROR-FREE, SECURE, OR CONTINUOUSLY AVAILABLE.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your access to the App at any time, with or without cause. Upon termination, your right to use the App ceases immediately. You may delete your account at any time through the App's settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will notify users of significant changes through the App or via email. Your continued use after changes constitutes acceptance of the new Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about these Terms, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>support@petpal.app</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using PetPal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </Text>
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
  title: {
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14B8A6',
    marginBottom: 12,
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
  footer: {
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
