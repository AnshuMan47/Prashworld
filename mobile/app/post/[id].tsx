import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Send, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getPostById, likePost, unlikePost, addComment, getComments, deleteComment } from '../../services/firestore';
import { formatTimeAgo } from '../../utils/formatters';
import Avatar from '../../components/Avatar';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useAuth();
  const toast = useToast();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const postData = await getPostById(id);
        if (!postData) { router.back(); return; }
        setPost(postData);
        setIsLiked(postData.likes?.includes(user?.uid));
        setLikeCount(postData.likeCount || 0);
        const commentsData = await getComments(id);
        setComments(commentsData);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return;
    if (isLiked) {
      setIsLiked(false); setLikeCount(c => c - 1);
      await unlikePost(id, user.uid).catch(() => { setIsLiked(true); setLikeCount(c => c + 1); });
    } else {
      setIsLiked(true); setLikeCount(c => c + 1);
      await likePost(id, user.uid).catch(() => { setIsLiked(false); setLikeCount(c => c - 1); });
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newComment = await addComment(id, {
        authorId: user.uid,
        authorName: userProfile?.displayName || 'Explorer',
        authorUsername: userProfile?.username || '',
        authorPhotoURL: userProfile?.photoURL || null,
        text: commentText.trim(),
      });
      setComments(prev => [...prev, { ...newComment, createdAt: new Date() }]);
      setCommentText('');
    } catch { toast.error('Failed to add comment'); }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary[500]} /></View>;
  if (!post) return null;

  const renderComment = ({ item }) => (
    <View style={styles.comment}>
      <TouchableOpacity onPress={() => router.push(`/user/${item.authorUsername}`)}>
        <Avatar uri={item.authorPhotoURL} name={item.authorName} size="xs" />
      </TouchableOpacity>
      <View style={styles.commentBody}>
        <Text style={styles.commentText}>
          <Text style={styles.commentAuthor}>{item.authorName} </Text>
          {item.text}
        </Text>
        <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
      {item.authorId === user?.uid && (
        <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
          <Trash2 size={14} color={colors.neutral[400]} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View>
      <Image source={{ uri: post.imageURLs?.[0] }} style={styles.image} resizeMode="contain" />
      <View style={styles.info}>
        <TouchableOpacity style={styles.author} onPress={() => router.push(`/user/${post.authorUsername}`)}>
          <Avatar uri={post.authorPhotoURL} name={post.authorName} size="md" />
          <View>
            <Text style={styles.authorName}>{post.authorName}</Text>
            {post.location ? <Text style={styles.location}>{post.location}</Text> : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
          <Heart size={24} color={isLiked ? colors.semantic.like : colors.neutral[900]} fill={isLiked ? colors.semantic.like : 'none'} strokeWidth={isLiked ? 0 : 1.75} />
          <Text style={[styles.likeBtnText, isLiked && { color: colors.semantic.like }]}>{likeCount}</Text>
        </TouchableOpacity>

        {post.caption ? (
          <Text style={styles.caption}>
            <Text style={styles.captionBold}>{post.authorName} </Text>{post.caption}
          </Text>
        ) : null}

        <Text style={styles.time}>{formatTimeAgo(post.createdAt)}</Text>
        <View style={styles.divider} />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing[2] }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.neutral[900]} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Post</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={renderComment}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<Text style={styles.noComments}>No comments yet. Start the conversation.</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Comment Input */}
      <View style={[styles.commentBar, { paddingBottom: insets.bottom + spacing[2] }]}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a field note..."
          placeholderTextColor={colors.neutral[400]}
          value={commentText}
          onChangeText={setCommentText}
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !commentText.trim() && { opacity: 0.3 }]}
          onPress={handleAddComment}
          disabled={!commentText.trim() || submitting}
        >
          <Send size={18} color={colors.primary[500]} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingBottom: spacing[3],
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.neutral[150],
  },
  topBarTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.neutral[900] },
  image: { width: '100%', height: 300, backgroundColor: colors.neutral[100] },
  info: { padding: spacing[4], gap: spacing[2] },
  author: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  authorName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.neutral[900] },
  location: { fontSize: fontSize.xs, color: colors.neutral[400] },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[1] },
  likeBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.neutral[900] },
  caption: { fontSize: fontSize.sm, color: colors.neutral[600], lineHeight: 20 },
  captionBold: { fontWeight: fontWeight.semibold, color: colors.neutral[900] },
  time: { fontSize: fontSize.xs, color: colors.neutral[400], textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: colors.neutral[150], marginVertical: spacing[2] },
  noComments: { textAlign: 'center', fontSize: fontSize.sm, color: colors.neutral[400], paddingVertical: spacing[8] },
  comment: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  commentBody: { flex: 1 },
  commentText: { fontSize: fontSize.sm, color: colors.neutral[600], lineHeight: 20 },
  commentAuthor: { fontWeight: fontWeight.semibold, color: colors.neutral[900] },
  commentTime: { fontSize: fontSize.xs, color: colors.neutral[400], marginTop: 2 },
  commentBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingTop: spacing[3],
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.neutral[150],
  },
  commentInput: {
    flex: 1, backgroundColor: colors.neutral[100], borderRadius: radius.full,
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    fontSize: fontSize.sm, color: colors.neutral[900],
  },
  sendBtn: { padding: spacing[2] },
});
