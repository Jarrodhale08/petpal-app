/**
 * Customer Center Screen
 * Allows users to manage their subscriptions using RevenueCat's Customer Center
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RevenueCatUI from 'react-native-purchases-ui';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';

export default function CustomerCenterScreen() {
  const router = useRouter();
  const { isPremium, checkSubscriptionStatus } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Automatically present Customer Center if user is premium
    if (isPremium) {
      presentCustomerCenter();
    }
  }, []);

  const presentCustomerCenter = async () => {
    setIsLoading(true);

    try {
      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onFeedbackSurveyCompleted: (_param) => {
            // Feedback survey completed
          },
          onShowingManageSubscriptions: () => {
            // Showing manage subscriptions
          },
          onRestoreStarted: () => {
            // Restore started
          },
          onRestoreCompleted: async (_param) => {
            await checkSubscriptionStatus();
          },
          onRestoreFailed: (_param) => {
            Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
          },
        },
      });

      // Refresh subscription status after closing
      await checkSubscriptionStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to open subscription management.');
    } finally {
      setIsLoading(false);
    }
  };

  // Non-premium users shouldn't access this screen
  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Subscription</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Text style={styles.noSubscriptionText}>
            You don't have an active subscription.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.replace('/subscription')}
          >
            <Text style={styles.upgradeButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Subscription</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.manageButton}
            onPress={presentCustomerCenter}
          >
            <Ionicons name="settings-outline" size={24} color="#14B8A6" />
            <Text style={styles.manageButtonText}>Open Subscription Manager</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1D2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#2D3244',
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#14B8A6',
    marginLeft: 12,
  },
  noSubscriptionText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
