import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SupportScreen() {
  const handleEmail = () => {
    Linking.openURL('mailto:support@example.com?subject=PetPal%20Support');
  };

  const handleFAQ = () => {
    Alert.alert('FAQ', 'Frequently Asked Questions would open here.');
  };

  const handleGuide = () => {
    Alert.alert('User Guide', 'The user guide would open here.');
  };

  const handleFeedback = () => {
    Alert.alert(
      'Send Feedback',
      'We\'d love to hear from you!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Feedback', onPress: handleEmail },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Report a Bug',
      'Help us fix issues by reporting bugs.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report Bug', onPress: handleEmail },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>

          <TouchableOpacity style={styles.option} onPress={handleFAQ}>
            <Ionicons name="help-circle-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>FAQ</Text>
              <Text style={styles.optionDescription}>Find answers to common questions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleGuide}>
            <Ionicons name="book-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>User Guide</Text>
              <Text style={styles.optionDescription}>Learn how to use PetPal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleEmail}>
            <Ionicons name="mail-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Contact Support</Text>
              <Text style={styles.optionDescription}>Get help from our team</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback</Text>

          <TouchableOpacity style={styles.option} onPress={handleFeedback}>
            <Ionicons name="chatbubble-outline" size={24} color="#6366F1" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Send Feedback</Text>
              <Text style={styles.optionDescription}>Share your thoughts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleReport}>
            <Ionicons name="bug-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Report a Bug</Text>
              <Text style={styles.optionDescription}>Help us fix issues</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need immediate help?</Text>
          <Text style={styles.contactText}>
            Email us at support@example.com and we'll get back to you within 24 hours.
          </Text>
        </View>
      </View>
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
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 72,
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
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  contactCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});
