import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

function LoadingSpinner({
  variant = 'primary',
  size = 'md',
  style,
}: LoadingSpinnerProps) {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'small' as const;
      case 'lg':
        return 'large' as const;
      case 'md':
      default:
        return 24;
    }
  };

  const getSpinnerColor = () => {
    switch (variant) {
      case 'primary':
        return '#14B8A6';
      case 'secondary':
        return '#6B7280';
      case 'outline':
        return '#14B8A6';
      case 'ghost':
        return '#6B7280';
      case 'danger':
        return '#EF4444';
      default:
        return '#14B8A6';
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 64;
      case 'md':
      default:
        return 44;
    }
  };

  const containerSize = getContainerSize();

  return (
    <View
      style={[
        styles.container,
        { minHeight: containerSize, minWidth: containerSize },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <ActivityIndicator
        size={getSpinnerSize()}
        color={getSpinnerColor()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { LoadingSpinner };
export default memo(LoadingSpinner);
