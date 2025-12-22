import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePetStore } from '../../src/stores/petStore';
import { useAppointmentStore } from '../../src/stores/appointmentStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';

const DEFAULT_PET_IMAGE = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400';

type AppointmentType = 'checkup' | 'vaccination' | 'grooming' | 'surgery' | 'emergency' | 'other';

const getAppointmentIcon = (type: AppointmentType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'checkup': return 'medkit-outline';
    case 'vaccination': return 'fitness-outline';
    case 'grooming': return 'cut-outline';
    case 'surgery': return 'medical-outline';
    case 'emergency': return 'alert-circle-outline';
    default: return 'calendar-outline';
  }
};

const getSpeciesIcon = (species: string): keyof typeof Ionicons.glyphMap => {
  const lower = species.toLowerCase();
  if (lower.includes('dog')) return 'paw';
  if (lower.includes('cat')) return 'paw';
  if (lower.includes('bird')) return 'leaf-outline';
  if (lower.includes('fish')) return 'water-outline';
  if (lower.includes('rabbit') || lower.includes('bunny')) return 'leaf-outline';
  return 'paw';
};

export default function PetDetailsScreen() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { getPetById, deletePet } = usePetStore();
  const { getAppointmentsByPetId, deleteAppointment, markAsCompleted } = useAppointmentStore();
  const { isPremium } = useSubscriptionStore();
  const [refreshing, setRefreshing] = useState(false);

  const pet = useMemo(() => {
    if (!petId) return null;
    return getPetById(petId);
  }, [petId, getPetById]);

  const appointments = useMemo(() => {
    if (!petId) return [];
    return getAppointmentsByPetId(petId).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [petId, getAppointmentsByPetId]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter(apt => new Date(apt.date) >= now && !apt.isCompleted);
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter(apt => new Date(apt.date) < now || apt.isCompleted);
  }, [appointments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const handleEditPet = useCallback(() => {
    if (!isPremium) {
      router.push('/subscription');
      return;
    }
    // Navigate to edit pet screen
    router.push(`/pet/edit?petId=${petId}`);
  }, [isPremium, petId, router]);

  const handleDeletePet = useCallback(() => {
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to remove ${pet?.name} from your pets? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (petId) {
              await deletePet(petId);
              router.back();
            }
          },
        },
      ]
    );
  }, [pet?.name, petId, deletePet, router]);

  const handleAddAppointment = useCallback(() => {
    if (!isPremium && appointments.length >= 3) {
      router.push('/subscription');
      return;
    }
    router.push(`/appointment/add?petId=${petId}`);
  }, [isPremium, appointments.length, petId, router]);

  const handleAppointmentComplete = useCallback((appointmentId: string) => {
    Alert.alert(
      'Mark as Complete',
      'Mark this appointment as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => markAsCompleted(appointmentId),
        },
      ]
    );
  }, [markAsCompleted]);

  const handleDeleteAppointment = useCallback((appointmentId: string) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAppointment(appointmentId),
        },
      ]
    );
  }, [deleteAppointment]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAge = (age: number) => {
    if (age < 1) {
      const months = Math.round(age * 12);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${age} year${age !== 1 ? 's' : ''}`;
  };

  if (!pet) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="paw" size={64} color="#334155" />
          <Text style={styles.emptyTitle}>Pet Not Found</Text>
          <Text style={styles.emptySubtitle}>
            This pet may have been removed or doesn't exist.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
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
        {/* Pet Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: pet.imageUrl || DEFAULT_PET_IMAGE }}
            style={styles.petImage}
          />
          <View style={styles.petInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.petName}>{pet.name}</Text>
              {pet.gender && (
                <Ionicons
                  name={pet.gender === 'male' ? 'male' : 'female'}
                  size={24}
                  color={pet.gender === 'male' ? '#3B82F6' : '#EC4899'}
                />
              )}
            </View>
            <View style={styles.speciesRow}>
              <Ionicons name={getSpeciesIcon(pet.species)} size={16} color="#9CA3AF" />
              <Text style={styles.speciesText}>
                {pet.breed || pet.species}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color="#14B8A6" />
            <Text style={styles.statValue}>{calculateAge(pet.age)}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="scale-outline" size={24} color="#14B8A6" />
            <Text style={styles.statValue}>{pet.weight} lbs</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="medkit-outline" size={24} color="#14B8A6" />
            <Text style={styles.statValue}>{upcomingAppointments.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>

        {/* Pet Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>

          {pet.color && (
            <View style={styles.detailRow}>
              <Ionicons name="color-palette-outline" size={20} color="#9CA3AF" />
              <Text style={styles.detailLabel}>Color</Text>
              <Text style={styles.detailValue}>{pet.color}</Text>
            </View>
          )}

          {pet.microchipId && (
            <View style={styles.detailRow}>
              <Ionicons name="hardware-chip-outline" size={20} color="#9CA3AF" />
              <Text style={styles.detailLabel}>Microchip</Text>
              <Text style={styles.detailValue}>{pet.microchipId}</Text>
            </View>
          )}

          {pet.notes && (
            <View style={styles.notesContainer}>
              <View style={styles.notesHeader}>
                <Ionicons name="document-text-outline" size={20} color="#9CA3AF" />
                <Text style={styles.detailLabel}>Notes</Text>
              </View>
              <Text style={styles.notesText}>{pet.notes}</Text>
            </View>
          )}

          {!pet.color && !pet.microchipId && !pet.notes && (
            <Text style={styles.noDetailsText}>
              No additional details. Edit your pet to add more information.
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditPet}>
            <Ionicons name="create-outline" size={24} color="#14B8A6" />
            <Text style={styles.actionText}>Edit Pet</Text>
            {!isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color="#FCD34D" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddAppointment}>
            <Ionicons name="add-circle-outline" size={24} color="#14B8A6" />
            <Text style={styles.actionText}>Add Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteAction]}
            onPress={handleDeletePet}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <Text style={[styles.actionText, styles.deleteText]}>Delete Pet</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <Text style={styles.sectionCount}>{upcomingAppointments.length}</Text>
          </View>

          {upcomingAppointments.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={40} color="#334155" />
              <Text style={styles.emptySectionText}>No upcoming appointments</Text>
              <TouchableOpacity
                style={styles.addAppointmentButton}
                onPress={handleAddAppointment}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addAppointmentText}>Schedule Appointment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingAppointments.map((apt) => (
              <View key={apt.id} style={styles.appointmentCard}>
                <View style={styles.appointmentIcon}>
                  <Ionicons
                    name={getAppointmentIcon(apt.type as AppointmentType)}
                    size={24}
                    color="#14B8A6"
                  />
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentTitle}>{apt.title}</Text>
                  <Text style={styles.appointmentDate}>
                    {formatDate(apt.date)}
                    {apt.time && ` at ${apt.time}`}
                  </Text>
                  {apt.clinic && (
                    <Text style={styles.appointmentClinic}>
                      <Ionicons name="location-outline" size={12} color="#9CA3AF" /> {apt.clinic}
                    </Text>
                  )}
                </View>
                <View style={styles.appointmentActions}>
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleAppointmentComplete(apt.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAppointment(apt.id)}
                  >
                    <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Past Appointments</Text>
              <Text style={styles.sectionCount}>{pastAppointments.length}</Text>
            </View>

            {pastAppointments.slice(0, 5).map((apt) => (
              <View key={apt.id} style={[styles.appointmentCard, styles.pastAppointment]}>
                <View style={[styles.appointmentIcon, styles.pastIcon]}>
                  <Ionicons
                    name={getAppointmentIcon(apt.type as AppointmentType)}
                    size={24}
                    color="#64748B"
                  />
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={[styles.appointmentTitle, styles.pastTitle]}>{apt.title}</Text>
                  <Text style={styles.appointmentDate}>{formatDate(apt.date)}</Text>
                </View>
                {apt.isCompleted && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                  </View>
                )}
              </View>
            ))}

            {pastAppointments.length > 5 && (
              <Text style={styles.moreText}>
                +{pastAppointments.length - 5} more past appointments
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E293B',
  },
  petInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  speciesText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  notesContainer: {
    marginTop: 12,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
    marginLeft: 32,
  },
  noDetailsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  actionText: {
    fontSize: 12,
    color: '#F8FAFC',
    marginTop: 4,
  },
  deleteAction: {
    backgroundColor: '#1E293B',
  },
  deleteText: {
    color: '#EF4444',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  sectionCount: {
    fontSize: 14,
    color: '#14B8A6',
    marginLeft: 8,
    fontWeight: '600',
  },
  emptySection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 16,
  },
  addAppointmentButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  addAppointmentText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  pastAppointment: {
    opacity: 0.7,
  },
  appointmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastIcon: {
    backgroundColor: '#334155',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  pastTitle: {
    color: '#94A3B8',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  appointmentClinic: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  completedBadge: {
    backgroundColor: '#064E3B',
    borderRadius: 12,
    padding: 6,
  },
  moreText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
