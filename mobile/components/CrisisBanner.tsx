import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { AlertTriangle, Phone, X } from 'lucide-react-native';
import { colors, spacing, radius, type as typeStyles } from '../lib/theme';

interface CrisisBannerProps {
  onDismiss: () => void;
}

export default function CrisisBanner({ onDismiss }: CrisisBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.row}>
        <AlertTriangle size={20} color={colors.crisisRed} />
        <Text style={styles.title}>Need support right now?</Text>
        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          accessibilityLabel="Dismiss crisis banner"
        >
          <X size={18} color={colors.textTertiary} />
        </Pressable>
      </View>
      <Pressable
        style={styles.callButton}
        onPress={() => Linking.openURL('tel:131114')}
        accessibilityLabel="Call Lifeline"
      >
        <Phone size={16} color={colors.bgElevated} />
        <Text style={styles.callText}>Lifeline 13 11 14</Text>
      </Pressable>
      <Text style={styles.moreText}>
        Beyond Blue: 1300 22 4636 | Emergency: 000
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.crisisBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.sm,
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typeStyles.cardTitle,
    flex: 1,
    color: colors.crisisRed,
    fontSize: 14,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.crisisRed,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },
  callText: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    color: colors.bgElevated,
  },
  moreText: {
    ...typeStyles.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
