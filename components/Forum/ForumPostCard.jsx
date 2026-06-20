/* global URLSearchParams */
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CustomAudioPlayer from '../Test/customAudioPlayer';
import { useState, useRef, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { useAuth } from '../../hooks/useAuth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { reactToPost, editPost, deletePost } from '../../api/forum';
import ForumPostModal from './ForumPostModal';
import { formatDateTime } from '../../utils/stringFormat';
import styles from '../../styles/Forum/ForumPostCardStyles';

const DEBOUNCE_MS = 800;

export default function ForumPostCard({ post, initialOpen = false }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [modalOpen, setModalOpen] = useState(initialOpen);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDescription, setEditDescription] = useState(post.description ?? '');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef(null);
  const pendingLikedRef = useRef(post.is_liked ?? false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (String(post.id) === searchParams.get('open_post')) {
      setModalOpen(true);
    }
  }, [searchParams, post.id]);

  const handleMoreClick = (e) => setAnchorEl(e.currentTarget);
  const handleMoreClose = () => setAnchorEl(null);
  const handleEditClick = () => {
    setEditTitle(post.title);
    setEditDescription(post.description ?? '');
    setEditDialogOpen(true);
    handleMoreClose();
  };
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMoreClose();
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      const nextTitle = editTitle.trim();
      const nextDescription = editDescription.trim();

      if (nextTitle === post.title && nextDescription === (post.description ?? '')) {
        setEditDialogOpen(false);
        setEditLoading(false);
        return;
      }

      await editPost({ title: nextTitle, description: nextDescription }, post.id);
      post.title = nextTitle;
      post.description = nextDescription;
      setEditDialogOpen(false);
      setSnackbar({ open: true, message: 'Post updated!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update post.', severity: 'error' });
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(post.title);
    setEditDescription(post.description ?? '');
    setEditDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deletePost(post.id);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Post deleted successfully!', severity: 'success' });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete post.', severity: 'error' });
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

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
    <Card sx={styles.card}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box display="flex" gap={1.5} alignItems="flex-start">
          <Avatar src={post.author_avatar} />

          <Box flex={1} minWidth={0}>
            <Box
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
              gap={1}
              flexWrap="wrap"
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={styles.authorName}>
                  {post.author_name || post.author_username}
                </Typography>
                <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(post.created_at)}
                  </Typography>
                  <Chip
                    label={post.skill}
                    size="small"
                    sx={{ bgcolor: 'primary.main', color: 'white' }}
                  />
                </Box>
              </Box>

              {user?.id && String(user.id) === String(post.author_id) && (
                <>
                  <IconButton
                    size="small"
                    onClick={handleMoreClick}
                    aria-label="Open post actions"
                    sx={styles.moreButton}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMoreClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    slotProps={{
                      paper: {
                        elevation: 0,
                        sx: styles.menuPaper,
                      },
                    }}
                  >
                    <MenuItem onClick={handleEditClick} sx={styles.menuItem}>
                      <ListItemText
                        primary="Edit"
                        primaryTypographyProps={{ fontSize: '15px', lineHeight: 1.2 }}
                      />
                    </MenuItem>

                    <Divider sx={{ my: 0.25 }} />

                    <MenuItem onClick={handleDeleteClick} sx={styles.deleteMenuItem}>
                      <ListItemText
                        primary="Delete"
                        primaryTypographyProps={{ fontSize: '15px', lineHeight: 1.2 }}
                      />
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>

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
        </Box>

        <Typography sx={styles.title}>{post.title}</Typography>

        <Typography color="text.secondary" mt={1} sx={styles.description}>
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
            <Typography variant="body2" sx={styles.userAnswer}>
              {post.user_answer_text}
            </Typography>
          </Box>
        )}

        <Box
          mt={3}
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1.5}
          sx={{ borderTop: '1px solid #f0f0f0', pt: 2 }}
        >
          <Box display="flex" gap={1} flexWrap="wrap" minWidth={0}>
            <Button
              size="medium"
              startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={handleLike}
              sx={{ ...styles.likeButton, color: liked ? 'error.main' : styles.likeButton.color }}
            >
              {liked ? 'Liked' : 'Like'}
            </Button>

            <Button
              size="medium"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={() => setModalOpen(true)}
              sx={styles.commentButton}
            >
              Comment
            </Button>
          </Box>

          <Box display="flex" gap={2} color="text.secondary" flexWrap="wrap" flexShrink={0}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <FavoriteBorderIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600} sx={styles.countText}>
                {likeCount}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={0.5}>
              <ChatBubbleOutlineIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600} sx={styles.countText}>
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

      {/* Inline title editing replaces previous edit dialog */}

      <Dialog open={editDialogOpen} onClose={handleCancelEdit} fullWidth maxWidth="sm">
        <DialogTitle sx={styles.editDialogTitle}>Edit Post</DialogTitle>
        <DialogContent sx={styles.editDialogContent}>
          <TextField
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
          />
          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} disabled={editLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={editLoading || !editTitle.trim()}
          >
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: styles.deleteDialogPaper }}
      >
        <DialogContent sx={styles.deleteDialogContent}>
          <Box sx={styles.deleteDialogSurface}>
            <Box sx={styles.deleteIconWrap}>
              <WarningAmberRoundedIcon fontSize="small" />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={styles.deleteTitle}>Confirm Delete</Typography>
              <Typography sx={styles.deleteDescription}>
                Are you sure you want to delete this post? This action cannot be undone.
              </Typography>

              <DialogActions sx={styles.deleteActions}>
                <Button
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteLoading}
                  variant="outlined"
                  sx={styles.deleteCancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  variant="contained"
                  disabled={deleteLoading}
                  sx={styles.deleteConfirmButton}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogActions>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
