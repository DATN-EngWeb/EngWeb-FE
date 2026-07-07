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
  DialogActions,
  Menu,
  Alert,
  DialogTitle,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import CustomAudioPlayer from '../Test/customAudioPlayer';
import { useState, useEffect, useRef } from 'react';
import {
  getComments,
  createComment,
  editComment,
  deleteComment,
  editPost,
  deletePost,
} from '../../api/forum';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Snackbar from '@mui/material/Snackbar';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../utils/stringFormat';
import postCardStyles from '../../styles/Forum/ForumPostCardStyles';
import modalStyles from '../../styles/Forum/ForumPostModal';

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
  const [userAvatar, setUserAvatar] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [anchorElMap, setAnchorElMap] = useState({});
  const [postMenuAnchorEl, setPostMenuAnchorEl] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState(post.title);
  const [editPostDescription, setEditPostDescription] = useState(post.description ?? '');
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [editPostLoading, setEditPostLoading] = useState(false);
  const [deletePostDialogOpen, setDeletePostDialogOpen] = useState(false);
  const [deletePostLoading, setDeletePostLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteComment, setPendingDeleteComment] = useState(null);
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncAvatar = () => {
      const latestAvatar = localStorage.getItem('avatar_url') || localStorage.getItem('avatar');
      setUserAvatar(latestAvatar || null);
    };
    syncAvatar();
    window.addEventListener('auth-user-updated', syncAvatar);
    window.addEventListener('storage', syncAvatar);
    return () => {
      window.removeEventListener('auth-user-updated', syncAvatar);
      window.removeEventListener('storage', syncAvatar);
    };
  }, []);

  const handleOrderingChange = (e) => {
    const newOrder = e.target.value;
    setOrdering(newOrder);
    fetchPage(1, false, newOrder);
  };

  const handlePostMenuOpen = (event) => {
    setPostMenuAnchorEl(event.currentTarget);
  };

  const handlePostMenuClose = () => {
    setPostMenuAnchorEl(null);
  };

  const handleEditPostClick = () => {
    setEditPostTitle(post.title);
    setEditPostDescription(post.description ?? '');
    setEditPostDialogOpen(true);
    handlePostMenuClose();
  };

  const handleDeletePostClick = () => {
    setDeletePostDialogOpen(true);
    handlePostMenuClose();
  };

  const handleCancelEditPost = () => {
    setEditPostTitle(post.title);
    setEditPostDescription(post.description ?? '');
    setEditPostDialogOpen(false);
  };

  const handleSaveEditPost = async () => {
    setEditPostLoading(true);
    try {
      const nextTitle = editPostTitle.trim();
      const nextDescription = editPostDescription.trim();

      if (nextTitle === post.title && nextDescription === (post.description ?? '')) {
        setEditPostDialogOpen(false);
        return;
      }

      await editPost({ title: nextTitle, description: nextDescription }, post.id);
      post.title = nextTitle;
      post.description = nextDescription;
      setEditPostDialogOpen(false);
      setSnackbar({ open: true, message: 'Post updated', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update post', severity: 'error' });
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setEditPostLoading(false);
    }
  };

  const handleCancelDeletePost = () => {
    setDeletePostDialogOpen(false);
  };

  const handleConfirmDeletePost = async () => {
    setDeletePostLoading(true);
    try {
      await deletePost(post.id);
      setDeletePostDialogOpen(false);
      setSnackbar({ open: true, message: 'Post deleted successfully', severity: 'success' });
      onClose?.();
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete post', severity: 'error' });
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setDeletePostLoading(false);
    }
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

  const handleRequestDeleteComment = (comment) => {
    setAnchorElMap((prev) => ({ ...prev, [comment.id]: null }));
    setPendingDeleteComment(comment);
    setDeleteConfirmOpen(true);
  };

  const handleCancelDeleteComment = () => {
    setDeleteConfirmOpen(false);
    setPendingDeleteComment(null);
  };

  const handleConfirmDeleteComment = async () => {
    if (!pendingDeleteComment) return;

    setDeleteLoadingId(pendingDeleteComment.id);
    try {
      await deleteComment(pendingDeleteComment.id);
      setComments((prev) => prev.filter((com) => com.id !== pendingDeleteComment.id));
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
      setDeleteConfirmOpen(false);
      setPendingDeleteComment(null);
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: { xs: '96vh', sm: '92vh' },
          width: { xs: 'calc(100vw - 16px)', sm: '100%' },
          m: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogContent
        sx={{ ...modalStyles.dialogContent, px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2 } }}
      >
        <Box sx={modalStyles.stickyHeader}>
          <IconButton size="small" onClick={onClose} sx={modalStyles.stickyCloseButton}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{ ...modalStyles.scrollableContent, px: { xs: 0, sm: 3 }, py: { xs: 1.5, sm: 2 } }}
        >
          <Box display="flex" flexDirection="row" alignItems="center" gap={1.5} mb={1.5}>
            <Avatar src={post.author_avatar} />
            <Box flex={1} minWidth={0}>
              <Typography
                fontWeight={700}
                noWrap
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {post.author_name || post.author_username}
              </Typography>
              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(post.created_at)}
                </Typography>
                <Chip label={post.skill} size="small" sx={modalStyles.skillChip} />
              </Box>
            </Box>
            <Box
              sx={{
                ...modalStyles.postMenuBox,
                flexDirection: 'row',
                alignItems: 'center',
                ml: 'auto',
              }}
            >
              {user?.id && String(user.id) === String(post.author_id) && (
                <>
                  <IconButton size="small" onClick={handlePostMenuOpen} sx={modalStyles.moreButton}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={postMenuAnchorEl}
                    open={Boolean(postMenuAnchorEl)}
                    onClose={handlePostMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{
                      paper: {
                        elevation: 0,
                        sx: modalStyles.menuPaper,
                      },
                    }}
                  >
                    <MenuItem onClick={handleEditPostClick} sx={modalStyles.menuItem}>
                      Edit
                    </MenuItem>
                    <Divider sx={{ my: 0.25 }} />
                    <MenuItem onClick={handleDeletePostClick} sx={modalStyles.deleteMenuItem}>
                      Delete
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
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
            <Box mb={2} p={2} sx={{ bgcolor: '#f8eee7', borderRadius: 2 }}>
              <Typography variant="body2" sx={modalStyles.userAnswerText}>
                {post.user_answer_text}
              </Typography>
            </Box>
          )}

          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-end"
            gap={1}
            sx={modalStyles.likeCommentBox}
          >
            <Button
              size="small"
              startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={onLikeToggle}
              sx={{
                ...modalStyles.likeButton,
                color: liked ? 'error.main' : 'text.secondary',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {likeCount}
              </Typography>
            </Button>

            <Button
              size="small"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
              sx={modalStyles.likeButton}
            >
              <Typography variant="body2" fontWeight={600}>
                {commentCount}
              </Typography>
            </Button>
          </Box>

          <Divider sx={{ mb: 1 }} />
          <Box display="flex" justifyContent="flex-end" mb={1} width="100%">
            <Select
              value={ordering}
              onChange={handleOrderingChange}
              size="small"
              sx={{ ...modalStyles.selectSort, maxWidth: { xs: 140, sm: 180 } }}
              MenuProps={modalStyles.selectMenuProps}
            >
              <MenuItem value="-created_at" sx={modalStyles.selectMenuItem}>
                Newest
              </MenuItem>
              <MenuItem value="created_at" sx={modalStyles.selectMenuItem}>
                Oldest
              </MenuItem>
            </Select>
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
                  <Box key={c.id ?? i} display="flex" gap={1.5} mb={1.5} alignItems="flex-start">
                    <Avatar src={c.author_avatar} sx={modalStyles.commentAvatar} />
                    <Box flex={1} sx={modalStyles.commentBubble}>
                      <Box display="flex" alignItems="flex-start" flexWrap="wrap" gap={0.5}>
                        <Typography
                          fontWeight={700}
                          variant="body2"
                          sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}
                        >
                          {c.author_name || c.author_username}
                        </Typography>
                        {c.created_at && (
                          <Typography variant="caption" sx={modalStyles.commentTimestamp}>
                            {formatDateTime(c.created_at)}
                          </Typography>
                        )}
                        {isAuthor && !isEditing && (
                          <IconButton
                            size="small"
                            sx={modalStyles.commentMoreButton}
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
                            slotProps={{
                              paper: {
                                sx: {
                                  mt: 1,
                                  minWidth: 100,
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  border: '1px solid',
                                  borderColor: 'grey.200',
                                  boxShadow: '0px 8px 20px rgba(0,0,0,0.06)',
                                },
                              },
                            }}
                          >
                            <MenuItem
                              onClick={() => {
                                setEditingCommentId(c.id);
                                setEditCommentText(c.content);
                                setAnchorElMap((prev) => ({ ...prev, [c.id]: null }));
                              }}
                              sx={postCardStyles.menuItem}
                            >
                              Edit
                            </MenuItem>
                            <Divider sx={{ my: 0.25 }} />
                            <MenuItem
                              onClick={() => handleRequestDeleteComment(c)}
                              disabled={deleteLoadingId === c.id}
                              sx={postCardStyles.deleteMenuItem}
                            >
                              {deleteLoadingId === c.id ? 'Deleting...' : 'Delete'}
                            </MenuItem>
                          </Menu>
                        )}
                      </Box>
                      {isEditing ? (
                        <Box
                          display="flex"
                          flexDirection={{ xs: 'column', sm: 'row' }}
                          alignItems="stretch"
                          gap={1}
                          mt={1}
                        >
                          <TextField
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            size="small"
                            fullWidth
                            multiline
                            minRows={1}
                            maxRows={4}
                            sx={modalStyles.editCommentField}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            disabled={editLoading || !editCommentText.trim()}
                            onClick={() => handleEditComment(c)}
                            sx={{
                              ...modalStyles.editCommentButton,
                              width: { xs: '100%', sm: 'auto' },
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setEditingCommentId(null)}
                            sx={{
                              ...modalStyles.editCommentButton,
                              width: { xs: '100%', sm: 'auto' },
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={modalStyles.commentContent}
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
                    sx={modalStyles.loadMoreButton}
                  >
                    {loadingMore && <CircularProgress size={14} sx={modalStyles.loadMoreSpinner} />}
                    Load more
                  </Button>
                </Box>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </Box>

        <Dialog open={editPostDialogOpen} onClose={handleCancelEditPost} fullWidth maxWidth="sm">
          <DialogTitle sx={modalStyles.editDialogTitle}>Edit Post</DialogTitle>
          <DialogContent sx={modalStyles.editDialogContent}>
            <TextField
              label="Title"
              value={editPostTitle}
              onChange={(e) => setEditPostTitle(e.target.value)}
              fullWidth
              margin="normal"
              autoFocus
            />
            <TextField
              label="Description"
              value={editPostDescription}
              onChange={(e) => setEditPostDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              minRows={4}
            />
          </DialogContent>
          <DialogActions sx={modalStyles.editDialogActions}>
            <Button
              onClick={handleCancelEditPost}
              disabled={editPostLoading}
              sx={modalStyles.editDialogButton}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditPost}
              variant="contained"
              disabled={editPostLoading || !editPostTitle.trim()}
              sx={modalStyles.editDialogButton}
            >
              {editPostLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deletePostDialogOpen}
          onClose={handleCancelDeletePost}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: modalStyles.deleteDialogPaper }}
        >
          <DialogContent sx={modalStyles.deleteDialogContent}>
            <Box sx={modalStyles.deleteDialogSurface}>
              <Box sx={modalStyles.deleteIconWrap}>
                <WarningAmberRoundedIcon fontSize="small" />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={modalStyles.deleteTitle}>Confirm Delete</Typography>
                <Typography sx={modalStyles.deleteDescription}>
                  Are you sure you want to delete this post? This action cannot be undone.
                </Typography>

                <DialogActions sx={modalStyles.deleteActions}>
                  <Button
                    onClick={handleCancelDeletePost}
                    disabled={deletePostLoading}
                    variant="outlined"
                    sx={modalStyles.deleteCancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmDeletePost}
                    variant="contained"
                    disabled={deletePostLoading}
                    sx={modalStyles.deleteConfirmButton}
                  >
                    {deletePostLoading ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogActions>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deleteConfirmOpen}
          onClose={handleCancelDeleteComment}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '1px solid #f2c36f',
              bgcolor: 'white',
              boxShadow: '0 12px 32px rgba(83, 40, 34, 0.12)',
              overflow: 'hidden',
            },
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                width: '100%',
                gap: 1.5,
                px: 2.25,
                py: 2.25,
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#6B2C1F',
                  flexShrink: 0,
                  bgcolor: 'rgba(107, 44, 31, 0.08)',
                }}
              >
                <WarningAmberRoundedIcon fontSize="small" />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={modalStyles.deleteTitle}>Confirm Delete</Typography>
                <Typography sx={modalStyles.deleteDescription}>
                  This comment will be removed from the post. This action cannot be undone.
                </Typography>

                <DialogActions sx={modalStyles.deleteActions}>
                  <Button
                    onClick={handleCancelDeleteComment}
                    disabled={deleteLoadingId === pendingDeleteComment?.id}
                    variant="outlined"
                    sx={modalStyles.deleteCancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmDeleteComment}
                    variant="contained"
                    disabled={deleteLoadingId === pendingDeleteComment?.id}
                    sx={modalStyles.deleteConfirmButton}
                  >
                    {deleteLoadingId === pendingDeleteComment?.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogActions>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        <Box sx={modalStyles.commentInputBox}>
          <Avatar
            src={userAvatar || undefined}
            sx={{ width: 32, height: 32 }}
            alt={user?.username || 'User'}
          >
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </Avatar>
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
            sx={modalStyles.commentInput}
          />
          <IconButton
            onClick={handleSend}
            disabled={!commentText.trim() || submitting}
            sx={modalStyles.sendButton}
          >
            {submitting ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
