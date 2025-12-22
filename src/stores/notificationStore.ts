import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, getCurrentUser } from '../services/supabase';
import { fetchAll, create as dbCreate, update as dbUpdate, remove as dbRemove, upsert } from '../services/database';
import notificationService, { PetReminder } from '../services/notification.service';

// ============================================================================
// TYPES
// ============================================================================

interface NotificationSettings {
  pushEnabled: boolean;
  reminders: boolean;
  achievements: boolean;
  weeklyReport: boolean;
  marketing: boolean;
  appointmentReminders: boolean;
  appointmentReminderMinutes: number;
}

// Database record type for pet_reminders (snake_case)
interface PetReminderRecord {
  id: string;
  pet_id: string;
  pet_name: string;
  type: 'feeding' | 'walk' | 'medication' | 'grooming' | 'vet' | 'vaccination' | 'custom';
  title: string;
  body: string | null;
  hour: number;
  minute: number;
  days_of_week: number[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Database record type for user_settings
interface UserSettingsRecord {
  id: string;
  push_enabled: boolean;
  reminders_enabled: boolean;
  achievements_enabled: boolean;
  weekly_report_enabled: boolean;
  marketing_enabled: boolean;
  appointment_reminders_enabled: boolean;
  appointment_reminder_minutes: number;
}

interface NotificationState {
  settings: NotificationSettings;
  petReminders: PetReminder[];
  isInitialized: boolean;
  permissionGranted: boolean;
  lastSyncedAt: string | null;
  pendingChanges: boolean;

  // Actions
  initialize: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  addPetReminder: (reminder: Omit<PetReminder, 'id'>) => Promise<string | null>;
  updatePetReminder: (id: string, updates: Partial<PetReminder>) => Promise<boolean>;
  deletePetReminder: (id: string) => Promise<boolean>;
  togglePetReminder: (id: string) => Promise<void>;
  getPetReminders: (petId: string) => PetReminder[];
  scheduleAllReminders: () => Promise<void>;
  cancelAllReminders: () => Promise<void>;
  syncToServer: () => Promise<void>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  reminders: true,
  achievements: true,
  weeklyReport: false,
  marketing: false,
  appointmentReminders: true,
  appointmentReminderMinutes: 60,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function recordToReminder(record: PetReminderRecord): PetReminder {
  return {
    id: record.id,
    petId: record.pet_id,
    petName: record.pet_name,
    type: record.type,
    title: record.title,
    body: record.body || '',
    time: { hour: record.hour, minute: record.minute },
    daysOfWeek: record.days_of_week,
    enabled: record.enabled,
  };
}

function reminderToRecord(reminder: Partial<PetReminder>): Partial<PetReminderRecord> {
  const record: Partial<PetReminderRecord> = {};

  if (reminder.petId !== undefined) record.pet_id = reminder.petId;
  if (reminder.petName !== undefined) record.pet_name = reminder.petName;
  if (reminder.type !== undefined) record.type = reminder.type;
  if (reminder.title !== undefined) record.title = reminder.title;
  if (reminder.body !== undefined) record.body = reminder.body || null;
  if (reminder.time !== undefined) {
    record.hour = reminder.time.hour;
    record.minute = reminder.time.minute;
  }
  if (reminder.daysOfWeek !== undefined) record.days_of_week = reminder.daysOfWeek;
  if (reminder.enabled !== undefined) record.enabled = reminder.enabled;

  return record;
}

function settingsToRecord(settings: NotificationSettings): Partial<UserSettingsRecord> {
  return {
    push_enabled: settings.pushEnabled,
    reminders_enabled: settings.reminders,
    achievements_enabled: settings.achievements,
    weekly_report_enabled: settings.weeklyReport,
    marketing_enabled: settings.marketing,
    appointment_reminders_enabled: settings.appointmentReminders,
    appointment_reminder_minutes: settings.appointmentReminderMinutes,
  };
}

function recordToSettings(record: UserSettingsRecord): NotificationSettings {
  return {
    pushEnabled: record.push_enabled,
    reminders: record.reminders_enabled,
    achievements: record.achievements_enabled,
    weeklyReport: record.weekly_report_enabled,
    marketing: record.marketing_enabled,
    appointmentReminders: record.appointment_reminders_enabled,
    appointmentReminderMinutes: record.appointment_reminder_minutes,
  };
}

// ============================================================================
// STORE
// ============================================================================

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      petReminders: [],
      isInitialized: false,
      permissionGranted: false,
      lastSyncedAt: null,
      pendingChanges: false,

      initialize: async () => {
        try {
          await notificationService.initialize();
          const permissionGranted = await notificationService.requestPermissions();

          set({ permissionGranted });

          // Fetch from server if authenticated
          const user = await getCurrentUser();
          if (user && isSupabaseConfigured()) {
            // Fetch settings
            const { data: settingsData } = await fetchAll<UserSettingsRecord>('user_settings', {
              limit: 1,
            });

            if (settingsData && settingsData.length > 0) {
              const settings = recordToSettings(settingsData[0]);
              set({ settings });
            }

            // Fetch reminders
            const { data: remindersData } = await fetchAll<PetReminderRecord>('pet_reminders', {
              orderBy: { column: 'created_at', ascending: false },
            });

            if (remindersData) {
              const petReminders = remindersData.map(recordToReminder);
              set({ petReminders, lastSyncedAt: new Date().toISOString() });
            }
          }

          set({ isInitialized: true });

          // Re-schedule all enabled reminders
          if (permissionGranted && get().settings.pushEnabled) {
            await get().scheduleAllReminders();
          }
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
          set({ isInitialized: true, permissionGranted: false });
        }
      },

      updateSettings: async (newSettings) => {
        const currentSettings = get().settings;
        const updatedSettings = { ...currentSettings, ...newSettings };

        set({ settings: updatedSettings });

        // Sync to server
        const user = await getCurrentUser();
        if (user && isSupabaseConfigured()) {
          const record = settingsToRecord(updatedSettings);
          await upsert('user_settings', record, { onConflict: 'app_id,user_id' });
        }

        // Handle push notification state changes
        if (currentSettings.pushEnabled && !updatedSettings.pushEnabled) {
          await get().cancelAllReminders();
        }

        if (!currentSettings.pushEnabled && updatedSettings.pushEnabled) {
          await get().scheduleAllReminders();
        }
      },

      addPetReminder: async (reminderData) => {
        try {
          const user = await getCurrentUser();

          if (user && isSupabaseConfigured()) {
            const record = reminderToRecord(reminderData);
            const { data, error } = await dbCreate<PetReminderRecord>('pet_reminders', record);

            if (error) {
              console.error('Failed to create reminder on server:', error);
              return null;
            }

            if (data) {
              const newReminder = recordToReminder(data);
              set((state) => ({
                petReminders: [...state.petReminders, newReminder],
              }));

              if (get().settings.pushEnabled && get().settings.reminders && newReminder.enabled) {
                await notificationService.schedulePetReminder(newReminder);
              }

              return newReminder.id;
            }
          }

          // Offline mode
          const newReminder: PetReminder = {
            ...reminderData,
            id: `local_${Date.now()}`,
          };

          set((state) => ({
            petReminders: [...state.petReminders, newReminder],
            pendingChanges: true,
          }));

          if (get().settings.pushEnabled && get().settings.reminders && newReminder.enabled) {
            await notificationService.schedulePetReminder(newReminder);
          }

          return newReminder.id;
        } catch (error) {
          console.error('Error adding reminder:', error);
          return null;
        }
      },

      updatePetReminder: async (id, updates) => {
        try {
          const { petReminders, settings } = get();
          const existingReminder = petReminders.find(r => r.id === id);
          if (!existingReminder) return false;

          const updatedReminder = { ...existingReminder, ...updates };

          const user = await getCurrentUser();
          if (user && isSupabaseConfigured() && !id.startsWith('local_')) {
            const record = reminderToRecord(updates);
            const { error } = await dbUpdate<PetReminderRecord>('pet_reminders', id, record);

            if (error) {
              console.error('Failed to update reminder on server:', error);
              return false;
            }
          }

          set((state) => ({
            petReminders: state.petReminders.map((r) =>
              r.id === id ? updatedReminder : r
            ),
            pendingChanges: id.startsWith('local_') || !isSupabaseConfigured(),
          }));

          // Update scheduled notification
          if (settings.pushEnabled && settings.reminders) {
            if (updatedReminder.enabled) {
              await notificationService.schedulePetReminder(updatedReminder);
            } else {
              await notificationService.cancelPetReminder(id);
            }
          }

          return true;
        } catch (error) {
          console.error('Error updating reminder:', error);
          return false;
        }
      },

      deletePetReminder: async (id) => {
        try {
          await notificationService.cancelPetReminder(id);

          const user = await getCurrentUser();
          if (user && isSupabaseConfigured() && !id.startsWith('local_')) {
            const { error } = await dbRemove('pet_reminders', id);
            if (error) {
              console.error('Failed to delete reminder on server:', error);
              return false;
            }
          }

          set((state) => ({
            petReminders: state.petReminders.filter((r) => r.id !== id),
          }));

          return true;
        } catch (error) {
          console.error('Error deleting reminder:', error);
          return false;
        }
      },

      togglePetReminder: async (id) => {
        const reminder = get().petReminders.find((r) => r.id === id);
        if (reminder) {
          await get().updatePetReminder(id, { enabled: !reminder.enabled });
        }
      },

      getPetReminders: (petId) => {
        return get().petReminders.filter((r) => r.petId === petId);
      },

      scheduleAllReminders: async () => {
        const { petReminders, settings } = get();

        if (!settings.pushEnabled || !settings.reminders) {
          return;
        }

        for (const reminder of petReminders) {
          if (reminder.enabled) {
            await notificationService.schedulePetReminder(reminder);
          }
        }
      },

      cancelAllReminders: async () => {
        await notificationService.cancelAllNotifications();
      },

      syncToServer: async () => {
        const { petReminders, settings, pendingChanges } = get();

        if (!pendingChanges) return;

        const user = await getCurrentUser();
        if (!user || !isSupabaseConfigured()) return;

        try {
          // Sync settings
          const settingsRecord = settingsToRecord(settings);
          await upsert('user_settings', settingsRecord, { onConflict: 'app_id,user_id' });

          // Sync local reminders
          const localReminders = petReminders.filter((r) => r.id.startsWith('local_'));

          for (const reminder of localReminders) {
            const record = reminderToRecord(reminder);
            const { data, error } = await dbCreate<PetReminderRecord>('pet_reminders', record);

            if (!error && data) {
              const serverReminder = recordToReminder(data);
              set((state) => ({
                petReminders: state.petReminders.map((r) =>
                  r.id === reminder.id ? serverReminder : r
                ),
              }));
            }
          }

          set({
            pendingChanges: false,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error syncing notifications:', error);
        }
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        petReminders: state.petReminders,
        lastSyncedAt: state.lastSyncedAt,
        pendingChanges: state.pendingChanges,
      }),
    }
  )
);

export default useNotificationStore;
