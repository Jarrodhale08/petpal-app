import React, { useState, useCallback, useMemo } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNotificationStore } from '../../src/stores/notificationStore';
import { usePetStore } from '../../src/stores/petStore';

const REMINDER_TYPES = [
  { label: 'Feeding', value: 'feeding', icon: 'restaurant' },
  { label: 'Walk', value: 'walk', icon: 'walk' },
  { label: 'Medication', value: 'medication', icon: 'medical' },
  { label: 'Grooming', value: 'grooming', icon: 'cut' },
  { label: 'Vet Visit', value: 'vet', icon: 'medkit' },
  { label: 'Custom', value: 'custom', icon: 'create' },
];

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function AddReminderScreen() {
  const router = useRouter();
  const { petId: preselectedPetId } = useLocalSearchParams<{ petId?: string }>();

  const { addPetReminder } = useNotificationStore();
  const { pets } = usePetStore();

  const [selectedPetId, setSelectedPetId] = useState(preselectedPetId || '');
  const [type, setType] = useState<'feeding' | 'walk' | 'medication' | 'grooming' | 'vet' | 'vaccination' | 'custom'>('feeding');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [time, setTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [loading, setLoading] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);

  const selectedPet = useMemo(() => {
    return pets.find((p) => p.id === selectedPetId);
  }, [pets, selectedPetId]);

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort();
    });
  }, []);

  const validateForm = useCallback(() => {
    if (!selectedPetId) {
      Alert.alert('Validation Error', 'Please select a pet.');
      return false;
    }
    if (!type) {
      Alert.alert('Validation Error', 'Please select a reminder type.');
      return false;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one day.');
      return false;
    }
    return true;
  }, [selectedPetId, type, selectedDays]);

  const handleSave = useCallback(async () => {
    if (!validateForm() || !selectedPet) return;

    setLoading(true);

    const reminderData = {
      petId: selectedPetId,
      petName: selectedPet.name,
      type,
      title: title.trim() || `${REMINDER_TYPES.find((t) => t.value === type)?.label} for ${selectedPet.name}`,
      body: body.trim() || `Time to ${type} ${selectedPet.name}!`,
      time: {
        hour: time.getHours(),
        minute: time.getMinutes(),
      },
      daysOfWeek: selectedDays,
      enabled: true,
    };

    const reminderId = await addPetReminder(reminderData);
    setLoading(false);

    if (reminderId) {
      router.back();
    } else {
      Alert.alert('Error', 'Failed to add reminder. Please try again.');
    }
  }, [selectedPetId, selectedPet, type, title, body, time, selectedDays, addPetReminder, router, validateForm]);

  const handleTimeChange = useCallback((event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Cancel and go back"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Reminder</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading}
            accessibilityLabel="Save reminder"
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#14B8A6" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pet *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowPetPicker(!showPetPicker)}
              accessibilityLabel="Select pet"
              accessibilityRole="button"
            >
              {selectedPet ? (
                <View style={styles.selectedPet}>
                  <View style={styles.petIconSmall}>
                    <Ionicons
                      name={selectedPet.species?.toLowerCase() === 'dog' ? 'dog' : selectedPet.species?.toLowerCase() === 'cat' ? 'cat' : 'paw'}
                      size={16}
                      color="#14B8A6"
                    />
                  </View>
                  <Text style={styles.pickerButtonText}>{selectedPet.name}</Text>
                </View>
              ) : (
                <Text style={styles.pickerPlaceholder}>Select a pet</Text>
              )}
              <Ionicons
                name={showPetPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
            {showPetPicker && (
              <View style={styles.pickerOptions}>
                {pets.length === 0 ? (
                  <View style={styles.noPetsMessage}>
                    <Text style={styles.noPetsText}>No pets found. Add a pet first.</Text>
                  </View>
                ) : (
                  pets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[
                        styles.pickerOption,
                        selectedPetId === pet.id && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedPetId(pet.id);
                        setShowPetPicker(false);
                      }}
                      accessibilityLabel={pet.name}
                      accessibilityRole="button"
                    >
                      <View style={styles.petOptionContent}>
                        <View style={styles.petIconSmall}>
                          <Ionicons
                            name={pet.species?.toLowerCase() === 'dog' ? 'dog' : pet.species?.toLowerCase() === 'cat' ? 'cat' : 'paw'}
                            size={16}
                            color={selectedPetId === pet.id ? '#14B8A6' : '#64748B'}
                          />
                        </View>
                        <Text
                          style={[
                            styles.pickerOptionText,
                            selectedPetId === pet.id && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {pet.name}
                        </Text>
                      </View>
                      {selectedPetId === pet.id && (
                        <Ionicons name="checkmark" size={20} color="#14B8A6" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Type *</Text>
            <View style={styles.typeGrid}>
              {REMINDER_TYPES.map((typeOption) => (
                <TouchableOpacity
                  key={typeOption.value}
                  style={[
                    styles.typeCard,
                    type === typeOption.value && styles.typeCardSelected,
                  ]}
                  onPress={() => setType(typeOption.value as any)}
                  accessibilityLabel={typeOption.label}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={typeOption.icon as any}
                    size={24}
                    color={type === typeOption.value ? '#14B8A6' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.typeCardText,
                      type === typeOption.value && styles.typeCardTextSelected,
                    ]}
                  >
                    {typeOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
                accessibilityLabel="Select time"
                accessibilityRole="button"
              >
                <View style={styles.dateTimeContent}>
                  <Ionicons name="time" size={20} color="#14B8A6" />
                  <Text style={styles.pickerButtonText}>
                    {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repeat On *</Text>
              <View style={styles.daysGrid}>
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.value) && styles.dayButtonSelected,
                    ]}
                    onPress={() => toggleDay(day.value)}
                    accessibilityLabel={day.label}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDays.includes(day.value) && styles.dayButtonTextSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title (optional)</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={`${REMINDER_TYPES.find((t) => t.value === type)?.label} Reminder`}
                placeholderTextColor="#64748B"
                accessibilityLabel="Reminder title"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={body}
                onChangeText={setBody}
                placeholder={selectedPet ? `Time to ${type} ${selectedPet.name}!` : 'Enter notification message'}
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                accessibilityLabel="Reminder message"
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
    minHeight: 80,
    paddingTop: 12,
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
  selectedPet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
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
  petOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  pickerOptionTextSelected: {
    color: '#14B8A6',
    fontWeight: '500',
  },
  noPetsMessage: {
    padding: 16,
    alignItems: 'center',
  },
  noPetsText: {
    fontSize: 14,
    color: '#64748B',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '31%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 80,
    justifyContent: 'center',
  },
  typeCardSelected: {
    borderColor: '#14B8A6',
    backgroundColor: '#134E4A',
  },
  typeCardText: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 8,
    textAlign: 'center',
  },
  typeCardTextSelected: {
    color: '#14B8A6',
    fontWeight: '500',
  },
  dateTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayButtonSelected: {
    backgroundColor: '#134E4A',
    borderColor: '#14B8A6',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dayButtonTextSelected: {
    color: '#14B8A6',
  },
});
