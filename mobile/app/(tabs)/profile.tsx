import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, Share2, Grid3X3, MapPin } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserPosts } from '../../services/firestore';
import Avatar from '../../components/Avatar';
import { formatCount } from '../../utils/formatters';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * 2) / 3;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    const fetchPosts = async () => {
      try {
        const result = await getUserPosts(user.uid);
        setPosts(result.posts);
      } catch {}
      setLoading(false);
    };
    fetchPosts();
  }, [userProfile, user]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${userProfile?.displayName} on Prashworld!`,
      });
    } catch {}
  };

  if (!userProfile) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const profile = userProfile;

  const renderHeader = () => (
    <View>
      {/* Top Row */}
      <View style={styles.topRow}>
        <Avatar uri={profile.photoURL} name={profile.displayName} size="xl" />
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{formatCount(profile.postCount || 0)}</Text>
            <Text style={styles.statLabel}>posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{formatCount(profile.followerCount || 0)}</Text>
            <Text style={styles.statLabel}>followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{formatCount(profile.followingCount || 0)}</Text>
            <Text style={styles.statLabel}>following</Text>
          </View>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.bio}>
        <Text style={styles.bioName}>{profile.displayName}</Text>
        <Text style={styles.bioUsername}>@{profile.username}</Text>
        {profile.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}
        {profile.location ? (
          <View style={styles.bioLocation}>
            <MapPin size={14} color={colors.neutral[400]} strokeWidth={2} />
            <Text style={styles.bioLocationText}>{profile.location}</Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/settings/edit-profile')} activeOpacity={0.7}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Share2 size={18} color={colors.neutral[700]} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {/* Tab */}
      <View style={styles.tab}>
        <Grid3X3 size={18} color={colors.neutral[900]} strokeWidth={1.75} />
        <Text style={styles.tabText}>Posts</Text>
      </View>
    </View>
  );

  const renderGridItem = ({ item }) => (
    <TouchableOpacity onPress={() => router.push(`/post/${item.id}`)} activeOpacity={0.9}>
      <Image source={{ uri: item.imageURLs?.[0] }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={{ fontSize: 48 }}>📸</Text>
      <Text style={styles.emptyTitle}>No field notes yet</Text>
      <Text style={styles.emptyDesc}>Share your first nature moment with the world.</Text>
      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(tabs)/create')}>
        <Text style={styles.createBtnText}>Create First Post</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <Text style={styles.headerTitle}>{profile.displayName}</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Settings size={22} color={colors.neutral[900]} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderGridItem}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary[500]} /> : renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[150],
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.neutral[900] },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.neutral[900] },
  statLabel: { fontSize: fontSize.xs, color: colors.neutral[400] },
  bio: { paddingHorizontal: spacing[4], gap: 2 },
  bioName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.neutral[900] },
  bioUsername: { fontSize: fontSize.sm, color: colors.neutral[400], fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace' },
  bioText: { fontSize: fontSize.sm, color: colors.neutral[600], lineHeight: 20, marginTop: spacing[1] },
  bioLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing[1] },
  bioLocationText: { fontSize: fontSize.xs, color: colors.neutral[400] },
  actions: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: spacing[4], paddingVertical: spacing[4] },
  editBtn: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  editBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.neutral[900] },
  shareBtn: {
    width: 44,
    backgroundColor: colors.neutral[0],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[150],
    borderBottomWidth: 2,
    borderBottomColor: colors.neutral[900],
  },
  tabText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.neutral[900] },
  gridRow: { gap: GRID_GAP },
  gridImage: { width: TILE_SIZE, height: TILE_SIZE, marginBottom: GRID_GAP },
  empty: { alignItems: 'center', paddingVertical: spacing[16], gap: spacing[3] },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.neutral[900] },
  emptyDesc: { fontSize: fontSize.sm, color: colors.neutral[400], textAlign: 'center', maxWidth: 260 },
  createBtn: { backgroundColor: colors.primary[500], paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: radius.md, marginTop: spacing[3] },
  createBtnText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.sm },
});
