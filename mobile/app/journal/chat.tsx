/**
 * Journal Chat — full-screen modal.
 *
 * Flow (matches USER-JOURNEY.md):
 * 1. GREETING: Lia's opening message, user types
 * 2. CHATTING: User sends message, waiting for AI
 * 3. RESPONDED: AI responded — show "Finish entry" + "Go deeper"
 * 4. SUGGESTIONS: User tapped "Go deeper" — show suggestion buttons
 * 5. REFLECTING: User tapped "Finish entry" — loading RBT extraction
 * 6. Done → navigate to Entry Detail
 *
 * At any point: ✕ dismiss saves draft and returns to Home.
 * User can ALWAYS type freely — buttons are shortcuts, not gates.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Send, Sparkles, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatBubble from '../../components/ChatBubble';
import CrisisBanner from '../../components/CrisisBanner';
import { useStore } from '../../lib/store';
import { sendChat, extractReflection, detectCrisisInResponse } from '../../lib/journal-ai';
import { createEntry, updateEntry, getDraftEntry } from '../../lib/database';
import { colors, spacing, radius, type as typeStyles } from '../../lib/theme';
import { JOURNAL_SUGGESTIONS, type ChatMessage } from '../../lib/types';

const LIA_GREETING =
  "Hey. How was today?\n\nCould be one moment, a whole saga, or just a feeling you can't shake. Whatever it is — I'm listening.";

type Phase = 'greeting' | 'chatting' | 'responded' | 'suggestions' | 'reflecting';

export default function JournalChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const {
    user,
    activeEntryId,
    conversation,
    setActiveEntry,
    addMessage,
    resetJournal,
  } = useStore();

  const [inputText, setInputText] = useState('');
  const [phase, setPhase] = useState<Phase>('greeting');
  const [showCrisis, setShowCrisis] = useState(false);
  const [error, setError] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);

  // ── Init: load draft or create new entry ────────────────
  useEffect(() => {
    if (!user) return;

    const draft = getDraftEntry(user.id);
    if (draft && draft.conversation.length > 0) {
      // Resume draft
      setActiveEntry(draft.id, draft.conversation);
      // If draft has AI responses, show responded phase
      const lastMsg = draft.conversation[draft.conversation.length - 1];
      setPhase(lastMsg?.role === 'assistant' ? 'responded' : 'greeting');
    } else {
      // New entry
      const entry = createEntry(user.id);
      const greeting: ChatMessage = {
        role: 'assistant',
        content: LIA_GREETING,
        timestamp: new Date().toISOString(),
      };
      setActiveEntry(entry.id, [greeting]);
      setPhase('greeting');
    }
  }, [user]);

  // ── Auto-scroll on new messages ─────────────────────────
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [conversation.length, isWaiting]);

  // ── Save draft helper ───────────────────────────────────
  const saveDraft = useCallback(() => {
    const state = useStore.getState();
    if (state.activeEntryId && state.conversation.length > 1) {
      updateEntry(state.activeEntryId, {
        conversation: state.conversation,
      });
    }
  }, []);

  // ── Send message ────────────────────────────────────────
  const handleSend = useCallback(
    async (text?: string) => {
      const message = text || inputText.trim();
      if (!message || isWaiting) return;

      setInputText('');
      setError('');
      setPhase('chatting');
      setIsWaiting(true);

      // Add user message
      const userMsg: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);

      try {
        // Get the latest conversation including the new message
        const currentConvo = [...useStore.getState().conversation];

        // Call AI (non-streaming — waits for full response)
        const aiText = await sendChat(currentConvo);

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: aiText,
          timestamp: new Date().toISOString(),
        };
        addMessage(assistantMsg);

        // Check for crisis content
        if (detectCrisisInResponse(aiText)) {
          setShowCrisis(true);
        }

        setPhase('responded');
        saveDraft();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Something went wrong';
        setError(msg);
        setPhase('responded'); // Still allow retry/finish even on error
      } finally {
        setIsWaiting(false);
      }
    },
    [inputText, isWaiting],
  );

  // ── Finish entry → extract RBT ─────────────────────────
  const handleFinish = useCallback(async () => {
    setPhase('reflecting');
    setError('');

    try {
      const state = useStore.getState();
      const reflection = await extractReflection(state.conversation);

      if (state.activeEntryId) {
        updateEntry(state.activeEntryId, {
          conversation: state.conversation,
          rose: reflection.rose,
          bud: reflection.bud,
          thorn: reflection.thorn,
          insights: {
            actions: reflection.actions,
            psychology: reflection.psychology,
            journey_context: reflection.journey_context,
            people: reflection.people,
            emotions: reflection.emotions,
            services: reflection.services,
            mood_score: reflection.mood_score,
            mood_label: reflection.mood_label,
            energy_label: reflection.energy_label,
          },
          title: reflection.mood_label,
          isDraft: false,
        });

        const entryId = state.activeEntryId;
        resetJournal();
        router.replace(`/journal/${entryId}`);
      }
    } catch (err) {
      setError(
        'Could not generate reflection. Your entry is saved as a draft.',
      );
      setPhase('responded');
      saveDraft();
    }
  }, []);

  // ── Dismiss → save draft → go back ─────────────────────
  const handleDismiss = useCallback(() => {
    saveDraft();
    resetJournal();
    router.back();
  }, []);

  // ── Typing indicator as a chat item ─────────────────────
  const displayMessages = [...conversation];
  if (isWaiting) {
    displayMessages.push({
      role: 'assistant',
      content: '...',
      timestamp: '',
    });
  }

  // Check if we have at least one user message (for showing finish button)
  const hasUserMessage = conversation.some((m) => m.role === 'user');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <Pressable onPress={handleDismiss} hitSlop={16}>
          <X size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Crisis banner */}
      {showCrisis && (
        <CrisisBanner onDismiss={() => setShowCrisis(false)} />
      )}

      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(_, i) => `msg-${i}`}
        renderItem={({ item, index }) => {
          // Typing indicator
          if (isWaiting && index === displayMessages.length - 1) {
            return (
              <View style={styles.typingRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>L</Text>
                </View>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                  </View>
                </View>
              </View>
            );
          }
          return (
            <ChatBubble
              role={item.role as 'user' | 'assistant'}
              content={item.content}
            />
          );
        }}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        style={styles.chatList}
      />

      {/* Error bar */}
      {error ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => setError('')}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Reflecting state */}
      {phase === 'reflecting' && (
        <View style={styles.reflectingBar}>
          <ActivityIndicator color={colors.accent} size="small" />
          <Text style={styles.reflectingText}>
            Reflecting on your entry...
          </Text>
        </View>
      )}

      {/* Action buttons — shown after AI responds */}
      {phase === 'responded' && hasUserMessage && !isWaiting && (
        <View style={styles.actionBar}>
          <Pressable style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishText}>Finish entry</Text>
          </Pressable>
          <Pressable
            style={styles.deeperButton}
            onPress={() => setPhase('suggestions')}
          >
            <Sparkles size={16} color={colors.textOnAccent} />
            <Text style={styles.deeperText}>Go deeper</Text>
          </Pressable>
        </View>
      )}

      {/* Suggestion buttons */}
      {phase === 'suggestions' && (
        <View style={styles.suggestionsBar}>
          {JOURNAL_SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              style={styles.suggestionRow}
              onPress={() => handleSend(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
              <ChevronRight size={16} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Input area — always visible except during reflecting */}
      {phase !== 'reflecting' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.inputArea}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Share what's on your mind..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              editable={!isWaiting}
              returnKeyType="default"
            />
            <Pressable
              style={[
                styles.sendButton,
                (!inputText.trim() || isWaiting) && styles.sendDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isWaiting}
            >
              <Send size={18} color={colors.textOnAccent} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
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
  chatList: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: spacing.base,
    paddingBottom: spacing.xl,
  },
  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
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
  typingBubble: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8 },
  // Error
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.crisisBg,
  },
  errorText: {
    ...typeStyles.caption,
    color: colors.crisisRed,
    flex: 1,
  },
  errorDismiss: {
    ...typeStyles.caption,
    color: colors.crisisRed,
    fontFamily: 'DMSans-SemiBold',
    paddingLeft: spacing.sm,
  },
  // Reflecting
  reflectingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: colors.accentLight,
  },
  reflectingText: {
    ...typeStyles.body,
    color: colors.accent,
    fontFamily: 'DMSans-Medium',
  },
  // Action buttons (Finish + Go deeper)
  actionBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
  },
  finishButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgElevated,
  },
  finishText: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  deeperButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  deeperText: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    color: colors.textOnAccent,
  },
  // Suggestion rows
  suggestionsBar: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  suggestionText: {
    ...typeStyles.body,
    color: colors.textSecondary,
  },
  // Input
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans',
    fontSize: 15,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 22,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    maxHeight: 100,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.3,
  },
});
