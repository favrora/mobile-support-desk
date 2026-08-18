import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';

type Option = {
  label: string;
  value: string;
};

type SegmentedControlProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

export function SegmentedControl({ options, value, onChange, compact }: SegmentedControlProps) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              compact && styles.optionCompact,
              selected && styles.optionSelected,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 7,
    backgroundColor: colors.surfaceMuted,
  },
  option: {
    minHeight: 34,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  optionCompact: {
    minHeight: 30,
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.surface,
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
      default: {
        shadowColor: '#000000',
        shadowOpacity: 0.08,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      },
    }),
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
});
