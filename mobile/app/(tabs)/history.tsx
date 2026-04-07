/**
 * Entry History — past journal entries grouped by date.
 */
import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import EntryCard from '../../components/EntryCard';
import { useStore } from '../../lib/store';
import { getEntries } from '../../lib/database';
import { colors, spacing, type as typeStyles } from '../../lib/theme';
import type { JournalEntry } from '../../lib/types';

function groupByDate(entries: JournalEntry[]) {
  const groups: { date: string; entries: JournalEntry[] }[] = [];
  for (const entry of entries) {
    const dateStr = new Date(entry.createdAt).toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const last = groups[groups.length - 1];
    if (last && last.date === dateStr) {
      last.entries.push(entry);
    } else {
      groups.push({ date: dateStr, entries: [entry] });
    }
  }
  return groups;
}

export default function HistoryScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const data = getEntries(user.id, 20, 0);
      setEntries(data);
      setPage(0);
      setHasMore(data.length === 20);
    }, [user]),
  );

  const loadMore = () => {
    if (!user || !hasMore) return;
    const nextPage = page + 1;
    const data = getEntries(user.id, 20, nextPage * 20);
    if (data.length < 20) setHasMore(false);
    setEntries((prev) => [...prev, ...data]);
    setPage(nextPage);
  };

  const groups = groupByDate(entries);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.emptyBody}>
            Your journal entries will appear here after you finish your first
            conversation with Lia.
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.date}
          renderItem={({ item: group }) => (
            <View style={styles.group}>
              <Text style={styles.dateHeader}>{group.date}</Text>
              <View style={styles.entriesList}>
                {group.entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onPress={() => router.push(`/journal/${entry.id}`)}
                  />
                ))}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
  title: { fontFamily: 'DMSerifDisplay', fontSize: 28, color: colors.textPrimary },
  listContent: { padding: spacing.xl, paddingTop: 0, gap: spacing.lg },
  group: { gap: spacing.sm },
  dateHeader: {
    ...typeStyles.overline,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  entriesList: { gap: spacing.sm },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyTitle: { ...typeStyles.sectionHeading, textAlign: 'center' },
  emptyBody: { ...typeStyles.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
