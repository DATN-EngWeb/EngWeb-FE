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
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CustomAudioPlayer from '../Test/customAudioPlayer';
import { useState, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { useAuth } from '../../hooks/useAuth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { reactToPost, editPost, deletePost } from '../../api/forum';
import ForumPostModal from './ForumPostModal';
import { formatDate } from '../../utils/stringFormat';

const DEBOUNCE_MS = 800;

export default function ForumPostCard({ post, initialOpen = false }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [modalOpen, setModalOpen] = useState(initialOpen);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDescription, setEditDescription] = useState(post.description);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef(null);
  const pendingLikedRef = useRef(post.is_liked ?? false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleMoreClick = (e) => setAnchorEl(e.currentTarget);
  const handleMoreClose = () => setAnchorEl(null);
  const handleEditClick = () => {
    setEditTitle(post.title);
    setEditDescription(post.description);
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
      const data = {};
      if (editTitle !== post.title) data.title = editTitle;
      if (editDescription !== post.description) data.description = editDescription;
      if (Object.keys(data).length === 0) {
        setEditDialogOpen(false);
        setEditLoading(false);
        return;
      }
      await editPost(data, post.id);
      setEditDialogOpen(false);
      if (data.title) post.title = data.title;
      if (data.description) post.description = data.description;
      setSnackbar({ open: true, message: 'Post updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update post.', severity: 'error' });
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setEditLoading(false);
    }
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
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={post.author_avatar} />
          <Box flex={1}>
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
          {user?.id && String(user.id) === String(post.author_id) && (
            <>
              <IconButton size="small" onClick={handleMoreClick} sx={{ ml: 'auto' }}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMoreClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleEditClick}>Edit</MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
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
              size="medium"
              startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={handleLike}
              sx={{
                textTransform: 'none',
                color: liked ? 'error.main' : 'text.secondary',
                fontWeight: 700,
                fontSize: '0.95rem',
                minHeight: 34,
                px: 1.25,
                '& .MuiButton-startIcon svg': { fontSize: '1.1rem' },
                '&:hover': { bgcolor: 'transparent', color: 'error.light' },
              }}
            >
              {liked ? 'Liked' : 'Like'}
            </Button>

            <Button
              size="medium"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={() => setModalOpen(true)}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                fontWeight: 700,
                fontSize: '0.95rem',
                minHeight: 34,
                px: 1.25,
                '& .MuiButton-startIcon svg': { fontSize: '1.1rem' },
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

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            fullWidth
            margin="dense"
            autoFocus
            sx={{ mb: 2, borderRadius: 2, background: '#fafbfc' }}
            InputProps={{ style: { borderRadius: 10 } }}
          />
          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            fullWidth
            margin="dense"
            multiline
            minRows={3}
            sx={{ borderRadius: 2, background: '#fafbfc' }}
            InputProps={{ style: { borderRadius: 10 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={editLoading}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            disabled={editLoading || (!editTitle.trim() && !editDescription.trim())}
            variant="contained"
            sx={{ borderRadius: 2, boxShadow: 'none', fontWeight: 600 }}
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
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
