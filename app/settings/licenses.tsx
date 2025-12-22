import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface License {
  name: string;
  version: string;
  license: string;
  url?: string;
}

const LICENSES: License[] = [
  { name: 'React Native', version: '0.76.x', license: 'MIT', url: 'https://github.com/facebook/react-native' },
  { name: 'Expo', version: '52.x', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'React', version: '18.x', license: 'MIT', url: 'https://github.com/facebook/react' },
  { name: 'Zustand', version: '4.x', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
  { name: '@supabase/supabase-js', version: '2.x', license: 'MIT', url: 'https://github.com/supabase/supabase-js' },
  { name: 'expo-router', version: '4.x', license: 'MIT', url: 'https://github.com/expo/router' },
  { name: '@react-native-async-storage/async-storage', version: '1.x', license: 'MIT', url: 'https://github.com/react-native-async-storage/async-storage' },
  { name: 'react-native-safe-area-context', version: '4.x', license: 'MIT', url: 'https://github.com/th3rdwave/react-native-safe-area-context' },
  { name: 'react-native-gesture-handler', version: '2.x', license: 'MIT', url: 'https://github.com/software-mansion/react-native-gesture-handler' },
  { name: '@expo/vector-icons', version: '14.x', license: 'MIT', url: 'https://github.com/expo/vector-icons' },
  { name: 'expo-notifications', version: '0.x', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-image-picker', version: '15.x', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-secure-store', version: '13.x', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: '@react-native-community/datetimepicker', version: '8.x', license: 'MIT', url: 'https://github.com/react-native-datetimepicker/datetimepicker' },
  { name: 'react-native-purchases', version: '8.x', license: 'MIT', url: 'https://github.com/RevenueCat/react-native-purchases' },
];

export default function LicensesScreen() {
  const handleOpenUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Open Source Licenses</Text>
        <Text style={styles.description}>
          PetPal is built with the help of these amazing open source projects. We are grateful to their contributors.
        </Text>

        <View style={styles.licenseList}>
          {LICENSES.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.licenseItem}
              onPress={() => item.url && handleOpenUrl(item.url)}
              disabled={!item.url}
            >
              <View style={styles.licenseInfo}>
                <Text style={styles.licenseName}>{item.name}</Text>
                <Text style={styles.licenseVersion}>v{item.version}</Text>
              </View>
              <View style={styles.licenseRight}>
                <View style={styles.licenseBadge}>
                  <Text style={styles.licenseBadgeText}>{item.license}</Text>
                </View>
                {item.url && (
                  <Ionicons name="open-outline" size={18} color="#6B7280" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mitSection}>
          <Text style={styles.mitTitle}>MIT License</Text>
          <Text style={styles.mitText}>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
          </Text>
          <Text style={styles.mitText}>
            The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
          </Text>
          <Text style={styles.mitText}>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For complete license information, please visit each project's repository.
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
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
    marginBottom: 24,
  },
  licenseList: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  licenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  licenseInfo: {
    flex: 1,
  },
  licenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  licenseVersion: {
    fontSize: 13,
    color: '#6B7280',
  },
  licenseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  licenseBadge: {
    backgroundColor: '#134E4A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  licenseBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14B8A6',
  },
  mitSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  mitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6',
    marginBottom: 12,
  },
  mitText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    paddingVertical: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
