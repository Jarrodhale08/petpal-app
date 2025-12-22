import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePetStore, Pet } from '../../src/stores/petStore';
import { useAppointmentStore } from '../../src/stores/appointmentStore';

export default function PetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deleting, setDeleting] = useState(false);

  const { pets, deletePet, loading } = usePetStore();
  const { appointments } = useAppointmentStore();

  const pet = useMemo(() => pets.find((p) => p.id === id), [pets, id]);

  const petAppointments = useMemo(() => {
    if (!pet) return [];
    return appointments
      .filter((apt) => apt.petId === pet.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [appointments, pet]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return petAppointments.filter((apt) => new Date(apt.date) >= now);
  }, [petAppointments]);

  const handleEdit = useCallback(() => {
    if (pet) {
      router.push(`/pet/edit/${pet.id}`);
    }
  }, [router, pet]);

  const handleDelete = useCallback(() => {
    if (!pet) return;

    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${pet.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const success = await deletePet(pet.id);
            setDeleting(false);
            if (success) {
              router.back();
            } else {
              Alert.alert('Error', 'Failed to delete pet. Please try again.');
            }
          },
        },
      ]
    );
  }, [pet, deletePet, router]);

  const handleAddAppointment = useCallback(() => {
    if (pet) {
      router.push(`/appointment/add?petId=${pet.id}`);
    }
  }, [router, pet]);

  const getSpeciesIcon = (species: string) => {
    switch (species?.toLowerCase()) {
      case 'dog':
        return 'dog';
      case 'cat':
        return 'cat';
      case 'bird':
        return 'bird';
      case 'fish':
        return 'fish';
      default:
        return 'paw';
    }
  };

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pet Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.notFoundContainer}>
          <Ionicons name="paw" size={64} color="#64748B" />
          <Text style={styles.notFoundText}>Pet not found</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.replace('/(tabs)')}
            accessibilityLabel="Go to home"
            accessibilityRole="button"
          >
            <Text style={styles.backToHomeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Details</Text>
        <TouchableOpacity
          onPress={handleEdit}
          style={styles.editButton}
          accessibilityLabel="Edit pet"
          accessibilityRole="button"
        >
          <Ionicons name="pencil" size={20} color="#14B8A6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name={getSpeciesIcon(pet.species)} size={48} color="#14B8A6" />
          </View>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed || pet.species}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Species</Text>
                <Text style={styles.infoValue}>{pet.species}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Breed</Text>
                <Text style={styles.infoValue}>{pet.breed || 'Unknown'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>
                  {pet.age} {pet.age === 1 ? 'year' : 'years'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{pet.weight} lbs</Text>
              </View>
            </View>
            {pet.gender && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>
                    {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                  </Text>
                </View>
                {pet.color && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Color</Text>
                    <Text style={styles.infoValue}>{pet.color}</Text>
                  </View>
                )}
              </View>
            )}
            {pet.microchipId && (
              <View style={styles.infoRow}>
                <View style={[styles.infoItem, { flex: 1 }]}>
                  <Text style={styles.infoLabel}>Microchip ID</Text>
                  <Text style={styles.infoValue}>{pet.microchipId}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {pet.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{pet.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity
              onPress={handleAddAppointment}
              style={styles.addAppointmentButton}
              accessibilityLabel="Add appointment"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={24} color="#14B8A6" />
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length === 0 ? (
            <View style={styles.emptyAppointments}>
              <Ionicons name="calendar-outline" size={32} color="#64748B" />
              <Text style={styles.emptyAppointmentsText}>No upcoming appointments</Text>
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={handleAddAppointment}
                accessibilityLabel="Schedule appointment"
                accessibilityRole="button"
              >
                <Text style={styles.scheduleButtonText}>Schedule Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.appointmentsList}>
              {upcomingAppointments.map((apt) => {
                const date = new Date(apt.date);
                return (
                  <TouchableOpacity
                    key={apt.id}
                    style={styles.appointmentCard}
                    onPress={() => router.push(`/appointment/${apt.id}`)}
                    accessibilityLabel={`${apt.type} on ${date.toLocaleDateString()}`}
                    accessibilityRole="button"
                  >
                    <View style={styles.appointmentDateBadge}>
                      <Text style={styles.appointmentMonth}>
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </Text>
                      <Text style={styles.appointmentDay}>{date.getDate()}</Text>
                    </View>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentType}>{apt.type}</Text>
                      <Text style={styles.appointmentTime}>
                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                      {apt.veterinarian && (
                        <Text style={styles.appointmentVet}>Dr. {apt.veterinarian}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#64748B" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleting || loading}
          accessibilityLabel="Delete pet"
          accessibilityRole="button"
        >
          {deleting ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Delete Pet</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  editButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notFoundText: {
    fontSize: 18,
    color: '#94A3B8',
    marginTop: 16,
    marginBottom: 24,
  },
  backToHomeButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToHomeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  petName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  infoSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  notesSection: {
    padding: 16,
    paddingTop: 0,
  },
  notesCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  notesText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
  },
  appointmentsSection: {
    padding: 16,
    paddingTop: 0,
  },
  addAppointmentButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyAppointments: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyAppointmentsText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
    marginBottom: 16,
  },
  scheduleButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  appointmentDateBadge: {
    backgroundColor: '#134E4A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 16,
    minWidth: 56,
  },
  appointmentMonth: {
    fontSize: 12,
    color: '#14B8A6',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  appointmentDay: {
    fontSize: 20,
    color: '#14B8A6',
    fontWeight: '700',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 2,
  },
  appointmentVet: {
    fontSize: 12,
    color: '#64748B',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
