import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Image, ImageStyle } from 'react-native';

interface AvatarProps {
  name?: string;
  imageUri?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

function Avatar({
  name,
  imageUri,
  variant = 'primary',
  size = 'md',
  style,
}: AvatarProps) {
  const getInitials = (fullName?: string): string => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  };

  const variantStyles = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    outline: styles.variantOutline,
    ghost: styles.variantGhost,
    danger: styles.variantDanger,
  };

  const textSizeStyles = {
    sm: styles.textSm,
    md: styles.textMd,
    lg: styles.textLg,
  };

  const textVariantStyles = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    outline: styles.textOutline,
    ghost: styles.textGhost,
    danger: styles.textDanger,
  };

  const imageSizeStyles = {
    sm: styles.imageSm,
    md: styles.imageMd,
    lg: styles.imageLg,
  };

  return (
    <View
      style={[
        styles.container,
        sizeStyles[size],
        variantStyles[variant],
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={name ? `Avatar for ${name}` : 'Avatar'}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, imageSizeStyles[size]]}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text
          style={[
            styles.text,
            textSizeStyles[size],
            textVariantStyles[variant],
          ]}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sizeSm: {
    width: 32,
    height: 32,
    minHeight: 32,
    minWidth: 32,
  },
  sizeMd: {
    width: 44,
    height: 44,
    minHeight: 44,
    minWidth: 44,
  },
  sizeLg: {
    width: 64,
    height: 64,
    minHeight: 64,
    minWidth: 64,
  },
  variantPrimary: {
    backgroundColor: '#14B8A6',
  },
  variantSecondary: {
    backgroundColor: '#6B7280',
  },
  variantOutline: {
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  variantGhost: {
    backgroundColor: '#334155',
  },
  variantDanger: {
    backgroundColor: '#EF4444',
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 16,
  },
  textLg: {
    fontSize: 24,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#14B8A6',
  },
  textGhost: {
    color: '#6B7280',
  },
  textDanger: {
    color: '#FFFFFF',
  },
  image: {
    resizeMode: 'cover',
  },
  imageSm: {
    width: 32,
    height: 32,
  },
  imageMd: {
    width: 44,
    height: 44,
  },
  imageLg: {
    width: 64,
    height: 64,
  },
});

export { Avatar };
export default memo(Avatar);
