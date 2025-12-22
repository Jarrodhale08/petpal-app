import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryButtonText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  showIcon?: boolean;
}

function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  retryButtonText = 'Retry',
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  showIcon = true,
}: ErrorStateProps) {
  const containerStyle = [styles.container, style];
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const titleStyle = [
    styles.title,
    size === 'sm' && styles.titleSm,
    size === 'lg' && styles.titleLg,
  ];
  const messageStyle = [
    styles.message,
    size === 'sm' && styles.messageSm,
    size === 'lg' && styles.messageLg,
  ];

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle[] = [styles.button];
    
    if (size === 'sm') baseStyle.push(styles.buttonSm);
    if (size === 'lg') baseStyle.push(styles.buttonLg);
    if (disabled) baseStyle.push(styles.buttonDisabled);

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.buttonPrimary);
        break;
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        break;
      case 'ghost':
        baseStyle.push(styles.buttonGhost);
        break;
      case 'danger':
        baseStyle.push(styles.buttonDanger);
        break;
    }

    return StyleSheet.flatten(baseStyle);
  };

  const getButtonTextStyle = (): TextStyle => {
    const baseStyle: TextStyle[] = [styles.buttonText];
    
    if (size === 'sm') baseStyle.push(styles.buttonTextSm);
    if (size === 'lg') baseStyle.push(styles.buttonTextLg);

    switch (variant) {
      case 'primary':
        baseStyle.push(styles.buttonTextPrimary);
        break;
      case 'secondary':
        baseStyle.push(styles.buttonTextSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.buttonTextOutline);
        break;
      case 'ghost':
        baseStyle.push(styles.buttonTextGhost);
        break;
      case 'danger':
        baseStyle.push(styles.buttonTextDanger);
        break;
    }

    return StyleSheet.flatten(baseStyle);
  };

  return (
    <View style={containerStyle} accessibilityRole="alert">
      {showIcon && (
        <Ionicons 
          name="alert-circle-outline" 
          size={iconSize} 
          color="#EF4444" 
          style={styles.icon}
        />
      )}
      <Text style={titleStyle} accessibilityLabel={title}>
        {title}
      </Text>
      <Text style={messageStyle} accessibilityLabel={message}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={getButtonStyle()}
          onPress={onRetry}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={retryButtonText}
          accessibilityState={{ disabled }}
        >
          <Text style={getButtonTextStyle()}>{retryButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleSm: {
    fontSize: 16,
  },
  titleLg: {
    fontSize: 20,
  },
  message: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  messageSm: {
    fontSize: 12,
    lineHeight: 18,
  },
  messageLg: {
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  buttonSm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  buttonLg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: '#14B8A6',
  },
  buttonSecondary: {
    backgroundColor: '#6B7280',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSm: {
    fontSize: 14,
  },
  buttonTextLg: {
    fontSize: 18,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  buttonTextOutline: {
    color: '#14B8A6',
  },
  buttonTextGhost: {
    color: '#14B8A6',
  },
  buttonTextDanger: {
    color: '#FFFFFF',
  },
});

export { ErrorState };
export default memo(ErrorState);
