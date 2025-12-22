import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '../stores/notificationStore';

export function useNotificationInit() {
  const router = useRouter();
  const { initialize, isInitialized } = useNotificationStore();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    // Handle notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification interactions (when user taps on notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data) {
        switch (data.type) {
          case 'pet-reminder':
            if (data.petId) {
              router.push(`/pet/${data.petId}` as any);
            }
            break;
          case 'appointment':
            if (data.appointmentId) {
              router.push(`/appointment/${data.appointmentId}` as any);
            }
            break;
          case 'achievement':
            router.push('/(tabs)/home' as any);
            break;
          default:
            break;
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);
}

export default useNotificationInit;
