/**
 * Subscription Store (RevenueCat Integration)
 * Manages premium subscription status using RevenueCat
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import RevenueCatService from '../services/revenueCat.service';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly' | 'lifetime';

export interface SubscriptionState {
  // State
  isInitialized: boolean;
  isPremium: boolean;
  currentPlan: SubscriptionPlan;
  expirationDate: Date | null;
  isLoading: boolean;
  error: string | null;
  customerInfo: CustomerInfo | null;

  // Actions
  initialize: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  identifyUser: (userId: string) => Promise<void>;
  logOutUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const ENTITLEMENT_ID = 'petpal_pro';

const determinePlan = (customerInfo: CustomerInfo): SubscriptionPlan => {
  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) return 'free';

  const productId = entitlement.productIdentifier.toLowerCase();
  if (productId.includes('lifetime')) return 'lifetime';
  if (productId.includes('year') || productId.includes('annual')) return 'yearly';
  if (productId.includes('month')) return 'monthly';

  return 'free';
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      isPremium: false,
      currentPlan: 'free',
      expirationDate: null,
      isLoading: false,
      error: null,
      customerInfo: null,

      initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true, error: null });

        try {
          await RevenueCatService.initialize();

          // Set up customer info listener
          RevenueCatService.addCustomerInfoUpdateListener((customerInfo) => {
            const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
            const plan = determinePlan(customerInfo);
            const expiration = customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate;

            set({
              isPremium,
              currentPlan: plan,
              expirationDate: expiration ? new Date(expiration) : null,
              customerInfo,
            });
          });

          // Get initial customer info
          const customerInfo = await RevenueCatService.getCustomerInfo();
          const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
          const plan = determinePlan(customerInfo);
          const expiration = customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate;

          set({
            isInitialized: true,
            isPremium,
            currentPlan: plan,
            expirationDate: expiration ? new Date(expiration) : null,
            customerInfo,
            isLoading: false,
          });
        } catch (error) {
          set({
            isInitialized: true, // Mark as initialized even on error to prevent retries
            error: error instanceof Error ? error.message : 'Initialization failed',
            isLoading: false,
          });
        }
      },

      checkSubscriptionStatus: async () => {
        set({ isLoading: true, error: null });

        try {
          const customerInfo = await RevenueCatService.getCustomerInfo();
          const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
          const plan = determinePlan(customerInfo);
          const expiration = customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate;

          set({
            isPremium,
            currentPlan: plan,
            expirationDate: expiration ? new Date(expiration) : null,
            customerInfo,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to check status',
            isLoading: false,
          });
        }
      },

      purchasePackage: async (pkg: PurchasesPackage) => {
        set({ isLoading: true, error: null });

        try {
          const result = await RevenueCatService.purchasePackage(pkg);

          if (result.success && result.customerInfo) {
            const plan = determinePlan(result.customerInfo);
            const expiration = result.customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate;

            set({
              isPremium: true,
              currentPlan: plan,
              expirationDate: expiration ? new Date(expiration) : null,
              customerInfo: result.customerInfo,
              isLoading: false,
            });
            return true;
          }

          if (result.error === 'cancelled') {
            set({ isLoading: false });
            return false;
          }

          set({
            error: result.error || 'Purchase failed',
            isLoading: false,
          });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Purchase failed',
            isLoading: false,
          });
          return false;
        }
      },

      restorePurchases: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await RevenueCatService.restorePurchases();

          if (result.success && result.customerInfo) {
            const plan = determinePlan(result.customerInfo);
            const expiration = result.customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate;

            set({
              isPremium: result.isPremium,
              currentPlan: plan,
              expirationDate: expiration ? new Date(expiration) : null,
              customerInfo: result.customerInfo,
              isLoading: false,
            });
            return result.isPremium;
          }

          set({
            error: result.error || 'No purchases to restore',
            isLoading: false,
          });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Restore failed',
            isLoading: false,
          });
          return false;
        }
      },

      identifyUser: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const customerInfo = await RevenueCatService.identifyUser(userId);
          const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
          const plan = determinePlan(customerInfo);
          const expiration = customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate;

          set({
            isPremium,
            currentPlan: plan,
            expirationDate: expiration ? new Date(expiration) : null,
            customerInfo,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to identify user',
            isLoading: false,
          });
        }
      },

      logOutUser: async () => {
        set({ isLoading: true, error: null });

        try {
          const customerInfo = await RevenueCatService.logOutUser();
          const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';

          set({
            isPremium,
            currentPlan: isPremium ? get().currentPlan : 'free',
            customerInfo,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to log out',
            isLoading: false,
          });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      reset: () => {
        set({
          isPremium: false,
          currentPlan: 'free',
          expirationDate: null,
          isLoading: false,
          error: null,
          customerInfo: null,
        });
      },
    }),
    {
      name: 'petpal-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremium: state.isPremium,
        currentPlan: state.currentPlan,
      }),
    }
  )
);

export default useSubscriptionStore;
