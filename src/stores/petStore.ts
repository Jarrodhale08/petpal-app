import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, getCurrentUser } from '../services/supabase';
import { fetchAll, create as dbCreate, update as dbUpdate, remove as dbRemove } from '../services/database';

// ============================================================================
// TYPES
// ============================================================================

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  imageUrl?: string;
  gender?: 'male' | 'female';
  color?: string;
  microchipId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Database record type (snake_case)
interface PetRecord {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  image_url: string | null;
  gender: 'male' | 'female' | null;
  color: string | null;
  microchip_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PetState {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  pendingChanges: boolean;

  // Actions
  fetchPets: () => Promise<void>;
  addPet: (pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  updatePet: (id: string, data: Partial<Pet>) => Promise<boolean>;
  deletePet: (id: string) => Promise<boolean>;
  getPetById: (id: string) => Pet | undefined;
  syncToServer: () => Promise<void>;
  clearPets: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Convert database record (snake_case) to app model (camelCase)
function recordToPet(record: PetRecord): Pet {
  return {
    id: record.id,
    name: record.name,
    species: record.species,
    breed: record.breed || '',
    age: record.age || 0,
    weight: record.weight || 0,
    imageUrl: record.image_url || undefined,
    gender: record.gender || undefined,
    color: record.color || undefined,
    microchipId: record.microchip_id || undefined,
    notes: record.notes || undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

// Convert app model (camelCase) to database record (snake_case)
function petToRecord(pet: Partial<Pet>): Partial<PetRecord> {
  const record: Partial<PetRecord> = {};

  if (pet.name !== undefined) record.name = pet.name;
  if (pet.species !== undefined) record.species = pet.species;
  if (pet.breed !== undefined) record.breed = pet.breed || null;
  if (pet.age !== undefined) record.age = pet.age;
  if (pet.weight !== undefined) record.weight = pet.weight;
  if (pet.imageUrl !== undefined) record.image_url = pet.imageUrl || null;
  if (pet.gender !== undefined) record.gender = pet.gender || null;
  if (pet.color !== undefined) record.color = pet.color || null;
  if (pet.microchipId !== undefined) record.microchip_id = pet.microchipId || null;
  if (pet.notes !== undefined) record.notes = pet.notes || null;

  return record;
}

// ============================================================================
// STORE
// ============================================================================

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pets: [],
      loading: false,
      error: null,
      lastSyncedAt: null,
      pendingChanges: false,

      fetchPets: async () => {
        set({ loading: true, error: null });

        try {
          const user = await getCurrentUser();

          // If user is authenticated and Supabase is configured, fetch from server
          if (user && isSupabaseConfigured()) {
            const { data, error } = await fetchAll<PetRecord>('pets', {
              orderBy: { column: 'created_at', ascending: false },
            });

            if (error) {
              console.error('Failed to fetch pets from server:', error);
              // Fall back to local data
              set({ loading: false });
              return;
            }

            if (data) {
              const pets = data.map(recordToPet);
              set({
                pets,
                loading: false,
                lastSyncedAt: new Date().toISOString(),
                pendingChanges: false,
              });
              return;
            }
          }

          // Not authenticated or no Supabase - use local data
          set({ loading: false });
        } catch (error) {
          console.error('Error fetching pets:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to load pets',
            loading: false,
          });
        }
      },

      addPet: async (petData) => {
        set({ loading: true, error: null });

        try {
          const user = await getCurrentUser();

          // If authenticated and Supabase configured, save to server
          if (user && isSupabaseConfigured()) {
            const record = petToRecord(petData);
            const { data, error } = await dbCreate<PetRecord>('pets', record);

            if (error) {
              console.error('Failed to create pet on server:', error);
              set({ loading: false, error: 'Failed to save pet' });
              return null;
            }

            if (data) {
              const newPet = recordToPet(data);
              set((state) => ({
                pets: [newPet, ...state.pets],
                loading: false,
                lastSyncedAt: new Date().toISOString(),
              }));
              return newPet.id;
            }
          }

          // Offline mode - save locally
          const newPet: Pet = {
            ...petData,
            id: `local_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            pets: [newPet, ...state.pets],
            loading: false,
            pendingChanges: true,
          }));

          return newPet.id;
        } catch (error) {
          console.error('Error adding pet:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to add pet',
            loading: false,
          });
          return null;
        }
      },

      updatePet: async (id, data) => {
        set({ loading: true, error: null });

        try {
          const user = await getCurrentUser();

          // If authenticated and not a local record, update on server
          if (user && isSupabaseConfigured() && !id.startsWith('local_')) {
            const record = petToRecord(data);
            const { error } = await dbUpdate<PetRecord>('pets', id, record);

            if (error) {
              console.error('Failed to update pet on server:', error);
              set({ loading: false, error: 'Failed to update pet' });
              return false;
            }
          }

          // Update local state
          set((state) => ({
            pets: state.pets.map((pet) =>
              pet.id === id
                ? { ...pet, ...data, updatedAt: new Date().toISOString() }
                : pet
            ),
            loading: false,
            pendingChanges: id.startsWith('local_') || !isSupabaseConfigured(),
          }));

          return true;
        } catch (error) {
          console.error('Error updating pet:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to update pet',
            loading: false,
          });
          return false;
        }
      },

      deletePet: async (id) => {
        set({ loading: true, error: null });

        try {
          const user = await getCurrentUser();

          // If authenticated and not a local record, delete on server
          if (user && isSupabaseConfigured() && !id.startsWith('local_')) {
            const { error } = await dbRemove('pets', id);

            if (error) {
              console.error('Failed to delete pet on server:', error);
              set({ loading: false, error: 'Failed to delete pet' });
              return false;
            }
          }

          // Remove from local state
          set((state) => ({
            pets: state.pets.filter((pet) => pet.id !== id),
            loading: false,
          }));

          return true;
        } catch (error) {
          console.error('Error deleting pet:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to delete pet',
            loading: false,
          });
          return false;
        }
      },

      getPetById: (id) => {
        return get().pets.find((pet) => pet.id === id);
      },

      syncToServer: async () => {
        const { pets, pendingChanges } = get();

        if (!pendingChanges) return;

        const user = await getCurrentUser();
        if (!user || !isSupabaseConfigured()) return;

        set({ loading: true });

        try {
          // Find local-only pets and sync them
          const localPets = pets.filter((pet) => pet.id.startsWith('local_'));

          for (const pet of localPets) {
            const record = petToRecord(pet);
            const { data, error } = await dbCreate<PetRecord>('pets', record);

            if (!error && data) {
              // Replace local pet with server pet
              const serverPet = recordToPet(data);
              set((state) => ({
                pets: state.pets.map((p) =>
                  p.id === pet.id ? serverPet : p
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
          console.error('Error syncing pets:', error);
          set({ loading: false });
        }
      },

      clearPets: () => {
        set({ pets: [], loading: false, error: null, pendingChanges: false });
      },
    }),
    {
      name: 'pet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pets: state.pets,
        lastSyncedAt: state.lastSyncedAt,
        pendingChanges: state.pendingChanges,
      }),
    }
  )
);

export default usePetStore;
