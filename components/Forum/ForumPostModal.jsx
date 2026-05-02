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
  Menu,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import CustomAudioPlayer from '../Test/customAudioPlayer';
import { useState, useEffect, useRef } from 'react';
import { getComments, createComment, editComment, deleteComment } from '../../api/forum';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Snackbar from '@mui/material/Snackbar';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/stringFormat';

const PAGE_SIZE = 10;

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

  const { user } = useAuth();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [anchorElMap, setAnchorElMap] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (comment) => {
    setDeleteLoadingId(comment.id);
    setAnchorElMap((prev) => ({ ...prev, [comment.id]: null }));
    try {
      await deleteComment(comment.id);
      setComments((prev) => prev.filter((com) => com.id !== comment.id));
      setSnackbar({
        open: true,
        message: 'Comment deleted',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete comment',
        severity: 'error',
      });
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleEditComment = async (comment) => {
    setEditLoading(true);
    try {
      await editComment({ content: editCommentText }, comment.id);
      setComments((prev) =>
        prev.map((com) => (com.id === comment.id ? { ...com, content: editCommentText } : com)),
      );
      setEditingCommentId(null);
      setSnackbar({
        open: true,
        message: 'Comment updated',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update comment',
        severity: 'error',
      });
    } finally {
      setEditLoading(false);
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
                  {formatDate(post.created_at)}
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

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ borderTop: '1px solid #f0f0f0', pt: 2, mt: 2, mb: 2 }}
          >
            <Button
              size="small"
              startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={onLikeToggle}
              sx={{
                textTransform: 'none',
                color: liked ? 'error.main' : 'text.secondary',
                fontWeight: 700,
                p: 0,
                minWidth: 'auto',
                '&:hover': { bgcolor: 'transparent', color: 'error.light' },
              }}
            >
              {liked ? 'Liked' : 'Like'}
            </Button>

            <Box display="flex" gap={2} color="text.secondary">
              <Box display="flex" alignItems="center" gap={0.5}>
                <FavoriteBorderIcon fontSize="small" />
                <Typography fontSize="small" variant="body2" fontWeight={600}>
                  {likeCount}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <ChatBubbleOutlineIcon fontSize="small" />
                <Typography fontSize="small" variant="body2" fontWeight={600}>
                  {commentCount}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={ordering}
                onChange={handleOrderingChange}
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  bgcolor: '#fafafa',
                  '& .MuiSelect-select': { py: 0.5 },
                }}
              >
                <MenuItem value="-created_at" sx={{ fontSize: '13px' }}>
                  Newest first
                </MenuItem>
                <MenuItem value="created_at" sx={{ fontSize: '13px' }}>
                  Oldest first
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

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
              {comments.map((c, i) => {
                const isAuthor = user?.id && String(user.id) === String(c.author_id);
                const isEditing = editingCommentId === c.id;
                return (
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
                      <Box display="flex" alignItems="center">
                        <Typography fontWeight={700} variant="body2" flex={1}>
                          {c.author_name}
                        </Typography>
                        {c.created_at && (
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: isAuthor && !isEditing ? 36 : 12,
                              color: '#6B2C1F',
                            }}
                          >
                            {formatDate(c.created_at)}
                          </Typography>
                        )}
                        {isAuthor && !isEditing && (
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 2, right: 4 }}
                            onClick={(e) =>
                              setAnchorElMap((prev) => ({ ...prev, [c.id]: e.currentTarget }))
                            }
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                        {isAuthor && !isEditing && (
                          <Menu
                            anchorEl={anchorElMap[c.id]}
                            open={Boolean(anchorElMap[c.id])}
                            onClose={() => setAnchorElMap((prev) => ({ ...prev, [c.id]: null }))}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                          >
                            <MenuItem
                              onClick={() => {
                                setEditingCommentId(c.id);
                                setEditCommentText(c.content);
                                setAnchorElMap((prev) => ({ ...prev, [c.id]: null }));
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleDeleteComment(c)}
                              sx={{ color: 'error.main' }}
                              disabled={deleteLoadingId === c.id}
                            >
                              {deleteLoadingId === c.id ? 'Deleting...' : 'Delete'}
                            </MenuItem>
                          </Menu>
                        )}
                      </Box>
                      {isEditing ? (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <TextField
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            size="small"
                            fullWidth
                            multiline
                            minRows={1}
                            maxRows={4}
                            sx={{ background: '#fff', borderRadius: 1 }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            disabled={editLoading || !editCommentText.trim()}
                            onClick={() => handleEditComment(c)}
                            sx={{ minWidth: 0, px: 1.5, borderRadius: 2 }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setEditingCommentId(null)}
                            sx={{ minWidth: 0, px: 1.5, borderRadius: 2 }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: 'pre-line', mt: 1 }}
                        >
                          {c.content}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <Alert
                  severity={snackbar.severity}
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>
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
