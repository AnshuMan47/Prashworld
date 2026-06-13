import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Leaf } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signUpWithEmail } from '../../services/auth';
import { useToast } from '../../contexts/ToastContext';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!displayName.trim()) errs.displayName = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'At least 6 characters';
    if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    if (password.length < 6) return { level: 1, label: 'Weak', color: colors.semantic.error };
    if (password.length < 10) return { level: 2, label: 'Fair', color: colors.accent[500] };
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { level: 4, label: 'Strong', color: colors.primary[500] };
    return { level: 3, label: 'Good', color: colors.primary[300] };
  };

  const strength = getStrength();

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUpWithEmail(email, password, displayName.trim());
      toast.success('Welcome to the wild! 🌿');
      router.replace('/(tabs)');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Account already exists');
      } else {
        toast.error('Sign up failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing[4] }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.neutral[900]} strokeWidth={1.75} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Leaf size={24} color="#fff" strokeWidth={2} />
          </View>
          <Text style={styles.title}>Start your field journal</Text>
          <Text style={styles.subtitle}>Join the ecology network</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={[styles.input, errors.displayName && styles.inputError]}
              placeholder="Sarah Chen"
              placeholderTextColor={colors.neutral[400]}
              value={displayName}
              onChangeText={setDisplayName}
              autoComplete="name"
            />
            {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor={colors.neutral[400]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="••••••••"
              placeholderTextColor={colors.neutral[400]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {strength.level > 0 && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      { width: `${strength.level * 25}%`, backgroundColor: strength.color },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="••••••••"
              placeholderTextColor={colors.neutral[400]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already exploring? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.switchLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  scroll: { flexGrow: 1, paddingHorizontal: spacing[6], paddingBottom: spacing[10] },
  backBtn: { padding: spacing[2], alignSelf: 'flex-start', borderRadius: radius.full, marginBottom: spacing[4] },
  header: { alignItems: 'center', marginBottom: spacing[8] },
  logoBox: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center', marginBottom: spacing[5] },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.neutral[900], letterSpacing: -0.5 },
  subtitle: { fontSize: fontSize.sm, color: colors.neutral[400], marginTop: spacing[1] },
  form: { gap: spacing[4], marginBottom: spacing[8] },
  inputGroup: { gap: spacing[1] },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.neutral[700], marginBottom: 4 },
  input: { backgroundColor: colors.neutral[0], borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: radius.md, paddingHorizontal: spacing[4], paddingVertical: spacing[3], fontSize: fontSize.base, color: colors.neutral[900] },
  inputError: { borderColor: colors.semantic.error },
  errorText: { fontSize: fontSize.xs, color: colors.semantic.error, marginTop: 4 },
  submitBtn: { backgroundColor: colors.primary[500], paddingVertical: spacing[4], borderRadius: radius.lg, alignItems: 'center', marginTop: spacing[2] },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing[4] },
  switchText: { fontSize: fontSize.sm, color: colors.neutral[400] },
  switchLink: { fontSize: fontSize.sm, color: colors.primary[500], fontWeight: fontWeight.semibold },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: 4 },
  strengthBar: { flex: 1, height: 3, backgroundColor: colors.neutral[200], borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
});
