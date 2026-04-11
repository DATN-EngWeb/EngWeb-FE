/* global URLSearchParams */
import { Card, CardContent, Typography, Avatar, Box, Button, Chip } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CustomAudioPlayer from '../Test/customAudioPlayer';
import { useState, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { reactToPost } from '../../api/forum';
import ForumPostModal from './ForumPostModal';
import { formatDate } from '../../utils/stringFormat';

const DEBOUNCE_MS = 800;

export default function ForumPostCard({ post, initialOpen = false }) {
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [modalOpen, setModalOpen] = useState(initialOpen);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef(null);
  const pendingLikedRef = useRef(post.is_liked ?? false);

  const handleCloseModal = () => {
    setModalOpen(false);

    const next = new URLSearchParams(searchParams.toString());
    if (next.get('open_post') !== String(post.id)) return;

    next.delete('open_post');
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleLike = () => {
    const nextLiked = !pendingLikedRef.current;
    pendingLikedRef.current = nextLiked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await reactToPost(post.id);
        const serverLiked = result?.status === 'L';
        if (serverLiked !== pendingLikedRef.current) {
          pendingLikedRef.current = serverLiked;
          setLiked(serverLiked);
          setLikeCount((prev) => (serverLiked ? prev + 1 : prev - 1));
        }
      } catch (err) {
        pendingLikedRef.current = !nextLiked;
        setLiked(!nextLiked);
        setLikeCount((prev) => (nextLiked ? prev - 1 : prev + 1));
        // eslint-disable-next-line no-console
        console.error('Failed to react to post:', err);
      }
    }, DEBOUNCE_MS);
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={post.author_avatar} />
          <Box>
            <Typography fontWeight={600}>{post.author_name}</Typography>

            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.created_at)}
              </Typography>

              <Chip
                label={post.skill}
                size="small"
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              />
            </Box>
          </Box>
        </Box>

        <Typography mt={2} fontWeight={700}>
          {post.title}
        </Typography>

        <Typography color="text.secondary" mt={1}>
          {post.description}
        </Typography>

        {post.audio_path && (
          <Box mt={2} display="flex" alignItems="center" gap={2}>
            <CustomAudioPlayer src={post.audio_path} isActive />
          </Box>
        )}

        {post.user_answer_text && (
          <Box
            mt={2}
            p={2}
            sx={{
              bgcolor: '#f8eee7',
              borderRadius: 2,
              border: '1px solid #e8d5c8',
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {post.user_answer_text}
            </Typography>
          </Box>
        )}

        <Box
          mt={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ borderTop: '1px solid #f0f0f0', pt: 2 }}
        >
          <Box display="flex" gap={1}>
            <Button
              size="small"
              startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={handleLike}
              sx={{
                textTransform: 'none',
                color: liked ? 'error.main' : 'text.secondary',
                fontWeight: 700,
                '&:hover': { bgcolor: 'transparent', color: 'error.light' },
              }}
            >
              {liked ? 'Liked' : 'Like'}
            </Button>

            <Button
              size="small"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={() => setModalOpen(true)}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                fontWeight: 700,
                '&:hover': { bgcolor: 'transparent' },
              }}
            >
              Comment
            </Button>
          </Box>

          <Box display="flex" gap={2} color="text.secondary">
            <Box display="flex" alignItems="center" gap={0.5}>
              <FavoriteBorderIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                {likeCount}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={0.5}>
              <ChatBubbleOutlineIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                {commentCount}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      <ForumPostModal
        post={post}
        open={modalOpen}
        onClose={handleCloseModal}
        liked={liked}
        likeCount={likeCount}
        onLikeToggle={handleLike}
        commentCount={commentCount}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </Card>
  );
}
