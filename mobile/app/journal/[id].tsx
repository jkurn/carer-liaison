/**
 * Entry Detail — shows full conversation + RBT reflection cards.
 */
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import ChatBubble from '../../components/ChatBubble';
import RBTCard from '../../components/RBTCard';
import { getEntry } from '../../lib/database';
import { colors, spacing, radius, type as typeStyles } from '../../lib/theme';

const BODY_STATE_EMOJI: Record<string, string> = {
  great: '😊', calm: '😌', neutral: '😐', resistant: '😤', difficult: '😰',
};

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const entry = id ? getEntry(id) : null;
  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Entry not found.</Text>
      </SafeAreaView>
    );
  }

  const date = new Date(entry.createdAt);
  const dateStr = date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeStr = date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Entry</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Entry meta */}
        <View style={styles.meta}>
          <Text style={styles.date}>{dateStr}</Text>
          <Text style={styles.time}>{timeStr}</Text>
          {entry.bodyState && (
            <Text style={styles.bodyState}>
              {BODY_STATE_EMOJI[entry.bodyState]}{' '}
              {entry.bodyState.charAt(0).toUpperCase() + entry.bodyState.slice(1)}
            </Text>
          )}
        </View>

        {/* Title / mood label */}
        {entry.title && <Text style={styles.title}>{entry.title}</Text>}

        {/* Energy label */}
        {entry.insights?.energy_label && (
          <View style={styles.energyBadge}>
            <Text style={styles.energyText}>{entry.insights.energy_label}</Text>
          </View>
        )}

        {/* RBT Cards — the emotional payoff, shown first */}
        {(entry.rose || entry.bud || entry.thorn) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reflection</Text>
            <View style={styles.rbtCards}>
              {entry.rose && <RBTCard variant="rose" data={entry.rose} />}
              {entry.bud && <RBTCard variant="bud" data={entry.bud} />}
              {entry.thorn && <RBTCard variant="thorn" data={entry.thorn} />}
            </View>
          </View>
        )}

        {/* Psychology insight */}
        {entry.insights?.psychology && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insight</Text>
            <View style={styles.psychCard}>
              <Text style={styles.psychConcept}>
                {entry.insights.psychology.concept}
              </Text>
              <Text style={styles.psychExplanation}>
                {entry.insights.psychology.explanation}
              </Text>
              {entry.insights.psychology.stat && (
                <Text style={styles.psychStat}>
                  {entry.insights.psychology.stat}
                </Text>
              )}
              {entry.insights.psychology.source_hint && (
                <Text style={styles.psychSource}>
                  — {entry.insights.psychology.source_hint}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Journey context */}
        {entry.insights?.journey_context && (
          <View style={styles.journeyCard}>
            <Text style={styles.journeyText}>
              {entry.insights.journey_context}
            </Text>
          </View>
        )}

        {/* Conversation — record of what was said, below the reflection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversation</Text>
          {entry.conversation
            .filter((m) => m.role !== 'system')
            .map((msg, i) => (
              <ChatBubble
                key={i}
                role={msg.role as 'user' | 'assistant'}
                content={msg.content}
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay',
    fontSize: 22,
    color: colors.textPrimary,
  },
  content: { padding: spacing.xl, gap: spacing.lg },
  meta: { gap: spacing.xs },
  date: { ...typeStyles.sectionHeading },
  time: { ...typeStyles.caption, color: colors.textTertiary },
  bodyState: { ...typeStyles.body, marginTop: spacing.xs },
  title: {
    fontFamily: 'DMSerifDisplay',
    fontSize: 24,
    color: colors.textPrimary,
    lineHeight: 30,
  },
  energyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  energyText: {
    ...typeStyles.caption,
    color: colors.accent,
    fontFamily: 'DMSans-SemiBold',
  },
  section: { gap: spacing.md },
  sectionTitle: { ...typeStyles.overline, color: colors.textTertiary },
  rbtCards: { gap: spacing.md },
  psychCard: {
    backgroundColor: '#F8F6FF',
    borderWidth: 1,
    borderColor: '#E0D8F0',
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.sm,
  },
  psychConcept: { ...typeStyles.cardTitle, color: colors.journalPurple },
  psychExplanation: { ...typeStyles.body, color: colors.textSecondary },
  psychStat: { ...typeStyles.caption, color: colors.textSecondary, fontStyle: 'italic' },
  psychSource: { ...typeStyles.caption, color: colors.textTertiary, fontStyle: 'italic' },
  journeyCard: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: spacing.base,
  },
  journeyText: { ...typeStyles.body, color: colors.accentEnd, fontStyle: 'italic', lineHeight: 22 },
  emptyText: { ...typeStyles.body, color: colors.textTertiary, textAlign: 'center', marginTop: 100 },
});
