import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  onActionPress?: () => void;
  actionLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showBackButton?: boolean;
  showActionButton?: boolean;
  centerTitle?: boolean;
  style?: ViewStyle;
}

function Header({
  title = 'Header',
  subtitle,
  onBackPress,
  onActionPress,
  actionLabel,
  variant = 'primary',
  size = 'md',
  showBackButton = false,
  showActionButton = false,
  centerTitle = false,
  style,
}: HeaderProps) {
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.container,
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: '#14B8A6' };
      case 'secondary':
        return { ...baseStyle, backgroundColor: '#6B7280' };
      case 'outline':
        return { ...baseStyle, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#14B8A6' };
      case 'ghost':
        return { ...baseStyle, backgroundColor: 'transparent' };
      case 'danger':
        return { ...baseStyle, backgroundColor: '#EF4444' };
      default:
        return baseStyle;
    }
  };

  const getHeightStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { minHeight: 44, paddingVertical: 8 };
      case 'md':
        return { minHeight: 56, paddingVertical: 12 };
      case 'lg':
        return { minHeight: 72, paddingVertical: 16 };
      default:
        return { minHeight: 56, paddingVertical: 12 };
    }
  };

  const getTitleStyle = (): TextStyle => {
    const baseColor = variant === 'outline' || variant === 'ghost' ? '#1F2937' : '#FFFFFF';
    
    switch (size) {
      case 'sm':
        return { ...styles.title, fontSize: 16, color: baseColor };
      case 'md':
        return { ...styles.title, fontSize: 18, color: baseColor };
      case 'lg':
        return { ...styles.title, fontSize: 22, color: baseColor };
      default:
        return { ...styles.title, color: baseColor };
    }
  };

  const getSubtitleStyle = (): TextStyle => {
    const baseColor = variant === 'outline' || variant === 'ghost' ? '#6B7280' : '#FFFFFF';
    
    switch (size) {
      case 'sm':
        return { ...styles.subtitle, fontSize: 12, color: baseColor };
      case 'md':
        return { ...styles.subtitle, fontSize: 14, color: baseColor };
      case 'lg':
        return { ...styles.subtitle, fontSize: 16, color: baseColor };
      default:
        return { ...styles.subtitle, color: baseColor };
    }
  };

  const getButtonTextStyle = (): TextStyle => {
    const baseColor = variant === 'outline' || variant === 'ghost' ? '#14B8A6' : '#FFFFFF';
    
    switch (size) {
      case 'sm':
        return { ...styles.buttonText, fontSize: 14, color: baseColor };
      case 'md':
        return { ...styles.buttonText, fontSize: 16, color: baseColor };
      case 'lg':
        return { ...styles.buttonText, fontSize: 18, color: baseColor };
      default:
        return { ...styles.buttonText, color: baseColor };
    }
  };

  return (
    <View style={[getContainerStyle(), getHeightStyle(), style]} accessibilityRole="header">
      <View style={styles.content}>
        {showBackButton && onBackPress && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={getButtonTextStyle()}>←</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.titleContainer, centerTitle && styles.titleCentered]}>
          <Text style={getTitleStyle()} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={getSubtitleStyle()} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {showActionButton && onActionPress && actionLabel && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onActionPress}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={getButtonTextStyle()}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleCentered: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: 2,
    opacity: 0.9,
  },
  actionButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export { Header };
export default memo(Header);
