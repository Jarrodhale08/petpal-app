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
import { useSubscriptionStore } from '../src/stores/subscriptionStore';

interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
  reminderEnabled: boolean;
}

export default function MedicationsScreen() {
  const router = useRouter();
  const { pets } = usePetStore();
  const { isPremium } = useSubscriptionStore();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [showActive, setShowActive] = useState(true);

  const filteredMedications = useMemo(() => {
    let filtered = medications;
    if (selectedPetId) {
      filtered = filtered.filter((m) => m.petId === selectedPetId);
    }
    if (showActive) {
      filtered = filtered.filter((m) => m.isActive);
    }
    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [medications, selectedPetId, showActive]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch medications from Supabase
    setRefreshing(false);
  }, []);

  const handleAddMedication = useCallback(() => {
    Alert.alert(
      'Coming Soon',
      'Medication tracking will be available in a future update.',
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

  if (!isPremium) {
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
          <Text style={styles.headerTitle}>Medications</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.premiumContainer}>
          <View style={styles.premiumIconContainer}>
            <Ionicons name="medkit" size={48} color="#FCD34D" />
          </View>
          <Text style={styles.premiumTitle}>Premium Feature</Text>
          <Text style={styles.premiumDescription}>
            Track all your pet's medications, dosages, and schedules. Get reminders when it's time for their next dose.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/subscription')}
            accessibilityLabel="Upgrade to Premium"
            accessibilityRole="button"
          >
            <Ionicons name="star" size={20} color="#0F172A" />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
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
        <Text style={styles.headerTitle}>Medications</Text>
        <TouchableOpacity
          onPress={handleAddMedication}
          style={styles.addButton}
          accessibilityLabel="Add medication"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#14B8A6" />
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showActive && styles.toggleButtonSelected]}
          onPress={() => setShowActive(true)}
        >
          <Text style={[styles.toggleButtonText, showActive && styles.toggleButtonTextSelected]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !showActive && styles.toggleButtonSelected]}
          onPress={() => setShowActive(false)}
        >
          <Text style={[styles.toggleButtonText, !showActive && styles.toggleButtonTextSelected]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

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
        ) : filteredMedications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medkit-outline" size={64} color="#64748B" />
            <Text style={styles.emptyTitle}>No Medications</Text>
            <Text style={styles.emptyText}>
              {showActive
                ? 'No active medications. Add one to start tracking.'
                : 'No medications found. Add one to start tracking.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddMedication}
              accessibilityLabel="Add first medication"
              accessibilityRole="button"
            >
              <Text style={styles.emptyButtonText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.medicationsList}>
            {filteredMedications.map((medication) => (
              <TouchableOpacity
                key={medication.id}
                style={styles.medicationCard}
                accessibilityLabel={`${medication.name} for ${getPetName(medication.petId)}`}
                accessibilityRole="button"
              >
                <View style={styles.medicationHeader}>
                  <View style={styles.medicationIconContainer}>
                    <Ionicons name="medical" size={24} color="#14B8A6" />
                  </View>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationPet}>{getPetName(medication.petId)}</Text>
                  </View>
                  {medication.isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
                <View style={styles.medicationDetails}>
                  <View style={styles.medicationDetailRow}>
                    <Text style={styles.medicationLabel}>Dosage:</Text>
                    <Text style={styles.medicationValue}>{medication.dosage}</Text>
                  </View>
                  <View style={styles.medicationDetailRow}>
                    <Text style={styles.medicationLabel}>Frequency:</Text>
                    <Text style={styles.medicationValue}>{medication.frequency}</Text>
                  </View>
                  <View style={styles.medicationDetailRow}>
                    <Text style={styles.medicationLabel}>Started:</Text>
                    <Text style={styles.medicationValue}>
                      {new Date(medication.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {medication.endDate && (
                    <View style={styles.medicationDetailRow}>
                      <Text style={styles.medicationLabel}>Ends:</Text>
                      <Text style={styles.medicationValue}>
                        {new Date(medication.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  )}
                </View>
                {medication.reminderEnabled && (
                  <View style={styles.reminderIndicator}>
                    <Ionicons name="notifications" size={14} color="#14B8A6" />
                    <Text style={styles.reminderIndicatorText}>Reminders enabled</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
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
  headerSpacer: {
    width: 44,
  },
  addButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonSelected: {
    backgroundColor: '#134E4A',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  toggleButtonTextSelected: {
    color: '#14B8A6',
  },
  petFilters: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  medicationsList: {
    gap: 12,
  },
  medicationCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  medicationPet: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  medicationDetails: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  medicationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medicationLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  medicationValue: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  reminderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  reminderIndicatorText: {
    fontSize: 12,
    color: '#14B8A6',
  },
  premiumContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  premiumIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  premiumDescription: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FCD34D',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});
