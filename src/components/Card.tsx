import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface CardProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  accessibilityLabel?: string;
}

function Card({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  titleStyle,
  accessibilityLabel,
}: CardProps) {
  const containerStyles = [
    styles.container,
    styles[`container_${size}`],
    styles[`container_${variant}`],
    disabled && styles.container_disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    disabled && styles.text_disabled,
    titleStyle,
  ];

  const content = (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#14B8A6'}
          style={styles.loader}
        />
      )}
      {title && <Text style={textStyles}>{title}</Text>}
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading }}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyles} accessibilityLabel={accessibilityLabel || title}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    flexDirection: 'row',
  },
  container_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  container_md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  container_lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  container_primary: {
    backgroundColor: '#14B8A6',
  },
  container_secondary: {
    backgroundColor: '#6B7280',
  },
  container_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#14B8A6',
  },
  container_ghost: {
    backgroundColor: 'transparent',
  },
  container_danger: {
    backgroundColor: '#EF4444',
  },
  container_disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#FFFFFF',
  },
  text_outline: {
    color: '#14B8A6',
  },
  text_ghost: {
    color: '#14B8A6',
  },
  text_danger: {
    color: '#FFFFFF',
  },
  text_disabled: {
    opacity: 1,
  },
  loader: {
    marginRight: 8,
  },
});

export { Card };
export default memo(Card);
