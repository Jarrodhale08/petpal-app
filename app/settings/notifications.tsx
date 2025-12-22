import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '../../src/stores/notificationStore';
import { usePetStore } from '../../src/stores/petStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const { settings, updateSettings, petReminders, deletePetReminder, togglePetReminder } = useNotificationStore();
  const { pets } = usePetStore();

  const handleToggleSetting = useCallback(async (key: keyof typeof settings) => {
    if (key === 'pushEnabled' && settings.pushEnabled) {
      Alert.alert(
        'Disable Notifications',
        'This will turn off all pet reminders and alerts. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => updateSettings({ [key]: false }),
          },
        ]
      );
      return;
    }
    await updateSettings({ [key]: !settings[key] });
  }, [settings, updateSettings]);

  const handleAddReminder = useCallback(() => {
    if (pets.length === 0) {
      Alert.alert(
        'No Pets',
        'Add a pet first before creating reminders.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.push('/reminder/add' as any);
  }, [pets, router]);

  const handleDeleteReminder = useCallback((id: string, petName: string) => {
    Alert.alert(
      'Delete Reminder',
      `Remove this reminder for ${petName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePetReminder(id),
        },
      ]
    );
  }, [deletePetReminder]);

  const getReminderTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'feeding': return 'restaurant-outline';
      case 'walk': return 'walk-outline';
      case 'medication': return 'medkit-outline';
      case 'grooming': return 'cut-outline';
      case 'vet': return 'medical-outline';
      case 'vaccination': return 'shield-checkmark-outline';
      default: return 'notifications-outline';
    }
  };

  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const getDayLabels = (days: number[]): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(1) && !days.includes(7)) return 'Weekdays';
    if (days.length === 2 && days.includes(1) && days.includes(7)) return 'Weekends';
    return days.map(d => dayNames[d - 1]).join(', ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>

          <View style={styles.option}>
            <Ionicons name="notifications-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Enable Notifications</Text>
              <Text style={styles.optionDescription}>Receive push notifications</Text>
            </View>
            <Switch
              value={settings.pushEnabled}
              onValueChange={() => handleToggleSetting('pushEnabled')}
              trackColor={{ false: '#334155', true: '#14B8A6' }}
              thumbColor={settings.pushEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>

          <View style={styles.option}>
            <Ionicons name="alarm-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Pet Care Reminders</Text>
              <Text style={styles.optionDescription}>Feeding, walks, medications</Text>
            </View>
            <Switch
              value={settings.reminders}
              onValueChange={() => handleToggleSetting('reminders')}
              trackColor={{ false: '#334155', true: '#14B8A6' }}
              thumbColor={settings.reminders ? '#FFFFFF' : '#9CA3AF'}
              disabled={!settings.pushEnabled}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="calendar-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Appointment Reminders</Text>
              <Text style={styles.optionDescription}>Vet visits and checkups</Text>
            </View>
            <Switch
              value={settings.appointmentReminders}
              onValueChange={() => handleToggleSetting('appointmentReminders')}
              trackColor={{ false: '#334155', true: '#14B8A6' }}
              thumbColor={settings.appointmentReminders ? '#FFFFFF' : '#9CA3AF'}
              disabled={!settings.pushEnabled}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="trophy-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Achievements</Text>
              <Text style={styles.optionDescription}>Pet care milestones</Text>
            </View>
            <Switch
              value={settings.achievements}
              onValueChange={() => handleToggleSetting('achievements')}
              trackColor={{ false: '#334155', true: '#14B8A6' }}
              thumbColor={settings.achievements ? '#FFFFFF' : '#9CA3AF'}
              disabled={!settings.pushEnabled}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="stats-chart-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Weekly Report</Text>
              <Text style={styles.optionDescription}>Pet care summary</Text>
            </View>
            <Switch
              value={settings.weeklyReport}
              onValueChange={() => handleToggleSetting('weeklyReport')}
              trackColor={{ false: '#334155', true: '#14B8A6' }}
              thumbColor={settings.weeklyReport ? '#FFFFFF' : '#9CA3AF'}
              disabled={!settings.pushEnabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pet Reminders</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddReminder}
            >
              <Ionicons name="add-circle" size={24} color="#14B8A6" />
            </TouchableOpacity>
          </View>

          {petReminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color="#334155" />
              <Text style={styles.emptyStateText}>No reminders set</Text>
              <Text style={styles.emptyStateSubtext}>
                Add reminders for feeding, walks, medications, and more
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleAddReminder}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Add Reminder</Text>
              </TouchableOpacity>
            </View>
          ) : (
            petReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderIcon}>
                  <Ionicons
                    name={getReminderTypeIcon(reminder.type)}
                    size={24}
                    color={reminder.enabled ? '#14B8A6' : '#64748B'}
                  />
                </View>
                <View style={styles.reminderContent}>
                  <Text style={[
                    styles.reminderTitle,
                    !reminder.enabled && styles.reminderTitleDisabled
                  ]}>
                    {reminder.title}
                  </Text>
                  <Text style={styles.reminderPet}>{reminder.petName}</Text>
                  <Text style={styles.reminderTime}>
                    {formatTime(reminder.time.hour, reminder.time.minute)} • {getDayLabels(reminder.daysOfWeek)}
                  </Text>
                </View>
                <View style={styles.reminderActions}>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => togglePetReminder(reminder.id)}
                    trackColor={{ false: '#334155', true: '#14B8A6' }}
                    thumbColor={reminder.enabled ? '#FFFFFF' : '#9CA3AF'}
                    disabled={!settings.pushEnabled || !settings.reminders}
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteReminder(reminder.id, reminder.petName)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  addButton: {
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    minHeight: 72,
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  emptyStateButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  reminderCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  reminderTitleDisabled: {
    color: '#64748B',
  },
  reminderPet: {
    fontSize: 14,
    color: '#14B8A6',
    marginTop: 2,
  },
  reminderTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
});
