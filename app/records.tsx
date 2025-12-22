import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePetStore } from '../src/stores/petStore';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';

interface HealthRecord {
  id: string;
  petId: string;
  type: 'checkup' | 'vaccination' | 'surgery' | 'illness' | 'injury' | 'other';
  title: string;
  date: string;
  veterinarian?: string;
  clinic?: string;
  notes?: string;
  attachments?: string[];
}

const RECORD_TYPE_ICONS: Record<string, string> = {
  checkup: 'medkit',
  vaccination: 'shield-checkmark',
  surgery: 'medical',
  illness: 'thermometer',
  injury: 'bandage',
  other: 'document-text',
};

export default function HealthRecordsScreen() {
  const router = useRouter();
  const { pets } = usePetStore();
  const { isPremium } = useSubscriptionStore();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    let filtered = records;
    if (selectedPetId) {
      filtered = filtered.filter((r) => r.petId === selectedPetId);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.type.toLowerCase().includes(query) ||
          r.veterinarian?.toLowerCase().includes(query)
      );
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, selectedPetId, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch records from Supabase
    setRefreshing(false);
  }, []);

  const handleAddRecord = useCallback(() => {
    Alert.alert(
      'Coming Soon',
      'Health record creation will be available in a future update.',
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
          <Text style={styles.headerTitle}>Health Records</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.premiumContainer}>
          <View style={styles.premiumIconContainer}>
            <Ionicons name="medical" size={48} color="#FCD34D" />
          </View>
          <Text style={styles.premiumTitle}>Premium Feature</Text>
          <Text style={styles.premiumDescription}>
            Track your pet's complete health history, including checkups, vaccinations, surgeries, and more.
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
        <Text style={styles.headerTitle}>Health Records</Text>
        <TouchableOpacity
          onPress={handleAddRecord}
          style={styles.addButton}
          accessibilityLabel="Add record"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#14B8A6" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search records..."
            placeholderTextColor="#64748B"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
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
        ) : filteredRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#64748B" />
            <Text style={styles.emptyTitle}>No Health Records</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedPetId
                ? 'No records match your search'
                : 'Start tracking your pet\'s health by adding their first record'}
            </Text>
            {!searchQuery && !selectedPetId && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleAddRecord}
                accessibilityLabel="Add first record"
                accessibilityRole="button"
              >
                <Text style={styles.emptyButtonText}>Add Record</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.recordsList}>
            {filteredRecords.map((record) => (
              <TouchableOpacity
                key={record.id}
                style={styles.recordCard}
                accessibilityLabel={`${record.title} on ${new Date(record.date).toLocaleDateString()}`}
                accessibilityRole="button"
              >
                <View style={styles.recordIconContainer}>
                  <Ionicons
                    name={(RECORD_TYPE_ICONS[record.type] || 'document-text') as any}
                    size={24}
                    color="#14B8A6"
                  />
                </View>
                <View style={styles.recordContent}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordPet}>{getPetName(record.petId)}</Text>
                  <View style={styles.recordMeta}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" />
                    <Text style={styles.recordDate}>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
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
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F8FAFC',
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
  recordsList: {
    gap: 12,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  recordIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  recordPet: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordDate: {
    fontSize: 12,
    color: '#64748B',
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
