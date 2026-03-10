import { Card, CardContent, Typography, Avatar, Box, Button, Chip } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CustomAudioPlayer from '../Test/customAudioPlayer';
import { useState, useRef } from 'react';
import { reactToPost } from '../../api/forum';
import ForumPostModal from './ForumPostModal';

const DEBOUNCE_MS = 800;

export default function ForumPostCard({ post }) {
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [modalOpen, setModalOpen] = useState(false);
  const debounceRef = useRef(null);
  const pendingLikedRef = useRef(post.is_liked ?? false);

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
                {new Date(post.created_at).toLocaleDateString()}
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

        <Box mt={2} display="flex" justifyContent="flex-end" gap={2} color="text.secondary">
          <Box display="flex" alignItems="center" gap={0.5}>
            <FavoriteBorderIcon fontSize="small" />
            {likeCount}
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <ChatBubbleOutlineIcon fontSize="small" />
            {commentCount}
          </Box>
        </Box>

        <Box mt={2} mb={2} sx={{ borderBottom: '1px dashed #ddd' }} />

        <Box display="flex" gap={2}>
          <Button
            fullWidth
            variant={liked ? 'contained' : 'outlined'}
            startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleLike}
            sx={
              liked
                ? {
                    bgcolor: 'primary.main',
                    color: '#fff',
                    '&:hover': { bgcolor: 'primary.light' },
                  }
                : {}
            }
          >
            {liked ? 'Liked' : 'Like'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<ChatBubbleOutlineIcon />}
            onClick={() => setModalOpen(true)}
          >
            Comment
          </Button>
        </Box>
      </CardContent>

      <ForumPostModal
        post={post}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        liked={liked}
        likeCount={likeCount}
        onLikeToggle={handleLike}
        commentCount={commentCount}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </Card>
  );
}
