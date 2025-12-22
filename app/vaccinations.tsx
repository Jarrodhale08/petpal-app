import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePetStore } from '../src/stores/petStore';

interface Vaccination {
  id: string;
  petId: string;
  name: string;
  dateAdministered: string;
  nextDueDate?: string;
  veterinarian?: string;
  clinic?: string;
  batchNumber?: string;
  notes?: string;
}

const COMMON_VACCINATIONS = {
  dog: ['Rabies', 'DHPP', 'Bordetella', 'Lyme Disease', 'Canine Influenza', 'Leptospirosis'],
  cat: ['Rabies', 'FVRCP', 'FeLV', 'FIV'],
  other: ['Rabies'],
};

export default function VaccinationsScreen() {
  const router = useRouter();
  const { pets } = usePetStore();

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const filteredVaccinations = useMemo(() => {
    let filtered = vaccinations;
    if (selectedPetId) {
      filtered = filtered.filter((v) => v.petId === selectedPetId);
    }
    return filtered.sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime());
  }, [vaccinations, selectedPetId]);

  const upcomingVaccinations = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return vaccinations
      .filter((v) => {
        if (!v.nextDueDate) return false;
        const dueDate = new Date(v.nextDueDate);
        return dueDate >= now && dueDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());
  }, [vaccinations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch vaccinations from Supabase
    setRefreshing(false);
  }, []);

  const handleAddVaccination = useCallback(() => {
    Alert.alert(
      'Coming Soon',
      'Vaccination tracking will be available in a future update.',
      [{ text: 'OK' }]
    );
  }, []);

  const getPetName = useCallback(
    (petId: string) => {
      const pet = pets.find((p) => p.id === petId);
      return pet?.name || 'Unknown Pet';
    },
    [pets]
  );

  const getDaysUntilDue = useCallback((dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

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
        <Text style={styles.headerTitle}>Vaccinations</Text>
        <TouchableOpacity
          onPress={handleAddVaccination}
          style={styles.addButton}
          accessibilityLabel="Add vaccination"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#14B8A6" />
        </TouchableOpacity>
      </View>

      {upcomingVaccinations.length > 0 && (
        <View style={styles.alertSection}>
          <View style={styles.alertCard}>
            <Ionicons name="alert-circle" size={24} color="#F59E0B" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Upcoming Vaccinations</Text>
              <Text style={styles.alertText}>
                {upcomingVaccinations.length} vaccination{upcomingVaccinations.length > 1 ? 's' : ''} due in the next 30 days
              </Text>
            </View>
          </View>
        </View>
      )}

      {pets.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.petFilters}
        >
          <TouchableOpacity
            style={[styles.petFilter, !selectedPetId && styles.petFilterSelected]}
            onPress={() => setSelectedPetId(null)}
          >
            <Text style={[styles.petFilterText, !selectedPetId && styles.petFilterTextSelected]}>
              All Pets
            </Text>
          </TouchableOpacity>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[styles.petFilter, selectedPetId === pet.id && styles.petFilterSelected]}
              onPress={() => setSelectedPetId(pet.id)}
            >
              <Text
                style={[
                  styles.petFilterText,
                  selectedPetId === pet.id && styles.petFilterTextSelected,
                ]}
              >
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#14B8A6" />
          </View>
        ) : filteredVaccinations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={64} color="#64748B" />
            <Text style={styles.emptyTitle}>No Vaccinations</Text>
            <Text style={styles.emptyText}>
              Keep your pet protected by tracking their vaccinations
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddVaccination}
              accessibilityLabel="Add first vaccination"
              accessibilityRole="button"
            >
              <Text style={styles.emptyButtonText}>Add Vaccination</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.vaccinationsList}>
            {filteredVaccinations.map((vaccination) => {
              const isOverdue = vaccination.nextDueDate && new Date(vaccination.nextDueDate) < new Date();
              const isDueSoon = vaccination.nextDueDate && getDaysUntilDue(vaccination.nextDueDate) <= 30 && !isOverdue;

              return (
                <TouchableOpacity
                  key={vaccination.id}
                  style={styles.vaccinationCard}
                  accessibilityLabel={`${vaccination.name} for ${getPetName(vaccination.petId)}`}
                  accessibilityRole="button"
                >
                  <View style={styles.vaccinationHeader}>
                    <View style={[
                      styles.vaccinationIconContainer,
                      isOverdue && styles.vaccinationIconOverdue,
                      isDueSoon && styles.vaccinationIconDueSoon,
                    ]}>
                      <Ionicons
                        name="shield-checkmark"
                        size={24}
                        color={isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : '#14B8A6'}
                      />
                    </View>
                    <View style={styles.vaccinationInfo}>
                      <Text style={styles.vaccinationName}>{vaccination.name}</Text>
                      <Text style={styles.vaccinationPet}>{getPetName(vaccination.petId)}</Text>
                    </View>
                    {isOverdue && (
                      <View style={styles.overdueBadge}>
                        <Text style={styles.overdueBadgeText}>Overdue</Text>
                      </View>
                    )}
                    {isDueSoon && !isOverdue && (
                      <View style={styles.dueSoonBadge}>
                        <Text style={styles.dueSoonBadgeText}>Due Soon</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.vaccinationDetails}>
                    <View style={styles.vaccinationDetailRow}>
                      <Text style={styles.vaccinationLabel}>Administered:</Text>
                      <Text style={styles.vaccinationValue}>
                        {new Date(vaccination.dateAdministered).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    {vaccination.nextDueDate && (
                      <View style={styles.vaccinationDetailRow}>
                        <Text style={styles.vaccinationLabel}>Next Due:</Text>
                        <Text style={[
                          styles.vaccinationValue,
                          isOverdue && styles.vaccinationValueOverdue,
                          isDueSoon && styles.vaccinationValueDueSoon,
                        ]}>
                          {new Date(vaccination.nextDueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    )}
                    {vaccination.veterinarian && (
                      <View style={styles.vaccinationDetailRow}>
                        <Text style={styles.vaccinationLabel}>Veterinarian:</Text>
                        <Text style={styles.vaccinationValue}>Dr. {vaccination.veterinarian}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
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
  addButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertSection: {
    padding: 16,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  petFilters: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  petFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  petFilterSelected: {
    backgroundColor: '#134E4A',
    borderColor: '#14B8A6',
  },
  petFilterText: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  petFilterTextSelected: {
    color: '#14B8A6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  vaccinationsList: {
    gap: 12,
  },
  vaccinationCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  vaccinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaccinationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vaccinationIconOverdue: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  vaccinationIconDueSoon: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  vaccinationInfo: {
    flex: 1,
  },
  vaccinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  vaccinationPet: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  overdueBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  dueSoonBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueSoonBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  vaccinationDetails: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  vaccinationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vaccinationLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  vaccinationValue: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  vaccinationValueOverdue: {
    color: '#EF4444',
  },
  vaccinationValueDueSoon: {
    color: '#F59E0B',
  },
});
