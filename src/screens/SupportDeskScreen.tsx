import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SegmentedControl } from '@/components/SegmentedControl';
import { Conversation } from '@/features/tickets/Conversation';
import { Insights } from '@/features/tickets/Insights';
import { selectTickets } from '@/features/tickets/logic';
import { TicketList } from '@/features/tickets/TicketList';
import { TicketFilter } from '@/features/tickets/model';
import { useSupportDesk } from '@/features/tickets/useSupportDesk';
import { colors, spacing } from '@/theme';

const views = [
  { label: 'Inbox', value: 'inbox' },
  { label: 'Insights', value: 'insights' },
];

export function SupportDeskScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 780;
  const [view, setView] = useState('inbox');
  const [filter, setFilter] = useState<TicketFilter>('all');
  const [query, setQuery] = useState('');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const desk = useSupportDesk();
  const visibleTickets = useMemo(
    () => selectTickets(desk.tickets, filter, query),
    [desk.tickets, filter, query],
  );

  const selectTicket = (ticketId: string) => {
    desk.selectTicket(ticketId);
    if (compact) setMobileDetailOpen(true);
  };

  const showList = !compact || !mobileDetailOpen;
  const showConversation = !compact || mobileDetailOpen;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.brandMark}><Feather color={colors.white} name="message-square" size={17} /></View>
          {!compact && <Text style={styles.brandName}>RelayDesk</Text>}
        </View>
        <SegmentedControl compact={compact} onChange={(nextView) => { setView(nextView); setMobileDetailOpen(false); }} options={views} value={view} />
        <View style={styles.operator}>
          <View style={styles.onlineDot} />
          {!compact && <Text style={styles.operatorText}>David / online</Text>}
        </View>
      </View>

      {!desk.isReady ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Restoring local workspace</Text>
        </View>
      ) : view === 'insights' ? (
        <Insights tickets={desk.tickets} />
      ) : (
        <View style={styles.workspace}>
          {showList && (
            <View style={[styles.listPane, compact && styles.compactPane]}>
              <TicketList
                filter={filter}
                onFilterChange={setFilter}
                onQueryChange={setQuery}
                onSelect={selectTicket}
                query={query}
                selectedId={compact ? null : desk.selectedId}
                tickets={visibleTickets}
              />
            </View>
          )}
          {showConversation && desk.selectedTicket && (
            <View style={[styles.conversationPane, compact && styles.compactPane]}>
              <Conversation
                isCompact={compact}
                key={desk.selectedTicket.id}
                onBack={() => setMobileDetailOpen(false)}
                onReply={desk.reply}
                onStatusChange={desk.setStatus}
                ticket={desk.selectedTicket}
              />
            </View>
          )}
          {showConversation && !desk.selectedTicket && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Select a conversation</Text>
              <Text style={styles.emptyBody}>Choose a customer message to review its history.</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  topBar: { minHeight: 58, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, zIndex: 2 },
  brand: { minWidth: 110, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: { width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  brandName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  operator: { minWidth: 110, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  operatorText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.background },
  loadingText: { color: colors.textMuted, fontSize: 12 },
  workspace: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  listPane: { width: 370, maxWidth: '38%', borderRightWidth: 1, borderRightColor: colors.border },
  conversationPane: { flex: 1 },
  compactPane: { width: '100%', maxWidth: '100%', flex: 1, borderRightWidth: 0 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptyBody: { color: colors.textMuted, fontSize: 13 },
});
