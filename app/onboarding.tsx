/**
 * Onboarding Screen with 7-Day Free Trial Offer
 * Shows on first app launch to convert users to premium subscription
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import RevenueCatService from '../src/services/revenueCat.service';
import { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';

const { width, height } = Dimensions.get('window');

const ONBOARDING_COMPLETE_KEY = 'petpal_onboarding_complete';

const FEATURES = [
  {
    icon: 'paw',
    title: 'Unlimited Pet Profiles',
    description: 'Track all your furry friends in one place',
  },
  {
    icon: 'calendar',
    title: 'Smart Reminders',
    description: 'Never miss vaccinations or vet appointments',
  },
  {
    icon: 'medical',
    title: 'Health Records',
    description: 'Store complete medical history securely',
  },
  {
    icon: 'analytics',
    title: 'Health Insights',
    description: 'Track weight, diet, and activity trends',
  },
  {
    icon: 'cloud-upload',
    title: 'Cloud Sync',
    description: 'Access your data on all devices',
  },
  {
    icon: 'shield-checkmark',
    title: 'Priority Support',
    description: 'Get help when you need it most',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { checkSubscriptionStatus, purchasePackage, isPremium, isLoading } = useSubscriptionStore();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadOfferings();

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoadingOfferings(true);
      const currentOffering = await RevenueCatService.getOfferings();
      setOffering(currentOffering);

      // Pre-select yearly as it has the best value with trial
      if (currentOffering?.annual) {
        setSelectedPackage(currentOffering.annual);
      } else if (currentOffering?.monthly) {
        setSelectedPackage(currentOffering.monthly);
      }
    } catch (err) {
      console.error('Failed to load offerings:', err);
    } finally {
      setLoadingOfferings(false);
    }
  };

  const handleStartTrial = async () => {
    if (!selectedPackage) {
      // If no packages available, present native paywall
      handlePresentPaywall();
      return;
    }

    setPurchasing(true);
    try {
      const success = await purchasePackage(selectedPackage);

      if (success) {
        await markOnboardingComplete();
        Alert.alert(
          'Welcome to PetPal Premium! 🎉',
          'Your 7-day free trial has started. You won\'t be charged until the trial ends.',
          [{ text: 'Get Started', onPress: () => router.replace('/(tabs)') }]
        );
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handlePresentPaywall = async () => {
    try {
      const result = await RevenueCatUI.presentPaywall();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await markOnboardingComplete();
          await checkSubscriptionStatus();
          router.replace('/(tabs)');
          break;
        case PAYWALL_RESULT.CANCELLED:
        case PAYWALL_RESULT.ERROR:
          // User cancelled or error, stay on screen
          break;
      }
    } catch (err) {
      console.error('Paywall error:', err);
    }
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    router.replace('/(tabs)');
  };

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  const getPackagePrice = (pkg: PurchasesPackage | null) => {
    if (!pkg) return '';
    return pkg.product.priceString;
  };

  const getPackagePeriod = (pkg: PurchasesPackage | null) => {
    if (!pkg) return '';
    const type = pkg.packageType;
    if (type === 'ANNUAL') return '/year';
    if (type === 'MONTHLY') return '/month';
    if (type === 'LIFETIME') return ' once';
    return '';
  };

  const calculateSavings = () => {
    if (!offering?.monthly || !offering?.annual) return null;

    const monthlyPrice = offering.monthly.product.price;
    const yearlyPrice = offering.annual.product.price;
    const yearlyMonthlyEquivalent = yearlyPrice / 12;
    const savings = Math.round((1 - yearlyMonthlyEquivalent / monthlyPrice) * 100);

    return savings > 0 ? savings : null;
  };

  // If already premium, skip to main app
  useEffect(() => {
    if (isPremium) {
      markOnboardingComplete();
      router.replace('/(tabs)');
    }
  }, [isPremium]);

  if (loadingOfferings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Preparing your experience...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const savings = calculateSavings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Skip button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityLabel="Skip and continue with free version"
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="paw" size={48} color="#14B8A6" />
            </View>
            <Text style={styles.heroTitle}>PetPal Premium</Text>
            <View style={styles.trialBadge}>
              <Ionicons name="gift" size={18} color="#14B8A6" />
              <Text style={styles.trialBadgeText}>7-DAY FREE TRIAL</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              Try all premium features free for 7 days.{'\n'}Cancel anytime.
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresSection}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={22} color="#14B8A6" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#14B8A6" />
              </View>
            ))}
          </View>

          {/* Plan Selection */}
          {offering && (
            <View style={styles.plansSection}>
              <Text style={styles.plansTitle}>Choose Your Plan</Text>

              {/* Yearly Plan - Best Value */}
              {offering.annual && (
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPackage?.identifier === offering.annual.identifier && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPackage(offering.annual!)}
                  accessibilityLabel={`Select yearly plan at ${getPackagePrice(offering.annual)} per year`}
                >
                  {savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsBadgeText}>SAVE {savings}%</Text>
                    </View>
                  )}
                  <View style={styles.planContent}>
                    <View style={styles.planRadio}>
                      <View style={[
                        styles.radioOuter,
                        selectedPackage?.identifier === offering.annual.identifier && styles.radioOuterSelected,
                      ]}>
                        {selectedPackage?.identifier === offering.annual.identifier && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </View>
                    <View style={styles.planDetails}>
                      <Text style={styles.planName}>Yearly</Text>
                      <Text style={styles.planTrialText}>7-day free trial, then</Text>
                    </View>
                    <View style={styles.planPricing}>
                      <Text style={styles.planPrice}>{getPackagePrice(offering.annual)}</Text>
                      <Text style={styles.planPeriod}>/year</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Monthly Plan */}
              {offering.monthly && (
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPackage?.identifier === offering.monthly.identifier && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPackage(offering.monthly!)}
                  accessibilityLabel={`Select monthly plan at ${getPackagePrice(offering.monthly)} per month`}
                >
                  <View style={styles.planContent}>
                    <View style={styles.planRadio}>
                      <View style={[
                        styles.radioOuter,
                        selectedPackage?.identifier === offering.monthly.identifier && styles.radioOuterSelected,
                      ]}>
                        {selectedPackage?.identifier === offering.monthly.identifier && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </View>
                    <View style={styles.planDetails}>
                      <Text style={styles.planName}>Monthly</Text>
                      <Text style={styles.planTrialText}>7-day free trial, then</Text>
                    </View>
                    <View style={styles.planPricing}>
                      <Text style={styles.planPrice}>{getPackagePrice(offering.monthly)}</Text>
                      <Text style={styles.planPeriod}>/month</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaButton, (purchasing || isLoading) && styles.ctaButtonDisabled]}
            onPress={handleStartTrial}
            disabled={purchasing || isLoading}
            accessibilityLabel="Start free trial"
          >
            {purchasing || isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.ctaButtonText}>Start Free Trial</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.ctaIcon} />
              </>
            )}
          </TouchableOpacity>

          {/* Trial Info */}
          <View style={styles.trialInfo}>
            <View style={styles.trialInfoItem}>
              <Ionicons name="card-outline" size={20} color="#64748B" />
              <Text style={styles.trialInfoText}>No payment now</Text>
            </View>
            <View style={styles.trialInfoItem}>
              <Ionicons name="notifications-off-outline" size={20} color="#64748B" />
              <Text style={styles.trialInfoText}>We'll remind you before trial ends</Text>
            </View>
            <View style={styles.trialInfoItem}>
              <Ionicons name="close-circle-outline" size={20} color="#64748B" />
              <Text style={styles.trialInfoText}>Cancel anytime in settings</Text>
            </View>
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            After your 7-day free trial, your subscription will automatically renew at{' '}
            {selectedPackage ? `${getPackagePrice(selectedPackage)}${getPackagePeriod(selectedPackage)}` : 'the selected price'}{' '}
            unless cancelled at least 24 hours before the end of the trial period.
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>

          {/* Restore link */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={async () => {
              const { restorePurchases } = useSubscriptionStore.getState();
              const restored = await restorePurchases();
              if (restored) {
                await markOnboardingComplete();
                Alert.alert('Restored!', 'Your subscription has been restored.', [
                  { text: 'Continue', onPress: () => router.replace('/(tabs)') }
                ]);
              } else {
                Alert.alert('No Purchases Found', "We couldn't find any previous purchases.");
              }
            }}
            accessibilityLabel="Restore purchases"
          >
            <Text style={styles.restoreText}>Already subscribed? Restore purchase</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 12,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#134E4A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  trialBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14B8A6',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  plansSection: {
    marginBottom: 24,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#334155',
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: '#0F2620',
  },
  savingsBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  savingsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadio: {
    marginRight: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#14B8A6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#14B8A6',
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  planTrialText: {
    fontSize: 13,
    color: '#64748B',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  planPeriod: {
    fontSize: 13,
    color: '#64748B',
  },
  ctaButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaIcon: {
    marginLeft: 8,
  },
  trialInfo: {
    marginBottom: 24,
  },
  trialInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  trialInfoText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  termsText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '500',
  },
});
