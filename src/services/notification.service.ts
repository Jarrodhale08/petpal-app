import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PetReminder {
  id: string;
  petId: string;
  petName: string;
  type: 'feeding' | 'walk' | 'medication' | 'grooming' | 'vet' | 'vaccination' | 'custom';
  title: string;
  body: string;
  time: { hour: number; minute: number };
  daysOfWeek: number[]; // 1-7 (Sunday-Saturday)
  enabled: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    await this.setupNotificationChannels();
  }

  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    return true;
  }

  async getExpoPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      this.expoPushToken = token.data;
      return this.expoPushToken;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  private async setupNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });

      await Notifications.setNotificationChannelAsync('pet-reminders', {
        name: 'Pet Reminders',
        description: 'Daily reminders for pet care activities',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'Appointments',
        description: 'Vet appointment reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievements',
        description: 'Pet care achievements and milestones',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }

  async schedulePetReminder(reminder: PetReminder): Promise<string[]> {
    const notificationIds: string[] = [];

    // Cancel existing notifications for this reminder
    await this.cancelPetReminder(reminder.id);

    if (!reminder.enabled || reminder.daysOfWeek.length === 0) {
      return notificationIds;
    }

    // Schedule notification for each selected day
    for (const dayOfWeek of reminder.daysOfWeek) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🐾 ${reminder.title}`,
          body: reminder.body,
          data: {
            type: 'pet-reminder',
            reminderId: reminder.id,
            petId: reminder.petId,
            reminderType: reminder.type,
          },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: dayOfWeek,
          hour: reminder.time.hour,
          minute: reminder.time.minute,
          channelId: Platform.OS === 'android' ? 'pet-reminders' : undefined,
        },
      });

      notificationIds.push(notificationId);
    }

    return notificationIds;
  }

  async cancelPetReminder(reminderId: string): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.reminderId === reminderId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  async scheduleAppointmentReminder(
    appointmentId: string,
    petName: string,
    appointmentType: string,
    appointmentDate: Date,
    reminderMinutesBefore: number = 60
  ): Promise<string | null> {
    const reminderDate = new Date(appointmentDate.getTime() - reminderMinutesBefore * 60 * 1000);

    if (reminderDate <= new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📅 Upcoming ${appointmentType}`,
        body: `${petName}'s ${appointmentType.toLowerCase()} appointment is in ${reminderMinutesBefore} minutes`,
        data: {
          type: 'appointment',
          appointmentId,
          petName,
        },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
        channelId: Platform.OS === 'android' ? 'appointments' : undefined,
      },
    });

    return notificationId;
  }

  async cancelAppointmentReminder(appointmentId: string): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.appointmentId === appointmentId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null,
    });
  }

  async sendAchievementNotification(petName: string, achievement: string): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏆 Achievement Unlocked!',
        body: `${petName} ${achievement}`,
        data: {
          type: 'achievement',
          petName,
          achievement,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: Platform.OS === 'android' ? 'achievements' : undefined,
      },
    });
  }

  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;
