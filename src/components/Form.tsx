import React, { memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

interface FormButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const FormInput = memo(({
  label,
  error,
  required = false,
  containerStyle,
  style,
  ...props
}: FormInputProps) => {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style as TextStyle,
        ]}
        placeholderTextColor="#9CA3AF"
        accessibilityLabel={label}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

export const FormButton = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: FormButtonProps) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    styles[`buttonText_${variant}`],
    styles[`buttonText_${size}`],
    disabled && styles.buttonTextDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      <Text style={textStyles}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
});

interface FormProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

function Form({ children, style }: FormProps) {
  return (
    <View style={[styles.form, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#F8FAFC',
    backgroundColor: '#1E293B',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
  },
  button_primary: {
    backgroundColor: '#14B8A6',
  },
  button_secondary: {
    backgroundColor: '#6B7280',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_danger: {
    backgroundColor: '#EF4444',
  },
  button_sm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  button_md: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  button_lg: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonText_primary: {
    color: '#FFFFFF',
  },
  buttonText_secondary: {
    color: '#FFFFFF',
  },
  buttonText_outline: {
    color: '#14B8A6',
  },
  buttonText_ghost: {
    color: '#14B8A6',
  },
  buttonText_danger: {
    color: '#FFFFFF',
  },
  buttonText_sm: {
    fontSize: 14,
  },
  buttonText_md: {
    fontSize: 16,
  },
  buttonText_lg: {
    fontSize: 18,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});

export default memo(Form);
