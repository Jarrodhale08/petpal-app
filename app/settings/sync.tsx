import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SyncScreen() {
  const [settings, setSettings] = useState({
    autoSync: true,
    syncOnWifiOnly: true,
    backgroundSync: false,
  });

  const [lastSync, setLastSync] = useState<Date | null>(new Date());

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSyncNow = () => {
    Alert.alert('Sync Started', 'Your data is being synchronized...');
    setLastSync(new Date());
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.syncStatus}>
          <View style={styles.syncStatusIcon}>
            <Ionicons name="cloud-done-outline" size={48} color="#14B8A6" />
          </View>
          <Text style={styles.syncStatusText}>Data Synced</Text>
          <Text style={styles.syncStatusTime}>Last sync: {formatLastSync(lastSync)}</Text>
          <TouchableOpacity style={styles.syncButton} onPress={handleSyncNow}>
            <Ionicons name="sync-outline" size={20} color="#FFFFFF" />
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Settings</Text>

          <View style={styles.option}>
            <Ionicons name="sync-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Auto Sync</Text>
              <Text style={styles.optionDescription}>Automatically sync data</Text>
            </View>
            <Switch
              value={settings.autoSync}
              onValueChange={() => toggleSetting('autoSync')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.autoSync ? '#14B8A6' : '#9CA3AF'}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="wifi-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Wi-Fi Only</Text>
              <Text style={styles.optionDescription}>Only sync on Wi-Fi</Text>
            </View>
            <Switch
              value={settings.syncOnWifiOnly}
              onValueChange={() => toggleSetting('syncOnWifiOnly')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.syncOnWifiOnly ? '#14B8A6' : '#9CA3AF'}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="moon-outline" size={24} color="#14B8A6" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Background Sync</Text>
              <Text style={styles.optionDescription}>Sync when app is closed</Text>
            </View>
            <Switch
              value={settings.backgroundSync}
              onValueChange={() => toggleSetting('backgroundSync')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.backgroundSync ? '#14B8A6' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color="#6366F1" />
          <Text style={styles.infoText}>
            Your data is stored locally and synced securely when enabled.
          </Text>
        </View>
      </View>
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
  syncStatus: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  syncStatusIcon: {
    marginBottom: 12,
  },
  syncStatusText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  syncStatusTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4F46E5',
    lineHeight: 20,
  },
});
