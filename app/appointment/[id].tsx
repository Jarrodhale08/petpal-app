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
import { useAppointmentStore } from '../../src/stores/appointmentStore';
import { usePetStore } from '../../src/stores/petStore';

const APPOINTMENT_TYPE_ICONS: Record<string, string> = {
  checkup: 'medkit',
  vaccination: 'shield-checkmark',
  grooming: 'cut',
  surgery: 'medical',
  emergency: 'alert-circle',
  other: 'calendar',
};

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const { appointments, deleteAppointment, markAsCompleted, loading } = useAppointmentStore();
  const { pets } = usePetStore();

  const appointment = useMemo(() => appointments.find((a) => a.id === id), [appointments, id]);
  const pet = useMemo(() => {
    if (!appointment) return null;
    return pets.find((p) => p.id === appointment.petId);
  }, [appointment, pets]);

  const appointmentDate = useMemo(() => {
    if (!appointment) return null;
    return new Date(appointment.date);
  }, [appointment]);

  const isPastAppointment = useMemo(() => {
    if (!appointmentDate) return false;
    return appointmentDate < new Date();
  }, [appointmentDate]);

  const handleDelete = useCallback(() => {
    if (!appointment) return;

    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const success = await deleteAppointment(appointment.id);
            setDeleting(false);
            if (success) {
              router.back();
            } else {
              Alert.alert('Error', 'Failed to delete appointment. Please try again.');
            }
          },
        },
      ]
    );
  }, [appointment, deleteAppointment, router]);

  const handleMarkComplete = useCallback(async () => {
    if (!appointment) return;

    setCompleting(true);
    const success = await markAsCompleted(appointment.id);
    setCompleting(false);

    if (!success) {
      Alert.alert('Error', 'Failed to mark appointment as complete. Please try again.');
    }
  }, [appointment, markAsCompleted]);

  const getTypeIcon = (type: string) => {
    return APPOINTMENT_TYPE_ICONS[type] || 'calendar';
  };

  if (!appointment) {
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
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.notFoundContainer}>
          <Ionicons name="calendar-outline" size={64} color="#64748B" />
          <Text style={styles.notFoundText}>Appointment not found</Text>
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
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={[styles.typeIconContainer, appointment.isCompleted && styles.typeIconCompleted]}>
            <Ionicons
              name={getTypeIcon(appointment.type) as any}
              size={40}
              color={appointment.isCompleted ? '#10B981' : '#14B8A6'}
            />
          </View>
          <Text style={styles.appointmentTitle}>{appointment.title || appointment.type}</Text>
          {appointment.isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.completedBadgeText}>Completed</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar" size={20} color="#14B8A6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {appointmentDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            {appointment.time && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time" size={20} color="#14B8A6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Time</Text>
                  <Text style={styles.infoValue}>{appointment.time}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {pet && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pet</Text>
            <TouchableOpacity
              style={styles.petCard}
              onPress={() => router.push(`/pet/${pet.id}`)}
              accessibilityLabel={`View ${pet.name}'s profile`}
              accessibilityRole="button"
            >
              <View style={styles.petIconContainer}>
                <Ionicons
                  name={pet.species?.toLowerCase() === 'dog' ? 'dog' : pet.species?.toLowerCase() === 'cat' ? 'cat' : 'paw'}
                  size={24}
                  color="#14B8A6"
                />
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petBreed}>{pet.breed || pet.species}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        )}

        {(appointment.veterinarian || appointment.clinic || appointment.location) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clinic Information</Text>
            <View style={styles.infoCard}>
              {appointment.veterinarian && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="person" size={20} color="#14B8A6" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Veterinarian</Text>
                    <Text style={styles.infoValue}>Dr. {appointment.veterinarian}</Text>
                  </View>
                </View>
              )}
              {appointment.clinic && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="business" size={20} color="#14B8A6" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Clinic</Text>
                    <Text style={styles.infoValue}>{appointment.clinic}</Text>
                  </View>
                </View>
              )}
              {appointment.location && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="location" size={20} color="#14B8A6" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{appointment.location}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          {!appointment.isCompleted && isPastAppointment && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleMarkComplete}
              disabled={completing || loading}
              accessibilityLabel="Mark as completed"
              accessibilityRole="button"
            >
              {completing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.completeButtonText}>Mark as Completed</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting || loading}
            accessibilityLabel="Delete appointment"
            accessibilityRole="button"
          >
            {deleting ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete Appointment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  typeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIconCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  appointmentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    textTransform: 'capitalize',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  completedBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    paddingTop: 2,
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
  petCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  petIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    color: '#CBD5E1',
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
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
