import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is required');
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PetProfile {
  id: string;
  userId: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
  breed?: string;
  birthDate?: string;
  weight?: number;
  weightUnit?: 'kg' | 'lb';
  gender?: 'male' | 'female';
  color?: string;
  microchipId?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: 'vet_visit' | 'vaccination' | 'medication' | 'surgery' | 'injury' | 'illness' | 'checkup' | 'other';
  title: string;
  description?: string;
  date: string;
  veterinarian?: string;
  clinic?: string;
  cost?: number;
  attachments?: string[];
  nextAppointment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  reminderEnabled: boolean;
  reminderTimes?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  petId: string;
  type: 'medication' | 'appointment' | 'grooming' | 'feeding' | 'exercise' | 'custom';
  title: string;
  description?: string;
  dateTime: string;
  repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareTip {
  id: string;
  species: string;
  category: 'nutrition' | 'exercise' | 'grooming' | 'health' | 'training' | 'behavior' | 'safety' | 'general';
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to get auth token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          try {
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('refresh_token');
          } catch (e) {
            console.warn('Failed to clear auth tokens:', e);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const message = axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || 'An unexpected error occurred';
      const status = axiosError.response?.status;
      throw new Error(`API Error (${status || 'unknown'}): ${message}`);
    } else if (error instanceof Error) {
      throw new Error(`Request failed: ${error.message}`);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  async getAll<T>(endpoint: string): Promise<T[]> {
    try {
      const response = await this.client.get<ApiResponse<T[]>>(endpoint);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getById<T>(endpoint: string, id: string): Promise<T> {
    try {
      const response = await this.client.get<ApiResponse<T>>(`${endpoint}/${id}`);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async create<T>(endpoint: string, data: Partial<T>): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(endpoint, data);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update<T>(endpoint: string, id: string, data: Partial<T>): Promise<T> {
    try {
      const response = await this.client.put<ApiResponse<T>>(`${endpoint}/${id}`, data);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(endpoint: string, id: string): Promise<void> {
    try {
      await this.client.delete(`${endpoint}/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const response = await this.client.post<ApiResponse<AuthTokens>>('/auth/login', credentials);
      const tokens = response.data.data;
      await SecureStore.setItemAsync('auth_token', tokens.accessToken);
      await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
      return tokens;
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(data: RegisterData): Promise<AuthTokens> {
    try {
      const response = await this.client.post<ApiResponse<AuthTokens>>('/auth/register', data);
      const tokens = response.data.data;
      await SecureStore.setItemAsync('auth_token', tokens.accessToken);
      await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
      return tokens;
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      try {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
      } catch (e) {
        console.warn('Failed to clear local tokens:', e);
      }
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await this.client.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
      const tokens = response.data.data;
      await SecureStore.setItemAsync('auth_token', tokens.accessToken);
      await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
      return tokens;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await this.client.get<ApiResponse<UserProfile>>('/users/profile');
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.client.put<ApiResponse<UserProfile>>('/users/profile', data);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPets(): Promise<PetProfile[]> {
    return this.getAll<PetProfile>('/pets');
  }

  async getPetById(id: string): Promise<PetProfile> {
    return this.getById<PetProfile>('/pets', id);
  }

  async createPet(data: Partial<PetProfile>): Promise<PetProfile> {
    return this.create<PetProfile>('/pets', data);
  }

  async updatePet(id: string, data: Partial<PetProfile>): Promise<PetProfile> {
    return this.update<PetProfile>('/pets', id, data);
  }

  async deletePet(id: string): Promise<void> {
    return this.delete('/pets', id);
  }

  async getHealthRecords(petId: string): Promise<HealthRecord[]> {
    try {
      const response = await this.client.get<ApiResponse<HealthRecord[]>>(`/pets/${petId}/health-records`);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createHealthRecord(petId: string, data: Partial<HealthRecord>): Promise<HealthRecord> {
    try {
      const response = await this.client.post<ApiResponse<HealthRecord>>(`/pets/${petId}/health-records`, data);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateHealthRecord(petId: string, id: string, data: Partial<HealthRecord>): Promise<HealthRecord> {
    try {
      const response = await this.client.put<ApiResponse<HealthRecord>>(`/pets/${petId}/health-records/${id}`, data);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteHealthRecord(petId: string, id: string): Promise<void> {
    try {
      await this.client.delete(`/pets/${petId}/health-records/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMedications(petId: string): Promise<Medication[]> {
    try {
      const response = await this.client.get<ApiResponse<Medication[]>>(`/pets/${petId}/medications`);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createMedication(petId: string, data: Partial<Medication>): Promise<Medication> {
    try {
      const response = await this.client.post<ApiResponse<Medication>>(`/pets/${petId}/medications`, data);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateMedication(petId: string, id: string, data: Partial<Medication>): Promise<Medication> {
    try {
      const response = await this.client.put<ApiResponse<Medication>>(`/pets/${petId}/medications/${id}`, data);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteMedication(petId: string, id: string): Promise<void> {
    try {
      await this.client.delete(`/pets/${petId}/medications/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getReminders(): Promise<Reminder[]> {
    return this.getAll<Reminder>('/reminders');
  }

  async createReminder(data: Partial<Reminder>): Promise<Reminder> {
    return this.create<Reminder>('/reminders', data);
  }

  async updateReminder(id: string, data: Partial<Reminder>): Promise<Reminder> {
    return this.update<Reminder>('/reminders', id, data);
  }

  async deleteReminder(id: string): Promise<void> {
    return this.delete('/reminders', id);
  }

  async completeReminder(id: string): Promise<Reminder> {
    try {
      const response = await this.client.post<ApiResponse<Reminder>>(`/reminders/${id}/complete`);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCareTips(species?: string, category?: string): Promise<CareTip[]> {
    try {
      const params: Record<string, string> = {};
      if (species) params.species = species;
      if (category) params.category = category;
      const response = await this.client.get<ApiResponse<CareTip[]>>('/care-tips', { params });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadImage(file: { uri: string; type: string; name: string }): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file as any);
      const response = await this.client.post<ApiResponse<{ url: string }>>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

const apiService = new ApiService();
export default apiService;
