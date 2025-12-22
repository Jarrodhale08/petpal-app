import React, { useState, useCallback, useMemo, useRef } from 'react';
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
import { Swipeable } from 'react-native-gesture-handler';
import { useNotificationStore } from '../src/stores/notificationStore';
import { usePetStore } from '../src/stores/petStore';
import { PetReminder } from '../src/services/notification.service';

const REMINDER_TYPE_ICONS: Record<string, string> = {
  feeding: 'restaurant',
  walk: 'walk',
  medication: 'medical',
  grooming: 'cut',
  vet: 'medkit',
  vaccination: 'shield-checkmark',
  custom: 'create',
};

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RemindersScreen() {
  const router = useRouter();
  const { pets } = usePetStore();
  const { petReminders, deletePetReminder, togglePetReminder, settings } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const swipeableRefs = useRef<Map<string, Swipeable | null>>(new Map());
  const currentlyOpenSwipeable = useRef<string | null>(null);

  const filteredReminders = useMemo(() => {
    let filtered = petReminders;
    if (selectedPetId) {
      filtered = filtered.filter((r) => r.petId === selectedPetId);
    }
    return filtered.sort((a, b) => {
      // Sort by enabled status first, then by time
      if (a.enabled !== b.enabled) return b.enabled ? 1 : -1;
      const aTime = a.time.hour * 60 + a.time.minute;
      const bTime = b.time.hour * 60 + b.time.minute;
      return aTime - bTime;
    });
  }, [petReminders, selectedPetId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Reminders are stored locally, refresh just resets the state
    setRefreshing(false);
  }, []);

  const handleSwipeOpen = useCallback((reminderId: string) => {
    if (currentlyOpenSwipeable.current && currentlyOpenSwipeable.current !== reminderId) {
      swipeableRefs.current.get(currentlyOpenSwipeable.current)?.close();
    }
    currentlyOpenSwipeable.current = reminderId;
  }, []);

  const handleDelete = useCallback(async (reminder: PetReminder) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${reminder.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePetReminder(reminder.id);
          },
        },
      ]
    );
  }, [deletePetReminder]);

  const handleToggle = useCallback(async (reminder: PetReminder) => {
    await togglePetReminder(reminder.id);
  }, [togglePetReminder]);

  const formatTime = useCallback((time: { hour: number; minute: number }) => {
    const date = new Date();
    date.setHours(time.hour, time.minute);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }, []);

  const formatDays = useCallback((days: number[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map((d) => DAYS_SHORT[d]).join(', ');
  }, []);

  const renderRightActions = useCallback((reminder: PetReminder) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => handleDelete(reminder)}
      accessibilityLabel="Delete reminder"
      accessibilityRole="button"
    >
      <Ionicons name="trash" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  ), [handleDelete]);

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
        <Text style={styles.headerTitle}>Reminders</Text>
        <TouchableOpacity
          onPress={() => router.push('/reminder/add')}
          style={styles.addButton}
          accessibilityLabel="Add reminder"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#14B8A6" />
        </TouchableOpacity>
      </View>

      {!settings.pushEnabled && (
        <View style={styles.warningSection}>
          <View style={styles.warningCard}>
            <Ionicons name="notifications-off" size={24} color="#F59E0B" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Notifications Disabled</Text>
              <Text style={styles.warningText}>
                Enable push notifications in settings to receive reminders
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/settings')}
              style={styles.warningButton}
            >
              <Text style={styles.warningButtonText}>Settings</Text>
            </TouchableOpacity>
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
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#64748B" />
            <Text style={styles.emptyTitle}>No Reminders</Text>
            <Text style={styles.emptyText}>
              Set up reminders for feeding, walks, medications, and more
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/reminder/add')}
              accessibilityLabel="Add first reminder"
              accessibilityRole="button"
            >
              <Text style={styles.emptyButtonText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {filteredReminders.map((reminder) => (
              <Swipeable
                key={reminder.id}
                ref={(ref) => swipeableRefs.current.set(reminder.id, ref)}
                renderRightActions={() => renderRightActions(reminder)}
                onSwipeableOpen={() => handleSwipeOpen(reminder.id)}
                overshootRight={false}
              >
                <View style={[styles.reminderCard, !reminder.enabled && styles.reminderCardDisabled]}>
                  <TouchableOpacity
                    style={styles.reminderContent}
                    onPress={() => handleToggle(reminder)}
                    accessibilityLabel={`${reminder.title}, ${reminder.enabled ? 'enabled' : 'disabled'}`}
                    accessibilityRole="button"
                  >
                    <View style={[
                      styles.reminderIconContainer,
                      !reminder.enabled && styles.reminderIconDisabled,
                    ]}>
                      <Ionicons
                        name={(REMINDER_TYPE_ICONS[reminder.type] || 'notifications') as any}
                        size={24}
                        color={reminder.enabled ? '#14B8A6' : '#64748B'}
                      />
                    </View>
                    <View style={styles.reminderInfo}>
                      <Text style={[styles.reminderTitle, !reminder.enabled && styles.reminderTitleDisabled]}>
                        {reminder.title}
                      </Text>
                      <Text style={styles.reminderPet}>{reminder.petName}</Text>
                      <View style={styles.reminderSchedule}>
                        <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
                        <Text style={styles.reminderDays}>{formatDays(reminder.daysOfWeek)}</Text>
                      </View>
                    </View>
                    <View style={[styles.toggle, reminder.enabled && styles.toggleEnabled]}>
                      <View style={[styles.toggleKnob, reminder.enabled && styles.toggleKnobEnabled]} />
                    </View>
                  </TouchableOpacity>
                </View>
              </Swipeable>
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
  addButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningSection: {
    padding: 16,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  warningButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  warningButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
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
  remindersList: {
    gap: 12,
  },
  reminderCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reminderCardDisabled: {
    opacity: 0.7,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  reminderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#134E4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderIconDisabled: {
    backgroundColor: '#334155',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  reminderTitleDisabled: {
    color: '#94A3B8',
  },
  reminderPet: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  reminderSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderTime: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
  },
  reminderDays: {
    fontSize: 12,
    color: '#64748B',
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
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});
