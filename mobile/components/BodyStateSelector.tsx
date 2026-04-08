import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius, type as typeStyles } from '../lib/theme';
import { BODY_STATES, type BodyState } from '../lib/types';

const STATE_COLORS: Record<BodyState, { border: string; bg: string }> = {
  great: { border: colors.bodyGreat, bg: '#ECFDF5' },
  calm: { border: colors.bodyCalm, bg: '#ECFEFF' },
  neutral: { border: colors.bodyNeutral, bg: '#F8FAFC' },
  resistant: { border: colors.bodyResistant, bg: '#FFFBEB' },
  difficult: { border: colors.bodyDifficult, bg: '#FEF2F2' },
};

interface BodyStateSelectorProps {
  selected: BodyState | null;
  onSelect: (state: BodyState | null) => void;
}

export default function BodyStateSelector({
  selected,
  onSelect,
}: BodyStateSelectorProps) {
  return (
    <View style={styles.container}>
      {BODY_STATES.map(({ key, emoji, label }) => {
        const isActive = selected === key;
        const stateColor = STATE_COLORS[key];
        return (
          <Pressable
            key={key}
            style={[
              styles.button,
              isActive && {
                borderColor: stateColor.border,
                backgroundColor: stateColor.bg,
              },
            ]}
            onPress={() => onSelect(isActive ? null : key)}
            accessibilityLabel={`${label} body state`}
            accessibilityState={{ selected: isActive }}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text
              style={[
                styles.label,
                isActive && { color: stateColor.border },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
    minWidth: 0,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
