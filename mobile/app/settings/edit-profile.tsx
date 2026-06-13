import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { updateUserProfile } from '../../services/firestore';
import { uploadAvatar } from '../../services/storage';
import Avatar from '../../components/Avatar';
import { colors, spacing, radius, fontSize, fontWeight, MAX_BIO_LENGTH } from '../../utils/theme';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, userProfile, refreshProfile } = useAuth();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [avatarUri, setAvatarUri] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) { toast.warning('Name is required'); return; }
    setSaving(true);
    try {
      const updates = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        location: location.trim(),
      };
      if (avatarUri) {
        updates.photoURL = await uploadAvatar(user.uid, avatarUri);
      }
      await updateUserProfile(user.uid, updates);
      await refreshProfile();
      toast.success('Profile updated');
      router.back();
    } catch { toast.error('Failed to update profile'); }
    setSaving(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.neutral[900]} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.4 }]}
          onPress={handleSave} disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View>
            <Avatar uri={avatarUri || userProfile?.photoURL} name={displayName} size="2xl" />
            <TouchableOpacity style={styles.cameraBtn} onPress={pickAvatar}>
              <Camera size={18} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={pickAvatar}>
            <Text style={styles.changeText}>Change profile photo</Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={bio} onChangeText={setBio}
              maxLength={MAX_BIO_LENGTH} multiline
              placeholder="Tell the world about your wild side..."
              placeholderTextColor={colors.neutral[400]}
            />
            <Text style={styles.charCount}>{bio.length}/{MAX_BIO_LENGTH}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input} value={location} onChangeText={setLocation}
              placeholder="Where do you explore?"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingBottom: spacing[3], backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.neutral[150] },
  headerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.neutral[900] },
  saveBtn: { backgroundColor: colors.primary[500], paddingHorizontal: spacing[5], paddingVertical: spacing[2], borderRadius: radius.full },
  saveBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  content: { padding: spacing[6], gap: spacing[8] },
  avatarSection: { alignItems: 'center', gap: spacing[3] },
  cameraBtn: { position: 'absolute', bottom: 4, right: 4, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  changeText: { fontSize: fontSize.sm, color: colors.primary[500], fontWeight: fontWeight.semibold },
  fields: { gap: spacing[5] },
  inputGroup: { gap: spacing[1] },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.neutral[700], marginBottom: 4 },
  input: { backgroundColor: colors.neutral[0], borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: radius.md, paddingHorizontal: spacing[4], paddingVertical: spacing[3], fontSize: fontSize.base, color: colors.neutral[900] },
  charCount: { fontSize: fontSize.xs, color: colors.neutral[400], alignSelf: 'flex-end' },
});
