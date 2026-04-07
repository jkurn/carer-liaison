import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, type as typeStyles } from '../lib/theme';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function ChatBubble({ role, content, isStreaming }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>L</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleLia,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.textUser : styles.textLia,
          ]}
        >
          {content}
          {isStreaming && <Text style={styles.cursor}>|</Text>}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
    paddingHorizontal: spacing.base,
  },
  containerUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: colors.textOnAccent,
  },
  bubble: {
    maxWidth: '78%',
    padding: spacing.md,
    borderRadius: 18,
  },
  bubbleLia: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.accent,
    borderTopRightRadius: 4,
  },
  text: {
    ...typeStyles.body,
    lineHeight: 22,
  },
  textLia: {
    color: colors.textPrimary,
  },
  textUser: {
    color: colors.textOnAccent,
  },
  cursor: {
    color: colors.accent,
    fontWeight: '300',
  },
});
