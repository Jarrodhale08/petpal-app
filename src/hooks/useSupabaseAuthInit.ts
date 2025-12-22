/**
 * useSupabaseAuthInit Hook
 *
 * Initializes Supabase auth on app startup.
 * Use this in your root _layout.tsx to ensure auth is ready before rendering.
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { isSupabaseConfigured } from '../services/supabase';

export function useSupabaseAuthInit() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          console.warn('[Auth] Supabase not configured - auth features disabled');
          setIsReady(true);
          return;
        }

        if (!isInitialized) {
          await initialize();
        }
        setIsReady(true);
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Auth initialization failed');
        setIsReady(true); // Still mark as ready so app can function
      }
    };

    init();
  }, [initialize, isInitialized]);

  return { isReady, error, isConfigured: isSupabaseConfigured() };
}

export default useSupabaseAuthInit;
