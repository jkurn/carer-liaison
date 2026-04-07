/**
 * Journal Chat — full-screen modal.
 *
 * Flow:
 * 1. Lia greeting → user types → AI streams response
 * 2. After each AI response: "Go deeper" (suggestions) or "Finish entry"
 * 3. "Finish entry" → extraction API call → show entry detail
 *
 * State machine:
 * GREETING → ACTIVE (loop) → REFLECTING → SAVED
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
import { X, Send, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatBubble from '../../components/ChatBubble';
import CrisisBanner from '../../components/CrisisBanner';
import BodyStateSelector from '../../components/BodyStateSelector';
import { useStore } from '../../lib/store';
import { streamChat, extractReflection, detectCrisisInResponse } from '../../lib/journal-ai';
import { createEntry, updateEntry, getDraftEntry } from '../../lib/database';
import { colors, spacing, radius, type as typeStyles } from '../../lib/theme';
import { JOURNAL_SUGGESTIONS, type ChatMessage } from '../../lib/types';

const LIA_GREETING = "Hey. How was today?\n\nCould be one moment, a whole saga, or just a feeling you can't shake. Whatever it is — I'm listening.";

type JournalPhase = 'greeting' | 'active' | 'reflecting' | 'saved';

export default function JournalChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const {
    user,
    activeEntryId,
    conversation,
    isStreaming,
    streamingText,
    bodyState,
    setActiveEntry,
    addMessage,
    setStreaming,
    setStreamingText,
    appendStreamingText,
    setBodyState,
    resetJournal,
  } = useStore();

  const [inputText, setInputText] = useState('');
  const [phase, setPhase] = useState<JournalPhase>('greeting');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [error, setError] = useState('');

  // Init: check for draft or create new entry
  useEffect(() => {
    if (!user) return;

    const draft = getDraftEntry(user.id);
    if (draft && draft.conversation.length > 0) {
      setActiveEntry(draft.id, draft.conversation);
      setBodyState(draft.bodyState ?? null);
      setPhase('active');
    } else {
      const entry = createEntry(user.id);
      setActiveEntry(entry.id, []);
      // Add Lia's greeting
      const greeting: ChatMessage = {
        role: 'assistant',
        content: LIA_GREETING,
        timestamp: new Date().toISOString(),
      };
      addMessage(greeting);
      setPhase('greeting');
    }

    return () => {
      // Save draft on unmount
      const state = useStore.getState();
      if (state.activeEntryId && state.conversation.length > 1) {
        updateEntry(state.activeEntryId, {
          conversation: state.conversation,
          bodyState: state.bodyState,
        });
      }
    };
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [conversation.length, streamingText]);

  const handleSend = useCallback(async (text?: string) => {
    const message = text || inputText.trim();
    if (!message || isStreaming) return;

    setInputText('');
    setError('');
    setShowSuggestions(false);
    setPhase('active');

    // Add user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);

    // Persist draft
    const state = useStore.getState();
    if (state.activeEntryId) {
      updateEntry(state.activeEntryId, {
        conversation: [...state.conversation],
        bodyState: state.bodyState,
      });
    }

    // Stream AI response
    setStreaming(true);
    setStreamingText('');

    await streamChat(
      [...state.conversation],
      // onChunk
      (chunk) => {
        appendStreamingText(chunk);
      },
      // onDone
      (fullText) => {
        setStreaming(false);
        setStreamingText('');
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: fullText,
          timestamp: new Date().toISOString(),
        };
        addMessage(assistantMsg);

        // Check for crisis content
        if (detectCrisisInResponse(fullText)) {
          setShowCrisis(true);
        }

        setShowSuggestions(true);

        // Persist with new message
        const latest = useStore.getState();
        if (latest.activeEntryId) {
          updateEntry(latest.activeEntryId, {
            conversation: [...latest.conversation],
            isCrisis: detectCrisisInResponse(fullText),
          });
        }
      },
      // onError
      (err) => {
        setStreaming(false);
        setStreamingText('');
        setError(err.message || 'Something went wrong. Try again.');
      },
    );
  }, [inputText, isStreaming]);

  const handleFinishEntry = useCallback(async () => {
    setPhase('reflecting');
    setShowSuggestions(false);

    try {
      const state = useStore.getState();
      const reflection = await extractReflection(state.conversation);

      if (state.activeEntryId) {
        updateEntry(state.activeEntryId, {
          conversation: state.conversation,
          bodyState: state.bodyState,
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

        setPhase('saved');
        // Navigate to entry detail
        resetJournal();
        router.replace(`/journal/${state.activeEntryId}`);
      }
    } catch (err) {
      setError('Could not generate reflection. Your entry is saved as a draft.');
      setPhase('active');
    }
  }, []);

  const handleDismiss = useCallback(() => {
    // Save as draft and close
    const state = useStore.getState();
    if (state.activeEntryId && state.conversation.length > 1) {
      updateEntry(state.activeEntryId, {
        conversation: state.conversation,
        bodyState: state.bodyState,
      });
    }
    resetJournal();
    router.back();
  }, []);

  // Build display messages (conversation + streaming)
  const displayMessages = [...conversation];
  if (isStreaming && streamingText) {
    displayMessages.push({
      role: 'assistant',
      content: streamingText,
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <Pressable onPress={handleDismiss} hitSlop={12}>
          <X size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Crisis banner */}
      {showCrisis && (
        <CrisisBanner onDismiss={() => setShowCrisis(false)} />
      )}

      {/* Body state selector */}
      {phase === 'greeting' && (
        <View style={styles.bodyStateSection}>
          <Text style={styles.bodyStateLabel}>How's your body feeling?</Text>
          <BodyStateSelector selected={bodyState} onSelect={setBodyState} />
        </View>
      )}

      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <ChatBubble
            role={item.role as 'user' | 'assistant'}
            content={item.content}
            isStreaming={
              isStreaming && index === displayMessages.length - 1
            }
          />
        )}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Reflecting state */}
      {phase === 'reflecting' && (
        <View style={styles.reflectingBar}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.reflectingText}>
            Reflecting on your entry...
          </Text>
        </View>
      )}

      {/* Error */}
      {error ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Suggestion buttons */}
      {showSuggestions && !isStreaming && phase === 'active' && (
        <View style={styles.actionBar}>
          <View style={styles.actionRow}>
            <Pressable style={styles.finishButton} onPress={handleFinishEntry}>
              <Text style={styles.finishText}>Finish entry</Text>
            </Pressable>
            <Pressable
              style={styles.deeperButton}
              onPress={() => setShowSuggestions(false)}
            >
              <Sparkles size={16} color={colors.accent} />
              <Text style={styles.deeperText}>Go deeper</Text>
            </Pressable>
          </View>
          <View style={styles.suggestions}>
            {JOURNAL_SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                style={styles.suggestionChip}
                onPress={() => handleSend(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Input area */}
      {phase !== 'reflecting' && phase !== 'saved' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={styles.inputArea}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Tell me about your day..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              editable={!isStreaming}
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
            />
            <Pressable
              style={[
                styles.sendButton,
                (!inputText.trim() || isStreaming) && styles.sendDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isStreaming}
            >
              <Send size={20} color={colors.textOnAccent} />
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
  bodyStateSection: {
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  bodyStateLabel: {
    ...typeStyles.caption,
    color: colors.textSecondary,
    fontFamily: 'DMSans-Medium',
  },
  chatContent: {
    paddingVertical: spacing.base,
  },
  reflectingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.accentLight,
  },
  reflectingText: {
    ...typeStyles.body,
    color: colors.accent,
    fontFamily: 'DMSans-Medium',
  },
  errorBar: {
    padding: spacing.md,
    marginHorizontal: spacing.base,
    backgroundColor: colors.crisisBg,
    borderRadius: radius.sm,
  },
  errorText: {
    ...typeStyles.caption,
    color: colors.crisisRed,
    textAlign: 'center',
  },
  actionBar: {
    padding: spacing.base,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  finishButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
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
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  deeperText: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    color: colors.textOnAccent,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
  },
  suggestionText: {
    ...typeStyles.caption,
    color: colors.textSecondary,
    fontFamily: 'DMSans-Medium',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
  },
  input: {
    flex: 1,
    ...typeStyles.body,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 20,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    maxHeight: 120,
    color: colors.textPrimary,
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
    opacity: 0.4,
  },
});
