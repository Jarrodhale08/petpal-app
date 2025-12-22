import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';

interface SettingsItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  requiresAuth?: boolean;
  showBadge?: boolean;
  badgeText?: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { isPremium } = useSubscriptionStore();
  const [refreshing, setRefreshing] = useState(false);

  const settingsItems: SettingsItem[] = [
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: 'person-outline',
      route: '/settings/profile',
      requiresAuth: true,
    },
    {
      id: 'pets',
      title: 'My Pets',
      icon: 'paw-outline',
      route: '/settings/pets',
      requiresAuth: true,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      route: '/settings/notifications',
    },
    {
      id: 'subscription',
      title: 'Subscription',
      icon: 'diamond-outline',
      route: '/subscription',
      showBadge: !isPremium,
      badgeText: 'Upgrade',
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-checkmark-outline',
      route: '/settings/privacy',
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      route: '/settings/support',
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle-outline',
      route: '/settings/about',
    },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleItemPress = useCallback((item: SettingsItem) => {
    if (item.requiresAuth && !user) {
      router.push('/auth/sign-in');
      return;
    }
    router.push(item.route as any);
  }, [user, router]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace('/(tabs)/home');
  }, [signOut, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#14B8A6']}
            tintColor="#14B8A6"
          />
        }
      >
        {user && (
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.email}</Text>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={14} color="#14B8A6" />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingsItem,
                index === 0 && styles.firstItem,
                index === settingsItems.length - 1 && styles.lastItem,
              ]}
              onPress={() => handleItemPress(item)}
              accessibilityLabel={item.title}
              accessibilityRole="button"
              accessibilityHint={`Navigate to ${item.title}`}
            >
              <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon} size={24} color="#6B7280" />
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
              </View>
              <View style={styles.itemRight}>
                {item.showBadge && item.badgeText && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badgeText}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {user && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.settingsItem, styles.firstItem, styles.lastItem, styles.signOutButton]}
              onPress={handleSignOut}
              accessibilityLabel="Sign Out"
              accessibilityRole="button"
            >
              <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                </View>
                <Text style={[styles.itemTitle, styles.signOutText]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {!user && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/auth/sign-in')}
              accessibilityLabel="Sign In"
              accessibilityRole="button"
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>PetPal v1.0.0</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#134E4A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14B8A6',
    marginLeft: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  firstItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F8FAFC',
    marginLeft: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#EF4444',
  },
  signInButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    minHeight: 52,
    justifyContent: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
});
