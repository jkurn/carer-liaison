/**
 * Profile stub — minimal for V1. Shows email and logout.
 */
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius, type as typeStyles } from '../../lib/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || '—'}</Text>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={18} color={colors.crisisRed} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
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
  content: { padding: spacing.xl, gap: spacing.base },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.base,
    gap: spacing.xs,
  },
  label: { ...typeStyles.caption, color: colors.textTertiary },
  value: { ...typeStyles.body },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    borderRadius: radius.sm,
    backgroundColor: colors.crisisBg,
  },
  logoutText: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    color: colors.crisisRed,
  },
});
