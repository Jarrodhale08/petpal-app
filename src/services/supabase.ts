/**
 * Supabase Client Configuration - Multi-Tenant Setup
 *
 * This file initializes the Supabase client with multi-tenant support.
 * All data operations are automatically filtered by APP_ID.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';

// ============================================================================
// CONFIGURATION - Loaded from environment variables
// ============================================================================

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Multi-tenant App ID - unique identifier for this app
export const APP_ID = process.env.EXPO_PUBLIC_APP_ID || 'petpal';

// ============================================================================
// LAZY CLIENT INITIALIZATION
// ============================================================================

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _supabase;
}

// For backwards compatibility - uses lazy getter
export const supabase: SupabaseClient = {
  get auth() { return getSupabase().auth; },
  get from() { return getSupabase().from.bind(getSupabase()); },
  get rpc() { return getSupabase().rpc.bind(getSupabase()); },
  get channel() { return getSupabase().channel.bind(getSupabase()); },
  get storage() { return getSupabase().storage; },
  get functions() { return getSupabase().functions; },
  get realtime() { return getSupabase().realtime; },
  get rest() { return getSupabase().rest; },
  get schema() { return getSupabase().schema.bind(getSupabase()); },
  removeChannel: (channel) => getSupabase().removeChannel(channel),
  removeAllChannels: () => getSupabase().removeAllChannels(),
  getChannels: () => getSupabase().getChannels(),
} as SupabaseClient;

// ============================================================================
// AUTO REFRESH MANAGEMENT
// ============================================================================

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

export function setupAutoRefresh(): void {
  if (appStateSubscription) return;

  appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      getSupabase().auth.startAutoRefresh();
    } else {
      getSupabase().auth.stopAutoRefresh();
    }
  });
}

export function cleanupAutoRefresh(): void {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_URL && SUPABASE_URL.length > 0 &&
         !!SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 0;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await getSupabase().auth.getUser();
  if (error) {
    return null;
  }
  return user;
}

export async function getCurrentSession() {
  const { data: { session }, error } = await getSupabase().auth.getSession();
  if (error) {
    return null;
  }
  return session;
}

// ============================================================================
// MULTI-TENANT HELPERS
// ============================================================================

/**
 * Initialize user context for this app
 * Call this after successful authentication
 */
export async function initializeAppContext(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  try {
    // Upsert user app context
    await getSupabase()
      .from('user_app_context')
      .upsert({
        user_id: user.id,
        app_id: APP_ID,
        last_accessed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,app_id',
      });
  } catch (error) {
    console.error('Failed to initialize app context:', error);
  }
}

/**
 * Get app-specific storage bucket name
 */
export function getAppBucket(bucketType: 'avatars' | 'uploads' | 'attachments'): string {
  return `${APP_ID}-${bucketType}`;
}

/**
 * Add app_id to a record for multi-tenant isolation
 */
export function withAppId<T extends Record<string, any>>(record: T): T & { app_id: string } {
  return { ...record, app_id: APP_ID };
}

/**
 * Add app_id and user_id to a record
 */
export async function withAppAndUserId<T extends Record<string, any>>(
  record: T
): Promise<(T & { app_id: string; user_id: string }) | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { ...record, app_id: APP_ID, user_id: user.id };
}

export default supabase;
