import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User, LogOut, Leaf } from 'lucide-react-native';
import { signOut } from '../../services/auth';
import { useToast } from '../../contexts/ToastContext';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            toast.success('Signed out');
            router.replace('/');
          } catch { toast.error('Failed to sign out'); }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.neutral[900]} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <TouchableOpacity style={styles.item} onPress={() => router.push('/settings/edit-profile')}>
            <User size={20} color={colors.neutral[700]} strokeWidth={1.75} />
            <Text style={styles.itemText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.item} onPress={handleSignOut}>
            <LogOut size={20} color={colors.semantic.error} strokeWidth={1.75} />
            <Text style={[styles.itemText, { color: colors.semantic.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Leaf size={20} color={colors.neutral[300]} strokeWidth={2} />
          <Text style={styles.footerText}>Prashworld v1.0.0</Text>
          <Text style={styles.footerText}>For the wild, by the wild.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingBottom: spacing[3], backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.neutral[150] },
  headerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.neutral[900] },
  content: { padding: spacing[4], gap: spacing[6] },
  section: { gap: spacing[1] },
  sectionTitle: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.neutral[400], letterSpacing: 0.8, marginBottom: spacing[2], paddingHorizontal: spacing[2] },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingVertical: spacing[4], paddingHorizontal: spacing[4], borderRadius: radius.md, backgroundColor: '#fff' },
  itemText: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.neutral[900] },
  footer: { alignItems: 'center', gap: spacing[1], paddingTop: spacing[10] },
  footerText: { fontSize: fontSize.xs, color: colors.neutral[400] },
});
