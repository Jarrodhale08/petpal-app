import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePetStore } from '../../src/stores/petStore';
import { useAppointmentStore } from '../../src/stores/appointmentStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  imageUrl?: string;
}

interface Appointment {
  id: string;
  petId: string;
  type: string;
  date: Date;
  veterinarian?: string;
  location?: string;
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const { pets, fetchPets } = usePetStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const { isPremium } = useSubscriptionStore();

  const handlePremiumAction = useCallback((route: string, requiresPremium: boolean) => {
    if (requiresPremium && !isPremium) {
      router.push('/subscription');
      return;
    }
    router.push(route as any);
  }, [isPremium, router]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      await Promise.all([fetchPets(), fetchAppointments()]);
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchPets, fetchAppointments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const getUpcomingAppointments = useCallback(() => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [appointments]);

  const handlePetPress = useCallback((petId: string) => {
    router.push(`/pet/${petId}`);
  }, [router]);

  const handleAppointmentPress = useCallback((appointmentId: string) => {
    router.push(`/appointment/${appointmentId}`);
  }, [router]);

  const handleAddPet = useCallback(() => {
    router.push('/pet/add');
  }, [router]);

  const handleAddAppointment = useCallback(() => {
    router.push('/appointment/add');
  }, [router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setLoading(true);
              loadData();
            }}
            accessibilityLabel="Retry loading data"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const upcomingAppointments = getUpcomingAppointments();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#14B8A6']}
            tintColor="#14B8A6"
          />
        }
      >
        <Text style={styles.welcomeText}>Welcome to PetPal</Text>
        <Text style={styles.subtitle}>Your pet care companion</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Pets</Text>
            <TouchableOpacity 
              onPress={handleAddPet}
              style={styles.addButton}
              accessibilityLabel="Add new pet"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={28} color="#14B8A6" />
            </TouchableOpacity>
          </View>

          {pets.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Ionicons name="paw" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No pets yet</Text>
              <Text style={styles.emptyStateText}>Add your first pet to get started</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={handleAddPet}
                accessibilityLabel="Add your first pet"
                accessibilityRole="button"
              >
                <Text style={styles.emptyStateButtonText}>Add Pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.petGrid}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petCard}
                  onPress={() => handlePetPress(pet.id)}
                  accessibilityLabel={`View details for ${pet.name}`}
                  accessibilityRole="button"
                >
                  <View style={styles.petIconContainer}>
                    <Ionicons 
                      name={pet.species?.toLowerCase() === 'dog' ? 'dog' : pet.species?.toLowerCase() === 'cat' ? 'cat' : 'paw'} 
                      size={32} 
                      color="#14B8A6" 
                    />
                  </View>
                  <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
                  <Text style={styles.petBreed} numberOfLines={1}>{pet.breed}</Text>
                  <Text style={styles.petDetails}>{pet.age} {pet.age === 1 ? 'year' : 'years'} • {pet.weight} lbs</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity 
              onPress={handleAddAppointment}
              style={styles.addButton}
              accessibilityLabel="Add new appointment"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={28} color="#14B8A6" />
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No upcoming appointments</Text>
              <Text style={styles.emptyStateText}>Schedule a checkup or vaccination</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={handleAddAppointment}
                accessibilityLabel="Schedule appointment"
                accessibilityRole="button"
              >
                <Text style={styles.emptyStateButtonText}>Add Appointment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.appointmentsList}>
              {upcomingAppointments.map((appointment) => {
                const pet = pets.find(p => p.id === appointment.petId);
                const appointmentDate = new Date(appointment.date);
                const formattedDate = appointmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const formattedTime = appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                return (
                  <TouchableOpacity
                    key={appointment.id}
                    style={styles.appointmentCard}
                    onPress={() => handleAppointmentPress(appointment.id)}
                    accessibilityLabel={`${appointment.type} appointment for ${pet?.name} on ${formattedDate}`}
                    accessibilityRole="button"
                  >
                    <View style={styles.appointmentDateBadge}>
                      <Text style={styles.appointmentDateText}>{formattedDate}</Text>
                    </View>
                    <View style={styles.appointmentDetails}>
                      <Text style={styles.appointmentType}>{appointment.type}</Text>
                      <Text style={styles.appointmentPet}>{pet?.name}</Text>
                      <View style={styles.appointmentMeta}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.appointmentTime}>{formattedTime}</Text>
                      </View>
                      {appointment.location && (
                        <View style={styles.appointmentMeta}>
                          <Ionicons name="location-outline" size={14} color="#6B7280" />
                          <Text style={styles.appointmentLocation}>{appointment.location}</Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handlePremiumAction('/records', true)}
              accessibilityLabel="View health records"
              accessibilityRole="button"
            >
              {!isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={12} color="#FCD34D" />
                </View>
              )}
              <Ionicons name="medical" size={32} color="#14B8A6" />
              <Text style={styles.quickActionText}>Health Records</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handlePremiumAction('/medications', true)}
              accessibilityLabel="View medications"
              accessibilityRole="button"
            >
              {!isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={12} color="#FCD34D" />
                </View>
              )}
              <Ionicons name="medkit" size={32} color="#14B8A6" />
              <Text style={styles.quickActionText}>Medications</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/vaccinations' as any)}
              accessibilityLabel="View vaccinations"
              accessibilityRole="button"
            >
              <Ionicons name="shield-checkmark" size={32} color="#14B8A6" />
              <Text style={styles.quickActionText}>Vaccinations</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/reminders' as any)}
              accessibilityLabel="View reminders"
              accessibilityRole="button"
            >
              <Ionicons name="notifications" size={32} color="#14B8A6" />
              <Text style={styles.quickActionText}>Reminders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  content: { 
    flex: 1 
  },
  scrollContent: { 
    paddingHorizontal: 16,
    paddingBottom: 24 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    fontSize: 16, 
    color: '#EF4444', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  retryButton: { 
    backgroundColor: '#14B8A6', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  retryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    marginBottom: 24
  },
  section: {
    marginBottom: 32
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC'
  },
  addButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyStateCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateText: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 16
  },
  emptyStateButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  petGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  petCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 150
  },
  petIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4
  },
  petBreed: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4
  },
  petDetails: {
    fontSize: 12,
    color: '#64748B'
  },
  appointmentsList: {
    gap: 12
  },
  appointmentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 44
  },
  appointmentDateBadge: {
    backgroundColor: '#134E4A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12
  },
  appointmentDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14B8A6'
  },
  appointmentDetails: {
    flex: 1
  },
  appointmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2
  },
  appointmentPet: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  appointmentTime: {
    fontSize: 12,
    color: '#64748B'
  },
  appointmentLocation: {
    fontSize: 12,
    color: '#64748B'
  },
  quickActionsSection: {
    marginBottom: 16
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12
  },
  quickActionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 150,
    position: 'relative'
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginTop: 8,
    textAlign: 'center'
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#FCD34D'
  }
});
