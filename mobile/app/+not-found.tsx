import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Compass size={64} color={colors.neutral[300]} strokeWidth={1} />
      <Text style={styles.title}>Trail not found</Text>
      <Text style={styles.desc}>This path doesn't exist. Let's head back to familiar terrain.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.btnText}>Return to Camp</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[4], padding: spacing[6], backgroundColor: colors.neutral[50] },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.neutral[900] },
  desc: { fontSize: fontSize.base, color: colors.neutral[400], textAlign: 'center', maxWidth: 300, lineHeight: 22 },
  btn: { backgroundColor: colors.primary[500], paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: radius.md, marginTop: spacing[2] },
  btnText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.base },
});
