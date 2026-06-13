import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../utils/theme';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <Text style={styles.title}>Activity</Text>
      </View>
      <View style={styles.empty}>
        <Bell size={48} color={colors.neutral[300]} strokeWidth={1} />
        <Text style={styles.emptyTitle}>No activity yet</Text>
        <Text style={styles.emptyDesc}>
          When someone likes, comments, or follows you, you'll see it here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[150],
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.neutral[900] },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[3],
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.neutral[900] },
  emptyDesc: { fontSize: fontSize.sm, color: colors.neutral[400], textAlign: 'center', lineHeight: 20 },
});
