import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, type as typeStyles } from '../lib/theme';
import type { RBTItem } from '../lib/types';

type Variant = 'rose' | 'bud' | 'thorn';

const VARIANT_CONFIG: Record<Variant, { bg: string; accent: string; label: string }> = {
  rose: { bg: colors.roseLight, accent: colors.rose, label: 'ROSE' },
  bud: { bg: colors.budLight, accent: colors.bud, label: 'BUD' },
  thorn: { bg: colors.thornLight, accent: colors.thorn, label: 'THORN' },
};

interface RBTCardProps {
  variant: Variant;
  data: RBTItem;
}

export default function RBTCard({ variant, data }: RBTCardProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <View style={[styles.card, { backgroundColor: config.bg, borderTopColor: config.accent }]}>
      <Text style={[styles.label, { color: config.accent }]}>{config.label}</Text>
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.body}>{data.body}</Text>
      {data.quote ? (
        <View style={[styles.quoteBar, { borderLeftColor: config.accent }]}>
          <Text style={styles.quote}>"{data.quote}"</Text>
        </View>
      ) : null}
      {data.tags.length > 0 && (
        <View style={styles.tags}>
          {data.tags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { borderColor: config.accent }]}
            >
              <Text style={[styles.tagText, { color: config.accent }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderTopWidth: 4,
    padding: spacing.base,
    gap: spacing.sm,
  },
  label: {
    ...typeStyles.overline,
    fontFamily: 'DMSans-Bold',
  },
  title: {
    ...typeStyles.cardTitle,
  },
  body: {
    ...typeStyles.body,
    color: colors.textSecondary,
  },
  quoteBar: {
    borderLeftWidth: 2,
    paddingLeft: spacing.md,
  },
  quote: {
    ...typeStyles.caption,
    fontStyle: 'italic',
    color: colors.textTertiary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.bgElevated,
  },
  tagText: {
    ...typeStyles.caption,
    fontFamily: 'DMSans-Medium',
  },
});
