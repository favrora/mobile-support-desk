import Feather from '@expo/vector-icons/Feather';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { getSlaState } from '@/features/tickets/logic';
import { Ticket, TicketFilter } from '@/features/tickets/model';
import { colors, spacing } from '@/theme';

type TicketListProps = {
  tickets: Ticket[];
  selectedId: string | null;
  filter: TicketFilter;
  query: string;
  onFilterChange: (filter: TicketFilter) => void;
  onQueryChange: (query: string) => void;
  onSelect: (ticketId: string) => void;
};

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Done', value: 'resolved' },
];

function TicketRow({ ticket, selected, onPress }: { ticket: Ticket; selected: boolean; onPress: () => void }) {
  const sla = getSlaState(ticket);
  const slaStyle =
    sla.tone === 'danger'
      ? styles.slaDanger
      : sla.tone === 'warning'
        ? styles.slaWarning
        : styles.slaNeutral;

  return (
    <Pressable
      accessibilityLabel={`${ticket.customer}, ${ticket.subject}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && styles.pressed]}>
      <View style={styles.rowTop}>
        <Avatar initials={ticket.initials} />
        <View style={styles.rowHeading}>
          <View style={styles.nameLine}>
            <Text numberOfLines={1} style={styles.customer}>
              {ticket.customer}
            </Text>
            {ticket.priority !== 'normal' && (
              <View style={[styles.priorityDot, ticket.priority === 'urgent' && styles.priorityUrgent]} />
            )}
          </View>
          <Text style={styles.ticketMeta}>{ticket.id} / {ticket.channel}</Text>
        </View>
        <View style={[styles.sla, slaStyle]}>
          <Text style={[styles.slaText, sla.tone === 'danger' && styles.slaDangerText]}>{sla.label}</Text>
        </View>
      </View>
      <Text numberOfLines={1} style={styles.subject}>{ticket.subject}</Text>
      <Text numberOfLines={2} style={styles.preview}>{ticket.preview}</Text>
      <View style={styles.tags}>
        {ticket.tags.slice(0, 2).map((tag) => (
          <Text key={tag} style={styles.tag}>{tag}</Text>
        ))}
        <Text style={styles.assignee}>{ticket.assignee}</Text>
      </View>
    </Pressable>
  );
}

export function TicketList(props: TicketListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SUPPORT QUEUE</Text>
          <Text style={styles.title}>Conversations</Text>
        </View>
        <View style={styles.count}><Text style={styles.countText}>{props.tickets.length}</Text></View>
      </View>
      <View style={styles.search}>
        <Feather color={colors.textMuted} name="search" size={17} />
        <TextInput
          accessibilityLabel="Search conversations"
          onChangeText={props.onQueryChange}
          placeholder="Search customer, issue, or tag"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={props.query}
        />
        {props.query.length > 0 && (
          <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={() => props.onQueryChange('')}>
            <Feather color={colors.textMuted} name="x" size={17} />
          </Pressable>
        )}
      </View>
      <View style={styles.filters}>
        <SegmentedControl
          compact
          onChange={(value) => props.onFilterChange(value as TicketFilter)}
          options={filters}
          value={props.filter}
        />
      </View>
      <FlatList
        contentContainerStyle={props.tickets.length === 0 && styles.emptyList}
        data={props.tickets}
        keyExtractor={(ticket) => ticket.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No conversations match this view.</Text>}
        renderItem={({ item }) => (
          <TicketRow
            onPress={() => props.onSelect(item.id)}
            selected={item.id === props.selectedId}
            ticket={item}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    minHeight: 82,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '800' },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 2 },
  count: { minWidth: 28, height: 28, paddingHorizontal: spacing.sm, borderRadius: 14, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  search: {
    minHeight: 42,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, minWidth: 0, color: colors.text, fontSize: 14, paddingVertical: spacing.sm },
  filters: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  row: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  rowSelected: { backgroundColor: colors.accentSoft, borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 13 },
  pressed: { opacity: 0.72 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowHeading: { flex: 1, minWidth: 0 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  customer: { color: colors.text, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  priorityDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.amber },
  priorityUrgent: { backgroundColor: colors.danger },
  ticketMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  sla: { minHeight: 24, paddingHorizontal: spacing.sm, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  slaNeutral: { backgroundColor: colors.surfaceMuted },
  slaWarning: { backgroundColor: colors.amberSoft },
  slaDanger: { backgroundColor: colors.dangerSoft },
  slaText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  slaDangerText: { color: colors.danger },
  subject: { color: colors.text, fontSize: 14, fontWeight: '600' },
  preview: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: { color: colors.blue, backgroundColor: colors.blueSoft, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3, fontSize: 10, fontWeight: '600' },
  assignee: { color: colors.textMuted, fontSize: 11, marginLeft: 'auto' },
  emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
});
