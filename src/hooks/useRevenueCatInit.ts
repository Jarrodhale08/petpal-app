/**
 * useRevenueCatInit Hook
 * Initializes RevenueCat SDK and subscription store on app startup
 */

import { useEffect, useState } from 'react';
import { useSubscriptionStore } from '../stores/subscriptionStore';

export function useRevenueCatInit() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initialize, isInitialized } = useSubscriptionStore();

  useEffect(() => {
    const init = async () => {
      try {
        if (!isInitialized) {
          await initialize();
        }
        setIsReady(true);
      } catch (err) {
        console.error('RevenueCat init error:', err);
        setError(err instanceof Error ? err.message : 'Initialization failed');
        setIsReady(true); // Still mark as ready so app can function
      }
    };

    init();
  }, [initialize, isInitialized]);

  return { isReady, error };
}

export default useRevenueCatInit;
