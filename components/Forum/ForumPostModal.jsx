'use client';

import {
  Dialog,
  DialogContent,
  Avatar,
  Box,
  Typography,
  Chip,
  Divider,
  TextField,
  IconButton,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import CustomAudioPlayer from '../Test/customAudioPlayer';
import { useState, useEffect, useRef } from 'react';
import { getComments, createComment, reactToPost } from '../../api/forum';

const DEBOUNCE_MS = 800;

export default function ForumPostModal({
  post,
  open,
  onClose,
  liked,
  likeCount,
  onLikeToggle,
  commentCount,
  onCommentAdded,
}) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [ordering, setOrdering] = useState('-created_at');
  const bottomRef = useRef(null);

  const PAGE_SIZE = 10;

  const fetchPage = async (page = 1, append = false, order = ordering) => {
    if (page === 1) setLoadingComments(true);
    else setLoadingMore(true);
    try {
      const data = await getComments({
        post_id: post.id,
        page,
        page_size: PAGE_SIZE,
        ordering: order,
      });
      const results = data?.results ?? data ?? [];
      setComments((prev) => (append ? [...prev, ...results] : results));
      setNextPage(data?.next ? page + 1 : null);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchPage(1, false, ordering);
  }, [open, post.id]);

  const handleOrderingChange = (e) => {
    const newOrder = e.target.value;
    setOrdering(newOrder);
    fetchPage(1, false, newOrder);
  };

  const handleSend = async () => {
    const text = commentText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await createComment({ post_id: post.id, content: text });
      const data = await getComments({
        post_id: post.id,
        page: 1,
        page_size: PAGE_SIZE,
        ordering,
      });
      setComments(data?.results ?? data ?? []);
      setNextPage(data?.next ? 2 : null);
      onCommentAdded?.();
      setCommentText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
    >
      <DialogContent
        sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
      >
        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, px: 3, py: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
            <Avatar src={post.author_avatar} />
            <Box flex={1}>
              <Typography fontWeight={700}>{post.author_name}</Typography>
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.created_at).toLocaleDateString()}
                </Typography>
                <Chip label={post.skill} size="small" sx={{ bgcolor: '#6B2C1F', color: '#fff' }} />
              </Box>
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ ml: 'auto', color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography fontWeight={700} mb={0.5}>
            {post.title}
          </Typography>
          <Typography color="text.secondary" mb={1.5}>
            {post.description}
          </Typography>

          {post.audio_path && (
            <Box mb={2}>
              <CustomAudioPlayer src={post.audio_path} isActive />
            </Box>
          )}

          {post.user_answer_text && (
            <Box mb={2} p={2} sx={{ bgcolor: '#f0f0f0', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#333' }}>
                {post.user_answer_text}
              </Typography>
            </Box>
          )}

          <Box display="flex" justifyContent="flex-end" gap={2} color="text.secondary" mb={1}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <FavoriteBorderIcon fontSize="small" />
              {likeCount}
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <ChatBubbleOutlineIcon fontSize="small" />
              {commentCount}
            </Box>
          </Box>

          <Divider sx={{ borderStyle: 'dashed', mb: 1.5 }} />

          <Box
            component="button"
            onClick={onLikeToggle}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              border: 'none',
              bgcolor: 'transparent',
              cursor: 'pointer',
              color: liked ? '#6B2C1F' : 'text.secondary',
              fontWeight: liked ? 700 : 400,
              mb: 2,
              p: 0,
            }}
          >
            {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            <Typography variant="body2">{liked ? 'Liked' : 'Like'}</Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />
          <FormControl size="small" sx={{ mb: 2, minWidth: 160 }}>
            <Select value={ordering} label="Sort by" onChange={handleOrderingChange}>
              <MenuItem value="-created_at">Newest first</MenuItem>
              <MenuItem value="created_at">Oldest first</MenuItem>
            </Select>
          </FormControl>

          {loadingComments ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              No comments yet. Be the first!
            </Typography>
          ) : (
            <>
              {comments.map((c, i) => (
                <Box key={c.id ?? i} display="flex" gap={1.5} mb={2}>
                  <Avatar src={c.author_avatar} sx={{ width: 36, height: 36 }} />
                  <Box
                    flex={1}
                    sx={{
                      bgcolor: '#f0f0f0',
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      position: 'relative',
                    }}
                  >
                    <Typography fontWeight={700} variant="body2">
                      {c.author_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {c.content}
                    </Typography>
                    {c.created_at && (
                      <Typography
                        variant="caption"
                        sx={{ position: 'absolute', top: 10, right: 12, color: '#6B2C1F' }}
                      >
                        {new Date(c.created_at).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
              {nextPage && (
                <Box display="flex" justifyContent="center" mb={2}>
                  <Button
                    size="small"
                    onClick={() => fetchPage(nextPage, true)}
                    disabled={loadingMore}
                    sx={{ textTransform: 'none', color: '#6B2C1F' }}
                  >
                    {loadingMore && <CircularProgress size={14} sx={{ mr: 1 }} />}
                    Load more
                  </Button>
                </Box>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </Box>

        <Box
          sx={{
            borderTop: '1px solid #eee',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#fff',
          }}
        >
          <Avatar sx={{ width: 32, height: 32 }} />
          <TextField
            fullWidth
            size="small"
            placeholder="Write your comment...."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6 } }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!commentText.trim() || submitting}
            sx={{ color: '#6B2C1F' }}
          >
            {submitting ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
