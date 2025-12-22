import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePetStore } from '../../../src/stores/petStore';

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Other'];
const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

export default function EditPetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pets, updatePet, loading } = usePetStore();

  const pet = useMemo(() => pets.find((p) => p.id === id), [pets, id]);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined);
  const [color, setColor] = useState('');
  const [microchipId, setMicrochipId] = useState('');
  const [notes, setNotes] = useState('');
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (pet) {
      setName(pet.name);
      setSpecies(pet.species);
      setBreed(pet.breed || '');
      setAge(pet.age?.toString() || '');
      setWeight(pet.weight?.toString() || '');
      setGender(pet.gender);
      setColor(pet.color || '');
      setMicrochipId(pet.microchipId || '');
      setNotes(pet.notes || '');
    }
  }, [pet]);

  useEffect(() => {
    if (!pet) return;
    const changed =
      name !== pet.name ||
      species !== pet.species ||
      breed !== (pet.breed || '') ||
      age !== (pet.age?.toString() || '') ||
      weight !== (pet.weight?.toString() || '') ||
      gender !== pet.gender ||
      color !== (pet.color || '') ||
      microchipId !== (pet.microchipId || '') ||
      notes !== (pet.notes || '');
    setHasChanges(changed);
  }, [pet, name, species, breed, age, weight, gender, color, microchipId, notes]);

  const validateForm = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your pet\'s name.');
      return false;
    }
    if (!species) {
      Alert.alert('Validation Error', 'Please select a species.');
      return false;
    }
    const ageNum = parseFloat(age);
    if (age && (isNaN(ageNum) || ageNum < 0 || ageNum > 50)) {
      Alert.alert('Validation Error', 'Please enter a valid age (0-50 years).');
      return false;
    }
    const weightNum = parseFloat(weight);
    if (weight && (isNaN(weightNum) || weightNum < 0 || weightNum > 500)) {
      Alert.alert('Validation Error', 'Please enter a valid weight (0-500 lbs).');
      return false;
    }
    return true;
  }, [name, species, age, weight]);

  const handleSave = useCallback(async () => {
    if (!pet || !validateForm()) return;

    const petData = {
      name: name.trim(),
      species,
      breed: breed.trim(),
      age: age ? parseFloat(age) : 0,
      weight: weight ? parseFloat(weight) : 0,
      gender,
      color: color.trim() || undefined,
      microchipId: microchipId.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const success = await updatePet(pet.id, petData);
    if (success) {
      router.back();
    } else {
      Alert.alert('Error', 'Failed to update pet. Please try again.');
    }
  }, [pet, name, species, breed, age, weight, gender, color, microchipId, notes, updatePet, router, validateForm]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  }, [hasChanges, router]);

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
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Pet</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.notFoundContainer}>
          <Ionicons name="paw" size={64} color="#64748B" />
          <Text style={styles.notFoundText}>Pet not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.backButton}
            accessibilityLabel="Cancel and go back"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Pet</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading || !hasChanges}
            accessibilityLabel="Save changes"
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#14B8A6" />
            ) : (
              <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter pet's name"
                placeholderTextColor="#64748B"
                autoCapitalize="words"
                accessibilityLabel="Pet name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Species *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSpeciesPicker(!showSpeciesPicker)}
                accessibilityLabel="Select species"
                accessibilityRole="button"
              >
                <Text style={species ? styles.pickerButtonText : styles.pickerPlaceholder}>
                  {species || 'Select species'}
                </Text>
                <Ionicons
                  name={showSpeciesPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
              {showSpeciesPicker && (
                <View style={styles.pickerOptions}>
                  {SPECIES_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.pickerOption,
                        species === option && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setSpecies(option);
                        setShowSpeciesPicker(false);
                      }}
                      accessibilityLabel={option}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          species === option && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                      {species === option && (
                        <Ionicons name="checkmark" size={20} color="#14B8A6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Breed</Text>
              <TextInput
                style={styles.input}
                value={breed}
                onChangeText={setBreed}
                placeholder="Enter breed"
                placeholderTextColor="#64748B"
                autoCapitalize="words"
                accessibilityLabel="Pet breed"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Age (years)</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Pet age in years"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Weight (lbs)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Pet weight in pounds"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderButtons}>
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderButton,
                      gender === option.value && styles.genderButtonSelected,
                    ]}
                    onPress={() => setGender(option.value as 'male' | 'female')}
                    accessibilityLabel={option.label}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name={option.value === 'male' ? 'male' : 'female'}
                      size={20}
                      color={gender === option.value ? '#14B8A6' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.genderButtonText,
                        gender === option.value && styles.genderButtonTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={color}
                onChangeText={setColor}
                placeholder="Enter color"
                placeholderTextColor="#64748B"
                autoCapitalize="words"
                accessibilityLabel="Pet color"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Microchip ID</Text>
              <TextInput
                style={styles.input}
                value={microchipId}
                onChangeText={setMicrochipId}
                placeholder="Enter microchip ID"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                accessibilityLabel="Microchip ID"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Additional notes"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
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
  saveButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6',
  },
  saveButtonTextDisabled: {
    color: '#64748B',
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
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
  },
  pickerButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 48,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#F8FAFC',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#64748B',
  },
  pickerOptions: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  pickerOptionSelected: {
    backgroundColor: '#134E4A',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  pickerOptionTextSelected: {
    color: '#14B8A6',
    fontWeight: '500',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 48,
  },
  genderButtonSelected: {
    borderColor: '#14B8A6',
    backgroundColor: '#134E4A',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  genderButtonTextSelected: {
    color: '#14B8A6',
    fontWeight: '500',
  },
});
