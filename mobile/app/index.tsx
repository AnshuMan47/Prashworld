import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Camera, Users, Globe } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, radius, fontSize, fontWeight, APP_NAME, APP_TAGLINE } from '../utils/theme';

export default function LandingScreen() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <Leaf size={48} color={colors.primary[500]} strokeWidth={2} />
      </View>
    );
  }

  const features = [
    { icon: Camera, title: 'Share Nature Moments', desc: 'Document biodiversity with stunning photography' },
    { icon: Users, title: 'Join the Ecology Network', desc: 'Connect with field researchers and enthusiasts' },
    { icon: Globe, title: 'Inspire Conservation', desc: 'Every post amplifies the voice of the natural world' },
  ];

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[300]]}
          style={styles.logoBox}
        >
          <Leaf size={36} color="#fff" strokeWidth={2} />
        </LinearGradient>

        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        <Text style={styles.subtitle}>
          The social platform built for ecologists, wildlife photographers, and everyone who finds wonder in the natural world.
        </Text>
      </View>

      {/* Auth Buttons */}
      <View style={styles.authSection}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Sign in with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Create your field journal</Text>
        </TouchableOpacity>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {features.map((f, i) => (
          <View key={i} style={styles.feature}>
            <View style={styles.featureIcon}>
              <f.icon size={20} color={colors.primary[500]} strokeWidth={1.75} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>© 2026 {APP_NAME}. For the wild, by the wild.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.neutral[900],
    letterSpacing: -1,
  },
  tagline: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.primary[500],
    marginTop: spacing[1],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing[2],
    maxWidth: 320,
  },
  authSection: {
    gap: spacing[3],
    marginBottom: spacing[10],
  },
  primaryBtn: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  secondaryBtn: {
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  secondaryBtnText: {
    color: colors.neutral[900],
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  features: {
    gap: spacing[5],
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[4],
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
  },
  featureDesc: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    lineHeight: 16,
    marginTop: 2,
  },
  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginTop: spacing[16],
  },
});
