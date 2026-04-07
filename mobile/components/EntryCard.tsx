import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, radius, type as typeStyles } from '../lib/theme';
import type { JournalEntry } from '../lib/types';

const BODY_STATE_EMOJI: Record<string, string> = {
  great: '😊',
  calm: '😌',
  neutral: '😐',
  resistant: '😤',
  difficult: '😰',
};

interface EntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
}

export default function EntryCard({ entry, onPress }: EntryCardProps) {
  const date = new Date(entry.createdAt);
  const timeStr = date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const emoji = entry.bodyState ? BODY_STATE_EMOJI[entry.bodyState] : null;
  const moodLabel = entry.insights?.mood_label;
  const title = entry.title || moodLabel || (entry.isDraft ? 'Draft entry' : 'Journal entry');

  // First user message as preview
  const firstUserMsg = entry.conversation.find((m) => m.role === 'user');
  const preview = firstUserMsg?.content.slice(0, 100) || '';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.time}>{timeStr}</Text>
        </View>
        {entry.isDraft && (
          <View style={styles.draftBadge}>
            <Text style={styles.draftText}>Draft</Text>
          </View>
        )}
        <ChevronRight size={18} color={colors.textTertiary} />
      </View>
      {preview ? (
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.base,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typeStyles.cardTitle,
  },
  time: {
    ...typeStyles.caption,
    color: colors.textTertiary,
  },
  draftBadge: {
    backgroundColor: colors.thornLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  draftText: {
    ...typeStyles.caption,
    color: colors.thorn,
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
  },
  preview: {
    ...typeStyles.body,
    color: colors.textSecondary,
  },
});
