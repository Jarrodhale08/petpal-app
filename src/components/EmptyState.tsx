import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

function EmptyState({
  icon = 'albums-outline',
  title = 'No items found',
  message = 'There are no items to display at this time.',
  actionText,
  onAction,
  variant = 'primary',
  size = 'md',
  style,
}: EmptyStateProps) {
  const iconSize = size === 'sm' ? 48 : size === 'lg' ? 80 : 64;
  const titleSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const messageSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  const spacing = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;

  const iconColor = variant === 'danger' ? '#EF4444' : variant === 'secondary' ? '#6B7280' : '#14B8A6';
  const titleColor = variant === 'ghost' ? '#9CA3AF' : '#1F2937';
  const messageColor = '#6B7280';

  return (
    <View style={[styles.container, { paddingVertical: spacing * 3 }, style]} accessibilityRole="text">
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <Text style={[styles.title, { fontSize: titleSize, marginTop: spacing, color: titleColor }]}>
        {title}
      </Text>
      {message && (
        <Text style={[styles.message, { fontSize: messageSize, marginTop: spacing / 2, color: messageColor }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export { EmptyState };
export default memo(EmptyState);
