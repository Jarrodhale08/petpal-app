import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function GoalsScreen() {
  const [goals, setGoals] = useState({
    dailyWalks: '2',
    dailyPlaytime: '30',
    dailyFeedings: '2',
    weeklyGrooming: '1',
  });

  const handleSave = useCallback(() => {
    Keyboard.dismiss();
    Alert.alert('Success', 'Your pet care goals have been updated!');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>
            Set goals to ensure your pets receive the best care possible.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="walk-outline" size={24} color="#14B8A6" />
                <Text style={styles.goalTitle}>Daily Walks</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.dailyWalks}
                  onChangeText={(text) =>
                    setGoals({ ...goals, dailyWalks: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="2"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>walks/day</Text>
              </View>
              <Text style={styles.goalHint}>Recommended: 2-3 walks per day for dogs</Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="game-controller-outline" size={24} color="#14B8A6" />
                <Text style={styles.goalTitle}>Daily Playtime</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.dailyPlaytime}
                  onChangeText={(text) =>
                    setGoals({ ...goals, dailyPlaytime: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="30"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>minutes</Text>
              </View>
              <Text style={styles.goalHint}>Interactive play keeps pets healthy and happy</Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="restaurant-outline" size={24} color="#14B8A6" />
                <Text style={styles.goalTitle}>Daily Feedings</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.dailyFeedings}
                  onChangeText={(text) =>
                    setGoals({ ...goals, dailyFeedings: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="2"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>meals/day</Text>
              </View>
              <Text style={styles.goalHint}>Consistent feeding schedule is important</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Goals</Text>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="cut-outline" size={24} color="#14B8A6" />
                <Text style={styles.goalTitle}>Weekly Grooming</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.weeklyGrooming}
                  onChangeText={(text) =>
                    setGoals({ ...goals, weeklyGrooming: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="1"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>sessions/week</Text>
              </View>
              <Text style={styles.goalHint}>Brushing, nail trims, and coat care</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Goals</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
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
  goalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginLeft: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    minHeight: 50,
  },
  inputUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
    minWidth: 100,
  },
  goalHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
