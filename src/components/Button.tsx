import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

function Button({
  title = 'Button',
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const containerStyles: ViewStyle[] = [
    styles.container,
    styles[`${variant}Container` as keyof typeof styles] as ViewStyle,
    styles[`${size}Container` as keyof typeof styles] as ViewStyle,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
  ];

  if (disabled || loading) {
    containerStyles.push(styles.disabledContainer);
    textStyles.push(styles.disabledText);
  }

  if (style) {
    containerStyles.push(style);
  }

  const getSpinnerColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') {
      return '#14B8A6';
    }
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
  },
  primaryContainer: {
    backgroundColor: '#14B8A6',
  },
  secondaryContainer: {
    backgroundColor: '#6B7280',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: '#EF4444',
  },
  smContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  mdContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  lgContainer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 52,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#14B8A6',
  },
  ghostText: {
    color: '#14B8A6',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 1,
  },
});

export { Button };
export default memo(Button);
