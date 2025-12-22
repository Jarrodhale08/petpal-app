import React, { memo } from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

function Input({
  label,
  error,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  inputStyle,
  ...textInputProps
}: InputProps) {
  const containerStyle = [
    styles.container,
    styles[`container_${size}`],
    styles[`container_${variant}`],
    error && styles.container_error,
    disabled && styles.container_disabled,
    style,
  ];

  const inputTextStyle = [
    styles.input,
    styles[`input_${size}`],
    styles[`input_${variant}`],
    disabled && styles.input_disabled,
    inputStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={containerStyle}>
        <TextInput
          style={inputTextStyle}
          editable={!disabled}
          placeholderTextColor="#9CA3AF"
          accessible={true}
          accessibilityLabel={label || textInputProps.placeholder}
          accessibilityRole="text"
          accessibilityState={{ disabled }}
          {...textInputProps}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  container: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  container_sm: {
    minHeight: 36,
    paddingHorizontal: 10,
  },
  container_md: {
    minHeight: 44,
    paddingHorizontal: 12,
  },
  container_lg: {
    minHeight: 52,
    paddingHorizontal: 16,
  },
  container_primary: {
    backgroundColor: '#1E293B',
    borderColor: '#14B8A6',
  },
  container_secondary: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  container_outline: {
    backgroundColor: 'transparent',
    borderColor: '#334155',
  },
  container_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  container_danger: {
    backgroundColor: '#1E293B',
    borderColor: '#EF4444',
  },
  container_error: {
    borderColor: '#EF4444',
  },
  container_disabled: {
    backgroundColor: '#334155',
    borderColor: '#475569',
    opacity: 0.6,
  },
  input: {
    color: '#F8FAFC',
    fontWeight: '400',
  },
  input_sm: {
    fontSize: 14,
    paddingVertical: 6,
  },
  input_md: {
    fontSize: 16,
    paddingVertical: 10,
  },
  input_lg: {
    fontSize: 18,
    paddingVertical: 14,
  },
  input_primary: {
    color: '#F8FAFC',
  },
  input_secondary: {
    color: '#CBD5E1',
  },
  input_outline: {
    color: '#F8FAFC',
  },
  input_ghost: {
    color: '#F8FAFC',
  },
  input_danger: {
    color: '#F8FAFC',
  },
  input_disabled: {
    color: '#9CA3AF',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export { Input };
export default memo(Input);
