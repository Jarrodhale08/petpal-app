/**
 * Subscription Paywall Screen
 * Uses RevenueCatUI for native paywall presentation
 */

import React, { useEffect, useState, useCallback } from 'react';
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
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import RevenueCatService from '../src/services/revenueCat.service';

export default function SubscriptionScreen() {
  const router = useRouter();
  const {
    isPremium,
    currentPlan,
    expirationDate,
    isLoading,
    error,
    checkSubscriptionStatus,
    restorePurchases,
  } = useSubscriptionStore();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(true);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoadingOfferings(true);
      const currentOffering = await RevenueCatService.getOfferings();
      setOffering(currentOffering);
    } catch (err) {
      console.error('Failed to load offerings:', err);
    } finally {
      setLoadingOfferings(false);
    }
  };

  const handlePresentPaywall = async () => {
    try {
      const result = await RevenueCatUI.presentPaywall();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          Alert.alert(
            'Welcome to Premium!',
            'You now have access to all premium features.',
            [{ text: 'Start Exploring', onPress: () => router.back() }]
          );
          await checkSubscriptionStatus();
          break;
        case PAYWALL_RESULT.RESTORED:
          Alert.alert(
            'Restored!',
            'Your subscription has been restored.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          await checkSubscriptionStatus();
          break;
        case PAYWALL_RESULT.CANCELLED:
          // User cancelled, do nothing
          break;
        case PAYWALL_RESULT.ERROR:
          Alert.alert('Error', 'Something went wrong. Please try again.');
          break;
      }
    } catch (err) {
      console.error('Paywall error:', err);
      Alert.alert('Error', 'Failed to present paywall.');
    }
  };

  const handlePresentPaywallIfNeeded = async () => {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'petpal_pro',
      });

      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        await checkSubscriptionStatus();
        router.back();
      }
    } catch (err) {
      console.error('Paywall error:', err);
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      Alert.alert('Restored!', 'Your subscription has been restored.');
    } else {
      Alert.alert('No Purchases Found', "We couldn't find any previous purchases to restore.");
    }
  };

  const handleManageSubscription = async () => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (err) {
      console.error('Customer center error:', err);
      Alert.alert('Error', 'Failed to open subscription management.');
    }
  };

  // Premium user view
  if (isPremium) {
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
          <Text style={styles.headerTitle}>Your Subscription</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PREMIUM MEMBER</Text>
          </View>

          <View style={styles.subscriptionCard}>
            <Text style={styles.planName}>
              {currentPlan === 'lifetime' ? 'Lifetime Access' :
               currentPlan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
            </Text>
            {expirationDate && currentPlan !== 'lifetime' && (
              <Text style={styles.planDetails}>
                Renews on {expirationDate.toLocaleDateString()}
              </Text>
            )}
            {currentPlan === 'lifetime' && (
              <Text style={styles.planDetails}>Never expires</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={handleManageSubscription}
            accessibilityLabel="Manage subscription"
          >
            <Ionicons name="settings-outline" size={20} color="#14B8A6" />
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loadingOfferings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Free user view - show upgrade options
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Go Premium</Text>
        <TouchableOpacity onPress={handleRestore} accessibilityLabel="Restore purchases">
          <Text style={styles.restoreText}>Restore</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>Unlock PetPal Premium</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to all features
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.upgradeButton, isLoading && styles.upgradeButtonDisabled]}
          onPress={handlePresentPaywall}
          disabled={isLoading}
          accessibilityLabel="View subscription options"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.upgradeButtonText}>View Plans</Text>
          )}
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <Text style={styles.termsText}>
          Subscriptions auto-renew unless cancelled at least 24 hours before
          the end of the current period. Manage subscriptions in your account settings.
        </Text>
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
  restoreText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 12,
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  premiumBadge: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  subscriptionCard: {
    backgroundColor: '#242838',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  planDetails: {
    fontSize: 14,
    color: '#94A3B8',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#14B8A6',
    marginLeft: 8,
  },
});
