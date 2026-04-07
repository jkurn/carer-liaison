import { Stack } from 'expo-router';
import { colors } from '../../lib/theme';

export default function JournalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPage },
      }}
    >
      <Stack.Screen
        name="chat"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
