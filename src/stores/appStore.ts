import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'hamster' | 'other';
  breed?: string;
  birthDate?: string;
  weight?: number;
  photoUri?: string;
  color?: string;
  microchipId?: string;
  notes?: string;
  createdAt: string;
}

interface VetVisit {
  id: string;
  petId: string;
  date: string;
  vetName?: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  cost?: number;
  nextVisitDate?: string;
  createdAt: string;
}

interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  prescribedBy?: string;
  isActive: boolean;
  createdAt: string;
}

interface Reminder {
  id: string;
  petId: string;
  type: 'medication' | 'appointment' | 'grooming' | 'other';
  title: string;
  description?: string;
  dateTime: string;
  isCompleted: boolean;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
}

interface CareTip {
  id: string;
  species: Pet['species'];
  category: 'nutrition' | 'exercise' | 'health' | 'grooming' | 'behavior' | 'safety';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  
  pets: Pet[];
  vetVisits: VetVisit[];
  medications: Medication[];
  reminders: Reminder[];
  careTips: CareTip[];
  
  loading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  
  addVetVisit: (visit: Omit<VetVisit, 'id' | 'createdAt'>) => void;
  updateVetVisit: (id: string, updates: Partial<VetVisit>) => void;
  deleteVetVisit: (id: string) => void;
  
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt'>) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  
  loadCareTips: (species: Pet['species']) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const saveToSecureStore = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn(`Failed to save ${key} to SecureStore:`, error);
  }
};

const loadFromSecureStore = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn(`Failed to load ${key} from SecureStore:`, error);
    return null;
  }
};

const deleteFromSecureStore = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`Failed to delete ${key} from SecureStore:`, error);
  }
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const careTipsDatabase: CareTip[] = [
  {
    id: '1',
    species: 'dog',
    category: 'nutrition',
    title: 'Balanced Diet',
    content: 'Feed your dog high-quality dog food appropriate for their age, size, and activity level. Avoid feeding table scraps and toxic foods like chocolate, grapes, and onions.',
    priority: 'high'
  },
  {
    id: '2',
    species: 'dog',
    category: 'exercise',
    title: 'Daily Exercise',
    content: 'Dogs need regular exercise. Most breeds require at least 30-60 minutes of physical activity daily through walks, playtime, or running.',
    priority: 'high'
  },
  {
    id: '3',
    species: 'dog',
    category: 'health',
    title: 'Regular Vet Checkups',
    content: 'Schedule annual veterinary checkups and keep vaccinations up to date. Dental care is also important for overall health.',
    priority: 'high'
  },
  {
    id: '4',
    species: 'cat',
    category: 'nutrition',
    title: 'Protein-Rich Diet',
    content: 'Cats are obligate carnivores and need a protein-rich diet. Ensure they have access to fresh water at all times.',
    priority: 'high'
  },
  {
    id: '5',
    species: 'cat',
    category: 'grooming',
    title: 'Regular Brushing',
    content: 'Brush your cat regularly to reduce shedding and hairballs. Long-haired cats may need daily brushing.',
    priority: 'medium'
  },
  {
    id: '6',
    species: 'cat',
    category: 'health',
    title: 'Litter Box Maintenance',
    content: 'Keep the litter box clean by scooping daily and changing litter weekly. Multiple cats need multiple boxes.',
    priority: 'high'
  },
  {
    id: '7',
    species: 'bird',
    category: 'nutrition',
    title: 'Varied Diet',
    content: 'Provide a balanced diet of pellets, fresh vegetables, fruits, and occasional seeds. Avoid avocado, chocolate, and salt.',
    priority: 'high'
  },
  {
    id: '8',
    species: 'bird',
    category: 'safety',
    title: 'Cage Safety',
    content: 'Ensure the cage is spacious with appropriate bar spacing. Keep away from kitchen fumes, non-stick cookware, and open windows.',
    priority: 'high'
  },
  {
    id: '9',
    species: 'fish',
    category: 'health',
    title: 'Water Quality',
    content: 'Maintain proper water parameters (pH, temperature, ammonia, nitrite, nitrate). Perform regular water changes weekly.',
    priority: 'high'
  },
  {
    id: '10',
    species: 'fish',
    category: 'nutrition',
    title: 'Proper Feeding',
    content: 'Feed small amounts 1-2 times daily. Remove uneaten food after 5 minutes to prevent water contamination.',
    priority: 'medium'
  },
  {
    id: '11',
    species: 'rabbit',
    category: 'nutrition',
    title: 'Hay-Based Diet',
    content: 'Provide unlimited grass hay (timothy, orchard grass). Supplement with fresh vegetables and limited pellets.',
    priority: 'high'
  },
  {
    id: '12',
    species: 'rabbit',
    category: 'exercise',
    title: 'Daily Exercise',
    content: 'Rabbits need at least 3-4 hours of exercise outside their enclosure daily in a safe, rabbit-proofed area.',
    priority: 'high'
  },
  {
    id: '13',
    species: 'hamster',
    category: 'exercise',
    title: 'Wheel and Enrichment',
    content: 'Provide a solid-surface exercise wheel (8-12 inches) and toys for mental stimulation. Hamsters are very active.',
    priority: 'medium'
  },
  {
    id: '14',
    species: 'hamster',
    category: 'health',
    title: 'Bedding Safety',
    content: 'Use paper-based or aspen bedding. Avoid cedar and pine shavings which can cause respiratory issues.',
    priority: 'high'
  }
];

const initialState = {
  isAuthenticated: false,
  user: null,
  pets: [],
  vetVisits: [],
  medications: [],
  reminders: [],
  careTips: [],
  loading: false,
  error: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: async (user) => {
        if (user) {
          await saveToSecureStore('user_data', JSON.stringify(user));
        } else {
          await deleteFromSecureStore('user_data');
        }
        set({ user, isAuthenticated: !!user });
      },

      logout: async () => {
        await deleteFromSecureStore('auth_token');
        await deleteFromSecureStore('user_data');
        set(initialState);
      },

      restoreSession: async () => {
        const token = await loadFromSecureStore('auth_token');
        const userData = await loadFromSecureStore('user_data');
        if (token && userData) {
          try {
            set({ user: JSON.parse(userData), isAuthenticated: true });
          } catch (error) {
            console.warn('Failed to parse user data:', error);
            await deleteFromSecureStore('auth_token');
            await deleteFromSecureStore('user_data');
          }
        }
      },

      addPet: (pet) => {
        const newPet: Pet = {
          ...pet,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ pets: [...state.pets, newPet] }));
      },

      updatePet: (id, updates) => {
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === id ? { ...pet, ...updates } : pet
          ),
        }));
      },

      deletePet: (id) => {
        set((state) => ({
          pets: state.pets.filter((pet) => pet.id !== id),
          vetVisits: state.vetVisits.filter((visit) => visit.petId !== id),
          medications: state.medications.filter((med) => med.petId !== id),
          reminders: state.reminders.filter((reminder) => reminder.petId !== id),
        }));
      },

      addVetVisit: (visit) => {
        const newVisit: VetVisit = {
          ...visit,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ vetVisits: [...state.vetVisits, newVisit] }));
      },

      updateVetVisit: (id, updates) => {
        set((state) => ({
          vetVisits: state.vetVisits.map((visit) =>
            visit.id === id ? { ...visit, ...updates } : visit
          ),
        }));
      },

      deleteVetVisit: (id) => {
        set((state) => ({
          vetVisits: state.vetVisits.filter((visit) => visit.id !== id),
        }));
      },

      addMedication: (medication) => {
        const newMedication: Medication = {
          ...medication,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ medications: [...state.medications, newMedication] }));
      },

      updateMedication: (id, updates) => {
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id ? { ...med, ...updates } : med
          ),
        }));
      },

      deleteMedication: (id) => {
        set((state) => ({
          medications: state.medications.filter((med) => med.id !== id),
        }));
      },

      addReminder: (reminder) => {
        const newReminder: Reminder = {
          ...reminder,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ reminders: [...state.reminders, newReminder] }));
      },

      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, ...updates } : reminder
          ),
        }));
      },

      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        }));
      },

      completeReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, isCompleted: true } : reminder
          ),
        }));
      },

      loadCareTips: (species) => {
        const tips = careTipsDatabase.filter((tip) => tip.species === species);
        set({ careTips: tips });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'petpal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pets: state.pets,
        vetVisits: state.vetVisits,
        medications: state.medications,
        reminders: state.reminders,
      }),
    }
  )
);

export default useAppStore;
