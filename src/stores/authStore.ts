/**
 * Auth Store - PetPal
 *
 * Zustand store for authentication state management with Supabase.
 * Handles login, signup, logout, password reset, and session management.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, setupAutoRefresh, cleanupAutoRefresh, isSupabaseConfigured, initializeAppContext } from '../services/supabase';

// ============================================================================
// TYPES
// ============================================================================

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithOAuth: (provider: 'google' | 'apple' | 'github') => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateProfile: (data: { displayName?: string; avatarUrl?: string }) => Promise<boolean>;
  clearError: () => void;
}

// ============================================================================
// STORE
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Initialize auth and set up listeners
      initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true, error: null });

        try {
          if (!isSupabaseConfigured()) {
            // Supabase not configured - running in demo mode
            set({ isInitialized: true, isLoading: false });
            return;
          }

          // Set up auto refresh
          setupAutoRefresh();

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            set({ error: error.message });
          } else {
            set({
              session,
              user: session?.user ?? null
            });
          }

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              set({
                session,
                user: session?.user ?? null
              });

              if (event === 'SIGNED_OUT') {
                cleanupAutoRefresh();
              }
            }
          );

          // Store subscription for cleanup (optional)
          // You might want to store this in a ref if needed

        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to initialize auth';
          set({ error: message });
        } finally {
          set({ isInitialized: true, isLoading: false });
        }
      },

      // Sign up with email and password
      signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata,
            },
          });

          if (error) {
            set({ error: error.message });
            return false;
          }

          // Check if email confirmation is required
          if (data.user && !data.session) {
            set({ error: 'Please check your email to confirm your account.' });
            return true; // Sign up successful, but needs confirmation
          }

          set({
            user: data.user,
            session: data.session
          });

          // Initialize app context for multi-tenant isolation
          if (data.session) {
            await initializeAppContext();
          }

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Sign up failed';
          set({ error: message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Sign in with email and password
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ error: error.message });
            return false;
          }

          set({
            user: data.user,
            session: data.session
          });

          // Initialize app context for multi-tenant isolation
          await initializeAppContext();

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Sign in failed';
          set({ error: message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Sign in with OAuth provider
      signInWithOAuth: async (provider: 'google' | 'apple' | 'github') => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              skipBrowserRedirect: true,
            },
          });

          if (error) {
            set({ error: error.message });
            return false;
          }

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'OAuth sign in failed';
          set({ error: message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase.auth.signOut();

          if (error) {
            set({ error: error.message });
          }

          cleanupAutoRefresh();
          set({ user: null, session: null });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Sign out failed';
          set({ error: message });
        } finally {
          set({ isLoading: false });
        }
      },

      // Reset password
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'yourapp://reset-password',
          });

          if (error) {
            set({ error: error.message });
            return false;
          }

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Password reset failed';
          set({ error: message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Update password
      updatePassword: async (newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) {
            set({ error: error.message });
            return false;
          }

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Password update failed';
          set({ error: message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Update user profile
      updateProfile: async (data: { displayName?: string; avatarUrl?: string }) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase.auth.updateUser({
            data: {
              display_name: data.displayName,
              avatar_url: data.avatarUrl,
            },
          });

          if (error) {
            set({ error: error.message });
            return false;
          }

          // Refresh user data
          const { data: { user } } = await supabase.auth.getUser();
          set({ user });

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Profile update failed';
          set({ error: message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist essential auth state
        // Session is managed by Supabase
      }),
    }
  )
);

export default useAuthStore;
