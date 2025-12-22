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
import { useAppointmentStore } from '../../src/stores/appointmentStore';
import { usePetStore } from '../../src/stores/petStore';

const APPOINTMENT_TYPES = [
  { label: 'Checkup', value: 'checkup', icon: 'medkit' },
  { label: 'Vaccination', value: 'vaccination', icon: 'shield-checkmark' },
  { label: 'Grooming', value: 'grooming', icon: 'cut' },
  { label: 'Surgery', value: 'surgery', icon: 'medical' },
  { label: 'Emergency', value: 'emergency', icon: 'alert-circle' },
  { label: 'Other', value: 'other', icon: 'calendar' },
];

export default function AddAppointmentScreen() {
  const router = useRouter();
  const { petId: preselectedPetId } = useLocalSearchParams<{ petId?: string }>();

  const { addAppointment, loading } = useAppointmentStore();
  const { pets } = usePetStore();

  const [selectedPetId, setSelectedPetId] = useState(preselectedPetId || '');
  const [type, setType] = useState<'checkup' | 'vaccination' | 'grooming' | 'surgery' | 'emergency' | 'other'>('checkup');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [clinic, setClinic] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);

  const selectedPet = useMemo(() => {
    return pets.find((p) => p.id === selectedPetId);
  }, [pets, selectedPetId]);

  const validateForm = useCallback(() => {
    if (!selectedPetId) {
      Alert.alert('Validation Error', 'Please select a pet.');
      return false;
    }
    if (!type) {
      Alert.alert('Validation Error', 'Please select an appointment type.');
      return false;
    }
    return true;
  }, [selectedPetId, type]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    const appointmentData = {
      petId: selectedPetId,
      type,
      title: title.trim() || APPOINTMENT_TYPES.find((t) => t.value === type)?.label || type,
      date: date.toISOString(),
      time: time || undefined,
      veterinarian: veterinarian.trim() || undefined,
      clinic: clinic.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      reminderEnabled,
    };

    const appointmentId = await addAppointment(appointmentData);
    if (appointmentId) {
      router.back();
    } else {
      Alert.alert('Error', 'Failed to add appointment. Please try again.');
    }
  }, [selectedPetId, type, title, date, time, veterinarian, clinic, location, notes, reminderEnabled, addAppointment, router, validateForm]);

  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  const handleTimeChange = useCallback((event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
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
          <Text style={styles.headerTitle}>Add Appointment</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading}
            accessibilityLabel="Save appointment"
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
            <Text style={styles.sectionTitle}>Appointment Type *</Text>
            <View style={styles.typeGrid}>
              {APPOINTMENT_TYPES.map((typeOption) => (
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
            <Text style={styles.sectionTitle}>Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title (optional)</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={APPOINTMENT_TYPES.find((t) => t.value === type)?.label || 'Enter title'}
                placeholderTextColor="#64748B"
                accessibilityLabel="Appointment title"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
                accessibilityLabel="Select date"
                accessibilityRole="button"
              >
                <View style={styles.dateTimeContent}>
                  <Ionicons name="calendar" size={20} color="#14B8A6" />
                  <Text style={styles.pickerButtonText}>
                    {date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time (optional)</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
                accessibilityLabel="Select time"
                accessibilityRole="button"
              >
                <View style={styles.dateTimeContent}>
                  <Ionicons name="time" size={20} color="#14B8A6" />
                  <Text style={time ? styles.pickerButtonText : styles.pickerPlaceholder}>
                    {time || 'Select time'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clinic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Veterinarian</Text>
              <TextInput
                style={styles.input}
                value={veterinarian}
                onChangeText={setVeterinarian}
                placeholder="Dr. Smith"
                placeholderTextColor="#64748B"
                accessibilityLabel="Veterinarian name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Clinic Name</Text>
              <TextInput
                style={styles.input}
                value={clinic}
                onChangeText={setClinic}
                placeholder="City Pet Clinic"
                placeholderTextColor="#64748B"
                accessibilityLabel="Clinic name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="123 Main St, City"
                placeholderTextColor="#64748B"
                accessibilityLabel="Clinic address"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Additional notes"
              />
            </View>

            <TouchableOpacity
              style={styles.reminderToggle}
              onPress={() => setReminderEnabled(!reminderEnabled)}
              accessibilityLabel="Toggle reminder"
              accessibilityRole="switch"
            >
              <View style={styles.reminderContent}>
                <Ionicons name="notifications" size={20} color="#14B8A6" />
                <View style={styles.reminderText}>
                  <Text style={styles.reminderTitle}>Reminder</Text>
                  <Text style={styles.reminderSubtitle}>Get notified before appointment</Text>
                </View>
              </View>
              <View style={[styles.toggle, reminderEnabled && styles.toggleEnabled]}>
                <View style={[styles.toggleKnob, reminderEnabled && styles.toggleKnobEnabled]} />
              </View>
            </TouchableOpacity>
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
    minHeight: 100,
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
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderText: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  reminderSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleEnabled: {
    backgroundColor: '#14B8A6',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobEnabled: {
    alignSelf: 'flex-end',
  },
});
