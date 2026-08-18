import Feather from '@expo/vector-icons/Feather';
import { DimensionValue, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getMetrics } from '@/features/tickets/logic';
import { Ticket } from '@/features/tickets/model';
import { colors, spacing } from '@/theme';

type InsightsProps = {
  tickets: Ticket[];
};

function Metric({ label, value, detail, tone }: { label: string; value: string | number; detail: string; tone: 'green' | 'blue' | 'amber' | 'red' }) {
  const toneStyle = {
    green: styles.metricGreen,
    blue: styles.metricBlue,
    amber: styles.metricAmber,
    red: styles.metricRed,
  }[tone];
  return (
    <View style={styles.metric}>
      <View style={[styles.metricMarker, toneStyle]} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const width = (total === 0 ? '0%' : `${Math.max(6, Math.round((value / total) * 100))}%`) as DimensionValue;
  return (
    <View style={styles.barRow}>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{value}</Text>
      </View>
      <View style={styles.barTrack}><View style={[styles.barFill, { backgroundColor: color, width }]} /></View>
    </View>
  );
}

export function Insights({ tickets }: InsightsProps) {
  const metrics = getMetrics(tickets);
  const total = Math.max(1, tickets.length);
  const team = ['David', 'Nina'].map((name) => ({
    name,
    active: tickets.filter((ticket) => ticket.assignee === name && ticket.status !== 'resolved').length,
    resolved: tickets.filter((ticket) => ticket.assignee === name && ticket.status === 'resolved').length,
  }));

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.eyebrow}>OPERATIONS</Text>
          <Text style={styles.title}>Support health</Text>
          <Text style={styles.subtitle}>A focused view of queue risk and team workload.</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live demo data</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric detail="needs action" label="Active" tone="green" value={metrics.active} />
        <Metric detail="highest priority" label="Urgent" tone="red" value={metrics.urgent} />
        <Metric detail="customer follow-up" label="Pending" tone="amber" value={metrics.pending} />
        <Metric detail="estimated" label="Response" tone="blue" value={`${metrics.responseMinutes}m`} />
      </View>

      <View style={styles.grid}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Queue composition</Text>
              <Text style={styles.sectionSubtitle}>Current conversations by status</Text>
            </View>
            <Feather color={colors.textMuted} name="bar-chart-2" size={20} />
          </View>
          <Bar color={colors.accent} label="Open" total={total} value={tickets.filter((ticket) => ticket.status === 'open').length} />
          <Bar color={colors.amber} label="Pending" total={total} value={metrics.pending} />
          <Bar color={colors.blue} label="Resolved" total={total} value={metrics.resolved} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Team workload</Text>
              <Text style={styles.sectionSubtitle}>Active ownership and completed work</Text>
            </View>
            <Feather color={colors.textMuted} name="users" size={20} />
          </View>
          {team.map((member) => (
            <View key={member.name} style={styles.memberRow}>
              <View style={styles.memberAvatar}><Text style={styles.memberInitial}>{member.name[0]}</Text></View>
              <View style={styles.memberText}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberDetail}>{member.active} active / {member.resolved} resolved</Text>
              </View>
              <View style={styles.capacity}><View style={[styles.capacityFill, { width: `${Math.min(100, member.active * 28)}%` }]} /></View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.note}>
        <Feather color={colors.blue} name="shield" size={18} />
        <View style={styles.noteText}>
          <Text style={styles.noteTitle}>Local-first demonstration</Text>
          <Text style={styles.noteBody}>Conversation changes persist on this device. No customer data or message content leaves the app.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: spacing.xl, gap: spacing.xl },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.lg },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '800' },
  title: { color: colors.text, fontSize: 25, fontWeight: '700', marginTop: 3 },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 30, paddingHorizontal: spacing.md, borderRadius: 5, backgroundColor: colors.surface },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  liveText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface },
  metric: { flexGrow: 1, flexBasis: 180, minHeight: 130, padding: spacing.lg, borderRightWidth: 1, borderRightColor: colors.border },
  metricMarker: { width: 28, height: 4, borderRadius: 2, marginBottom: spacing.md },
  metricGreen: { backgroundColor: colors.accent },
  metricBlue: { backgroundColor: colors.blue },
  metricAmber: { backgroundColor: colors.amber },
  metricRed: { backgroundColor: colors.danger },
  metricLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  metricValue: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: spacing.xs },
  metricDetail: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  section: { flexGrow: 1, flexBasis: 360, minHeight: 270, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface, gap: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  barRow: { gap: spacing.sm },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { color: colors.text, fontSize: 12, fontWeight: '600' },
  barValue: { color: colors.textMuted, fontSize: 12 },
  barTrack: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.surfaceMuted },
  barFill: { height: 8, borderRadius: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  memberAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  memberInitial: { color: colors.accent, fontWeight: '700' },
  memberText: { flex: 1 },
  memberName: { color: colors.text, fontSize: 13, fontWeight: '700' },
  memberDetail: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  capacity: { width: 72, height: 6, overflow: 'hidden', borderRadius: 3, backgroundColor: colors.surfaceMuted },
  capacityFill: { height: 6, borderRadius: 3, backgroundColor: colors.blue },
  note: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.blue, backgroundColor: colors.blueSoft },
  noteText: { flex: 1 },
  noteTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  noteBody: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 2 },
});
