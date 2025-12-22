import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePetStore } from '../../src/stores/petStore';

export default function PetsSettingsScreen() {
  const router = useRouter();
  const { pets } = usePetStore();

  const handleAddPet = () => {
    router.push('/pet/add');
  };

  const handleEditPet = (petId: string) => {
    router.push(`/pet/edit/${petId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <Text style={styles.header}>
          Manage your pets and their profiles.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Pets</Text>
          
          {pets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="paw-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No pets added yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first pet to start tracking their health
              </Text>
            </View>
          ) : (
            <View style={styles.petList}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petCard}
                  onPress={() => handleEditPet(pet.id)}
                >
                  <View style={styles.petAvatar}>
                    {pet.imageUrl ? (
                      <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
                    ) : (
                      <Ionicons name="paw" size={24} color="#14B8A6" />
                    )}
                  </View>
                  <View style={styles.petInfo}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petDetails}>
                      {pet.species}{pet.breed ? ` • ${pet.breed}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Pet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  emptyState: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  petList: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#134E4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  petImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  petDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 32,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
