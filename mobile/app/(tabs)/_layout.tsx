/**
 * Tab layout — 3 tabs + center FAB.
 *
 * ┌─────────────────────────────────────┐
 * │  🏠 Home    [+FAB]    📖 History   👤│
 * └─────────────────────────────────────┘
 *
 * FAB opens journal chat as full-screen modal.
 * Auth gate: redirects to /auth/login if no session.
 */
import { Redirect, Tabs, useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { Home, BookOpen, User, Plus } from 'lucide-react-native';
import { useStore } from '../../lib/store';
import { colors, spacing } from '../../lib/theme';

function FAB() {
  const router = useRouter();
  return (
    <View style={styles.fabContainer}>
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/journal/chat')}
        accessibilityLabel="Start journal entry"
        accessibilityRole="button"
      >
        <Plus size={28} color={colors.textOnAccent} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

export default function TabLayout() {
  const { session, authLoading } = useStore();

  if (authLoading) return null;
  if (!session) return <Redirect href="/auth/login" />;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <BookOpen size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <FAB />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingBottom: 28,
    paddingTop: 8,
    height: 80,
  },
  tabLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});
