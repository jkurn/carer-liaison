/**
 * Home / Today screen — daily hub.
 *
 * Shows: greeting, body state check-in, recent entries, draft recovery.
 */
import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import EntryCard from '../../components/EntryCard';
import BodyStateSelector from '../../components/BodyStateSelector';
import { useStore } from '../../lib/store';
import { getEntries, createBodyState, getRecentBodyStates } from '../../lib/database';
import { colors, spacing, radius, type as typeStyles } from '../../lib/theme';
import type { JournalEntry, BodyState } from '../../lib/types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [todayBodyState, setTodayBodyState] = useState<BodyState | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const entries = getEntries(user.id, 5);
      setRecentEntries(entries);

      // Check if body state was logged today
      const states = getRecentBodyStates(user.id, 1);
      if (states.length > 0) {
        const lastState = states[0];
        const today = new Date().toDateString();
        const stateDate = new Date(lastState.createdAt).toDateString();
        if (today === stateDate) {
          setTodayBodyState(lastState.state as BodyState);
        }
      }
    }, [user]),
  );

  const handleBodyStateSelect = (state: BodyState | null) => {
    if (!user || !state) return;
    setTodayBodyState(state);
    createBodyState(user.id, state);
  };

  const draft = recentEntries.find((e) => e.isDraft);
  const savedEntries = recentEntries.filter((e) => !e.isDraft).slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.brand}>Carer Liaison</Text>
        </View>

        {/* Body state check-in */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How's your body feeling?</Text>
          <BodyStateSelector
            selected={todayBodyState}
            onSelect={handleBodyStateSelect}
          />
        </View>

        {/* Draft recovery */}
        {draft && (
          <Pressable
            style={styles.draftCard}
            onPress={() => router.push('/journal/chat')}
          >
            <Text style={styles.draftTitle}>Continue your entry</Text>
            <Text style={styles.draftPreview}>
              You started writing{' '}
              {draft.conversation.length > 1
                ? `— ${draft.conversation.filter((m) => m.role === 'user').length} messages so far`
                : ''}
            </Text>
          </Pressable>
        )}

        {/* Start journaling CTA */}
        {!draft && (
          <Pressable
            style={styles.ctaCard}
            onPress={() => router.push('/journal/chat')}
          >
            <Plus size={24} color={colors.textOnAccent} />
            <View>
              <Text style={styles.ctaTitle}>Start today's journal</Text>
              <Text style={styles.ctaSubtitle}>
                Tell Lia about your day
              </Text>
            </View>
          </Pressable>
        )}

        {/* Recent entries */}
        {savedEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent entries</Text>
            <View style={styles.entriesList}>
              {savedEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onPress={() => router.push(`/journal/${entry.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {savedEntries.length === 0 && !draft && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your journal starts here</Text>
            <Text style={styles.emptyBody}>
              Tap the + button to start your first entry. Lia is ready to
              listen.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  content: { padding: spacing.xl, gap: spacing.lg },
  header: { gap: spacing.xs },
  greeting: { ...typeStyles.pageTitle },
  brand: { ...typeStyles.caption, color: colors.accent, fontFamily: 'DMSans-SemiBold' },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.base,
    gap: spacing.md,
  },
  cardTitle: { ...typeStyles.cardTitle },
  draftCard: {
    backgroundColor: colors.thornLight,
    borderRadius: radius.md,
    padding: spacing.base,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.thorn,
  },
  draftTitle: { ...typeStyles.cardTitle, color: colors.thorn },
  draftPreview: { ...typeStyles.caption, color: colors.textSecondary },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  ctaTitle: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    color: colors.textOnAccent,
  },
  ctaSubtitle: {
    ...typeStyles.caption,
    color: colors.textOnAccentMuted,
  },
  section: { gap: spacing.md },
  sectionTitle: { ...typeStyles.overline, color: colors.textTertiary },
  entriesList: { gap: spacing.sm },
  emptyState: {
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyTitle: { ...typeStyles.sectionHeading, textAlign: 'center' },
  emptyBody: { ...typeStyles.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
