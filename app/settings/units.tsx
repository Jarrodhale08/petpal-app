import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type UnitOption = {
  id: string;
  label: string;
  description: string;
};

export default function UnitsScreen() {
  const [selectedUnits, setSelectedUnits] = useState({
    weight: 'lbs',
    temperature: 'f',
  });

  const weightOptions: UnitOption[] = [
    { id: 'lbs', label: 'Pounds (lbs)', description: 'US standard' },
    { id: 'kg', label: 'Kilograms (kg)', description: 'Metric' },
  ];

  const temperatureOptions: UnitOption[] = [
    { id: 'f', label: 'Fahrenheit (F)', description: 'US standard' },
    { id: 'c', label: 'Celsius (C)', description: 'Metric' },
  ];

  const renderOptionGroup = (
    title: string,
    options: UnitOption[],
    selectedValue: string,
    onSelect: (id: string) => void
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionGroup}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              selectedValue === option.id && styles.optionSelected,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionLabel,
                  selectedValue === option.id && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            {selectedValue === option.id && (
              <Ionicons name="checkmark-circle" size={24} color="#14B8A6" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <Text style={styles.header}>
          Choose your preferred units of measurement for tracking your pets.
        </Text>

        {renderOptionGroup('Pet Weight', weightOptions, selectedUnits.weight, (id) =>
          setSelectedUnits({ ...selectedUnits, weight: id })
        )}

        {renderOptionGroup('Temperature', temperatureOptions, selectedUnits.temperature, (id) =>
          setSelectedUnits({ ...selectedUnits, temperature: id })
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
  optionGroup: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    minHeight: 64,
  },
  optionSelected: {
    backgroundColor: '#134E4A',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  optionLabelSelected: {
    color: '#14B8A6',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});
