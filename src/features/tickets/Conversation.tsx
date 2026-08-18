import Feather from '@expo/vector-icons/Feather';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Avatar } from '@/components/Avatar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { createReplySuggestion } from '@/features/tickets/logic';
import { SupportMessage, Ticket, TicketStatus } from '@/features/tickets/model';
import { colors, spacing } from '@/theme';

type ConversationProps = {
  ticket: Ticket;
  isCompact: boolean;
  onBack: () => void;
  onReply: (ticketId: string, body: string) => boolean;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
};

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function MessageBubble({ message }: { message: SupportMessage }) {
  if (message.author === 'system') {
    return (
      <View style={styles.systemMessage}>
        <Feather color={colors.amber} name="activity" size={14} />
        <Text style={styles.systemText}>{message.body}</Text>
      </View>
    );
  }

  const fromAgent = message.author === 'agent';
  return (
    <View style={[styles.messageRow, fromAgent && styles.messageRowAgent]}>
      <View style={[styles.bubble, fromAgent ? styles.agentBubble : styles.customerBubble]}>
        <Text style={[styles.messageText, fromAgent && styles.agentText]}>{message.body}</Text>
        <Text style={[styles.messageTime, fromAgent && styles.agentTime]}>{formatTime(message.createdAt)}</Text>
      </View>
    </View>
  );
}

export function Conversation({ ticket, isCompact, onBack, onReply, onStatusChange }: ConversationProps) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const sendReply = () => {
    if (onReply(ticket.id, draft)) setDraft('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      style={styles.container}>
      <View style={styles.header}>
        {isCompact && (
          <Pressable accessibilityLabel="Back to conversations" hitSlop={8} onPress={onBack} style={styles.iconButton}>
            <Feather color={colors.text} name="arrow-left" size={20} />
          </Pressable>
        )}
        <Avatar initials={ticket.initials} size={38} />
        <View style={styles.headerText}>
          <Text numberOfLines={1} style={styles.customer}>{ticket.customer}</Text>
          <Text numberOfLines={1} style={styles.customerMeta}>{ticket.country} / {ticket.id}</Text>
        </View>
        {!isCompact && (
          <SegmentedControl
            compact
            onChange={(value) => onStatusChange(ticket.id, value as TicketStatus)}
            options={statusOptions}
            value={ticket.status}
          />
        )}
      </View>

      {isCompact && (
        <View style={styles.mobileStatus}>
          <SegmentedControl
            compact
            onChange={(value) => onStatusChange(ticket.id, value as TicketStatus)}
            options={statusOptions}
            value={ticket.status}
          />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        ref={scrollRef}>
        <View style={styles.contextRow}>
          <View style={styles.contextText}>
            <Text style={styles.contextLabel}>ISSUE</Text>
            <Text style={styles.contextTitle}>{ticket.subject}</Text>
          </View>
          <View style={styles.channelBadge}>
            <Feather color={colors.blue} name={ticket.channel === 'email' ? 'mail' : 'message-circle'} size={13} />
            <Text style={styles.channelText}>{ticket.channel}</Text>
          </View>
        </View>
        <View style={styles.tagRow}>
          {ticket.tags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}
        </View>
        {ticket.messages.map((message) => <MessageBubble key={message.id} message={message} />)}
      </ScrollView>

      <View style={styles.composerArea}>
        <View style={styles.composerHeader}>
          <Text style={styles.replyingAs}>Replying as David</Text>
          <Pressable
            accessibilityLabel="Generate local reply draft"
            onPress={() => setDraft(createReplySuggestion(ticket))}
            style={({ pressed }) => [styles.suggestButton, pressed && styles.pressed]}>
            <Feather color={colors.amber} name="zap" size={14} />
            <Text style={styles.suggestText}>Draft suggestion</Text>
          </Pressable>
        </View>
        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Reply message"
            multiline
            onChangeText={setDraft}
            placeholder="Write a helpful reply..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={draft}
          />
          <Pressable
            accessibilityLabel="Send reply"
            disabled={!draft.trim()}
            onPress={sendReply}
            style={({ pressed }) => [styles.sendButton, !draft.trim() && styles.sendDisabled, pressed && styles.pressed]}>
            <Feather color={colors.white} name="send" size={17} />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>Suggestions are generated locally for this portfolio demo.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  headerText: { flex: 1, minWidth: 0 },
  customer: { color: colors.text, fontSize: 15, fontWeight: '700' },
  customerMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  mobileStatus: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.surface, alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: colors.border },
  messages: { flexGrow: 1, padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 880, alignSelf: 'center' },
  contextRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.xs },
  contextText: { flex: 1 },
  contextLabel: { color: colors.accent, fontSize: 10, fontWeight: '800' },
  contextTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: '700', marginTop: 3 },
  channelBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, minHeight: 27, borderRadius: 4, backgroundColor: colors.blueSoft },
  channelText: { color: colors.blue, fontSize: 11, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  tag: { color: colors.textMuted, fontSize: 11, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, backgroundColor: colors.surfaceMuted },
  messageRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  messageRowAgent: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 8, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  customerBubble: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  agentBubble: { backgroundColor: colors.accentDark },
  messageText: { color: colors.text, fontSize: 14, lineHeight: 21 },
  agentText: { color: colors.white },
  messageTime: { color: colors.textMuted, fontSize: 9, textAlign: 'right', marginTop: spacing.xs },
  agentTime: { color: '#CDE6DC' },
  systemMessage: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', alignSelf: 'center', maxWidth: 560, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 6, backgroundColor: colors.amberSoft },
  systemText: { flexShrink: 1, color: colors.amber, fontSize: 11, lineHeight: 16 },
  composerArea: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  composerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  replyingAs: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  suggestButton: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: 5, backgroundColor: colors.amberSoft },
  suggestText: { color: colors.amber, fontSize: 11, fontWeight: '700' },
  composer: { minHeight: 62, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 7, backgroundColor: colors.surface },
  input: { flex: 1, minHeight: 42, maxHeight: 110, color: colors.text, fontSize: 14, lineHeight: 20, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, textAlignVertical: 'top' },
  sendButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: colors.accent },
  sendDisabled: { opacity: 0.35 },
  disclaimer: { color: colors.textMuted, fontSize: 9, marginTop: spacing.xs },
  pressed: { opacity: 0.7 },
});
