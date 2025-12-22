import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, getCurrentUser } from '../services/supabase';
import { fetchAll, create as dbCreate, update as dbUpdate, remove as dbRemove } from '../services/database';

// ============================================================================
// TYPES
// ============================================================================

export interface Appointment {
  id: string;
  petId: string;
  type: 'checkup' | 'vaccination' | 'grooming' | 'surgery' | 'emergency' | 'other';
  title: string;
  date: string;
  time?: string;
  veterinarian?: string;
  clinic?: string;
  location?: string;
  notes?: string;
  reminderEnabled?: boolean;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Database record type (snake_case)
interface AppointmentRecord {
  id: string;
  pet_id: string;
  type: 'checkup' | 'vaccination' | 'grooming' | 'surgery' | 'emergency' | 'other';
  title: string;
  date: string;
  time: string | null;
  veterinarian: string | null;
  clinic: string | null;
  location: string | null;
  notes: string | null;
  reminder_enabled: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  pendingChanges: boolean;

  // Actions
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  getAppointmentById: (id: string) => Appointment | undefined;
  getAppointmentsByPetId: (petId: string) => Appointment[];
  getUpcomingAppointments: () => Appointment[];
  markAsCompleted: (id: string) => Promise<boolean>;
  syncToServer: () => Promise<void>;
  clearAppointments: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Convert database record (snake_case) to app model (camelCase)
function recordToAppointment(record: AppointmentRecord): Appointment {
  return {
    id: record.id,
    petId: record.pet_id,
    type: record.type,
    title: record.title,
    date: record.date,
    time: record.time || undefined,
    veterinarian: record.veterinarian || undefined,
    clinic: record.clinic || undefined,
    location: record.location || undefined,
    notes: record.notes || undefined,
    reminderEnabled: record.reminder_enabled,
    isCompleted: record.is_completed,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

// Convert app model (camelCase) to database record (snake_case)
function appointmentToRecord(apt: Partial<Appointment>): Partial<AppointmentRecord> {
  const record: Partial<AppointmentRecord> = {};

  if (apt.petId !== undefined) record.pet_id = apt.petId;
  if (apt.type !== undefined) record.type = apt.type;
  if (apt.title !== undefined) record.title = apt.title;
  if (apt.date !== undefined) record.date = apt.date;
  if (apt.time !== undefined) record.time = apt.time || null;
  if (apt.veterinarian !== undefined) record.veterinarian = apt.veterinarian || null;
  if (apt.clinic !== undefined) record.clinic = apt.clinic || null;
  if (apt.location !== undefined) record.location = apt.location || null;
  if (apt.notes !== undefined) record.notes = apt.notes || null;
  if (apt.reminderEnabled !== undefined) record.reminder_enabled = apt.reminderEnabled;
  if (apt.isCompleted !== undefined) record.is_completed = apt.isCompleted;

  return record;
}

// ============================================================================
// STORE
// ============================================================================

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      loading: false,
      error: null,
      lastSyncedAt: null,
      pendingChanges: false,

      fetchAppointments: async () => {
        set({ loading: true, error: null });

        try {
          const user = await getCurrentUser();

          // If user is authenticated and Supabase is configured, fetch from server
          if (user && isSupabaseConfigured()) {
            const { data, error } = await fetchAll<AppointmentRecord>('appointments', {
              orderBy: { column: 'date', ascending: true },
            });

            if (error) {
              console.error('Failed to fetch appointments from server:', error);
              set({ loading: false });
              return;
            }

            if (data) {
              const appointments = data.map(recordToAppointment);
              set({
                appointments,
                loading: false,
                lastSyncedAt: new Date().toISOString(),
                pendingChanges: false,
              });
              return;
            }
          }

          set({ loading: false });
        } catch (error) {
          console.error('Error fetching appointments:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to load appointments',
            loading: false,
          });
        }
      },

      addAppointment: async (appointmentData) => {
        set({ loading: true, error: null });

        try {
          const user = await getCurrentUser();

          if (user && isSupabaseConfigured()) {
            const record = appointmentToRecord({
              ...appointmentData,
              isCompleted: false,
            });
            const { data, error } = await dbCreate<AppointmentRecord>('appointments', record);

            if (error) {
              console.error('Failed to create appointment on server:', error);
              set({ loading: false, error: 'Failed to save appointment' });
              return null;
            }

            if (data) {
              const newAppointment = recordToAppointment(data);
              set((state) => ({
                appointments: [...state.appointments, newAppointment].sort(
                  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                ),
                loading: false,
                lastSyncedAt: new Date().toISOString(),
              }));
              return newAppointment.id;
            }
          }

          // Offline mode
          const newAppointment: Appointment = {
            ...appointmentData,
            id: `local_${Date.now()}`,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            appointments: [...state.appointments, newAppointment].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            ),
            loading: false,
            pendingChanges: true,
          }));

          return newAppointment.id;
        } catch (error) {
          console.error('Error adding appointment:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to add appointment',
            loading: false,
          });
          return null;
        }
      },

      updateAppointment: async (id, data) => {
        set({ loading: true, error: null });

        try {
          const user = await getCurrentUser();

          if (user && isSupabaseConfigured() && !id.startsWith('local_')) {
            const record = appointmentToRecord(data);
            const { error } = await dbUpdate<AppointmentRecord>('appointments', id, record);

            if (error) {
              console.error('Failed to update appointment on server:', error);
              set({ loading: false, error: 'Failed to update appointment' });
              return false;
            }
          }

          set((state) => ({
            appointments: state.appointments.map((apt) =>
              apt.id === id
                ? { ...apt, ...data, updatedAt: new Date().toISOString() }
                : apt
            ),
            loading: false,
            pendingChanges: id.startsWith('local_') || !isSupabaseConfigured(),
          }));

          return true;
        } catch (error) {
          console.error('Error updating appointment:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to update appointment',
            loading: false,
          });
          return false;
        }
      },

      deleteAppointment: async (id) => {
        set({ loading: true, error: null });

        try {
          const user = await getCurrentUser();

          if (user && isSupabaseConfigured() && !id.startsWith('local_')) {
            const { error } = await dbRemove('appointments', id);

            if (error) {
              console.error('Failed to delete appointment on server:', error);
              set({ loading: false, error: 'Failed to delete appointment' });
              return false;
            }
          }

          set((state) => ({
            appointments: state.appointments.filter((apt) => apt.id !== id),
            loading: false,
          }));

          return true;
        } catch (error) {
          console.error('Error deleting appointment:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to delete appointment',
            loading: false,
          });
          return false;
        }
      },

      getAppointmentById: (id) => {
        return get().appointments.find((apt) => apt.id === id);
      },

      getAppointmentsByPetId: (petId) => {
        return get().appointments.filter((apt) => apt.petId === petId);
      },

      getUpcomingAppointments: () => {
        const now = new Date();
        return get()
          .appointments.filter((apt) => new Date(apt.date) >= now && !apt.isCompleted)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },

      markAsCompleted: async (id) => {
        return get().updateAppointment(id, { isCompleted: true });
      },

      syncToServer: async () => {
        const { appointments, pendingChanges } = get();

        if (!pendingChanges) return;

        const user = await getCurrentUser();
        if (!user || !isSupabaseConfigured()) return;

        set({ loading: true });

        try {
          const localAppointments = appointments.filter((apt) => apt.id.startsWith('local_'));

          for (const apt of localAppointments) {
            const record = appointmentToRecord(apt);
            const { data, error } = await dbCreate<AppointmentRecord>('appointments', record);

            if (!error && data) {
              const serverAppointment = recordToAppointment(data);
              set((state) => ({
                appointments: state.appointments.map((a) =>
                  a.id === apt.id ? serverAppointment : a
                ),
              }));
            }
          }

          set({
            loading: false,
            pendingChanges: false,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error syncing appointments:', error);
          set({ loading: false });
        }
      },

      clearAppointments: () => {
        set({ appointments: [], loading: false, error: null, pendingChanges: false });
      },
    }),
    {
      name: 'appointment-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        appointments: state.appointments,
        lastSyncedAt: state.lastSyncedAt,
        pendingChanges: state.pendingChanges,
      }),
    }
  )
);

export default useAppointmentStore;
