import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

// 1. Define the allowed variants. We include 'default' and 'accent' as requested.
export type BadgeVariant = 'default' | 'accent' | 'success';

// 2. Define the props the component accepts.
interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;      // Allows overriding wrapper styles if absolutely necessary
  textStyle?: TextStyle;  // Allows overriding text styles if absolutely necessary
}

// 3. The Main Component
export function Badge({ label, variant = 'default', style, textStyle }: BadgeProps) {
  return (
    <View style={[styles.base, variantStyles[variant], style]}>
      <Text style={[styles.text, variantTextStyles[variant], textStyle]}>
        {label}
      </Text>
    </View>
  );
}

// 4. Base Styles using theme tokens
const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start', // Ensures the badge hugs its content instead of stretching full width
  },
  text: {
    ...typography.label, // Using the label typography preset for medium weight, small text
  },
});

// 5. Variant-specific Wrapper Styles
const variantStyles: Record<BadgeVariant, ViewStyle> = {
  default: { backgroundColor: colors.backgroundSecondary },
  accent: { backgroundColor: colors.coral },
  success: { backgroundColor: colors.success },
};

// 6. Variant-specific Text Styles
const variantTextStyles: Record<BadgeVariant, TextStyle> = {
  default: { color: colors.textPrimary },
  accent: { color: colors.textInverse },
  success: { color: colors.textInverse },
};