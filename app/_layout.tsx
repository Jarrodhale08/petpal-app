import React, { useEffect, useState } from "react";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link, useSegments, useRouter, useRootNavigationState } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSubscriptionStore } from "../src/stores/subscriptionStore";
import { useNotificationInit } from "../src/hooks/useNotificationInit";

import "../global.css";

const ONBOARDING_COMPLETE_KEY = 'petpal_onboarding_complete';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      onError: (error) => {
        if ("message" in error) {
          console.error(error.message);
        }
      },
    },
  },
});

interface DrawerLinkProps {
  href: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const DrawerLink = ({ href, label, icon, onPress }: DrawerLinkProps) => (
  <Link href={href as any} onPress={onPress} asChild>
    <TouchableOpacity style={styles.drawerItem}>
      <Ionicons name={icon} size={24} color="#14B8A6" style={styles.drawerIcon} />
      <Text style={styles.drawerLabel}>{label}</Text>
    </TouchableOpacity>
  </Link>
);

const OnboardingCheck = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { initialize, isPremium } = useSubscriptionStore();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (!navigationState?.key || isChecking) return;

    if (shouldShowOnboarding) {
      router.replace('/onboarding');
    }
  }, [navigationState?.key, isChecking, shouldShowOnboarding]);

  const checkOnboardingStatus = async () => {
    try {
      // Initialize subscription store
      await initialize();

      // Check if onboarding was completed
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);

      // If user is premium, skip onboarding
      const { isPremium: currentPremiumStatus } = useSubscriptionStore.getState();
      if (currentPremiumStatus) {
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        setShouldShowOnboarding(false);
      } else if (onboardingComplete !== 'true') {
        setShouldShowOnboarding(true);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.splashContent}>
          <View style={styles.splashIconContainer}>
            <Ionicons name="paw" size={64} color="#14B8A6" />
          </View>
          <Text style={styles.splashTitle}>PetPal</Text>
          <ActivityIndicator size="large" color="#14B8A6" style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const RootLayout = () => {
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1] || "Dashboard";
  const drawerTitle = currentScreen === "(tabs)" ? "Dashboard" :
    currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1);

  // Initialize push notifications
  useNotificationInit();

  return (
    <QueryClientProvider client={client}>
      <OnboardingCheck>
      <Drawer
        drawerContent={(props) => {
          return (
            <DrawerContentScrollView {...props} style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <Ionicons name="apps" size={40} color="#14B8A6" />
                <Text style={styles.appTitle}>PetPal</Text>
              </View>

              <View style={styles.drawerItems}>
                <DrawerLink
                  href="/(tabs)/index"
                  label="Home"
                  icon="home"
                  onPress={() => props.navigation.closeDrawer()}
                />
                <DrawerLink
                  href="/(tabs)/profile"
                  label="Profile"
                  icon="person"
                  onPress={() => props.navigation.closeDrawer()}
                />
                <DrawerLink
                  href="/(tabs)/settings"
                  label="Settings"
                  icon="settings"
                  onPress={() => props.navigation.closeDrawer()}
                />
              </View>
            </DrawerContentScrollView>
          );
        }}
        screenOptions={{
          title: drawerTitle,
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: '600',
          },
          drawerPosition: 'right',
          headerLeft: () => null,
        }}
      />
      </OnboardingCheck>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 8,
  },
  drawerItems: {
    paddingHorizontal: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  drawerIcon: {
    marginRight: 16,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CBD5E1',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F8FAFC',
  },
});

export default RootLayout;
