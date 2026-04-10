'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  getTestFeedbacks,
  createTestFeedback,
  updateTestFeedback,
  deleteTestFeedback,
} from '../../../api/feedback';

export default function FeedbackPanel({
  testId,
  feedbackFilter = 'all',
  compact = false,
  readOnly = false,
}) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [ordering, setOrdering] = useState('-created_at');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const allowCreate = !readOnly && feedbackFilter !== 'ai';
  const allowManage = !readOnly;

  const fetchFeedbacks = useCallback(async () => {
    setLoadingFeedbacks(true);
    try {
      const data = await getTestFeedbacks({ test_id: testId, ordering });
      setFeedbacks(data?.results ?? data ?? []);
      setNextPage(data?.next ?? null);
    } catch (err) {
      console.error('Failed to load feedbacks:', err); // eslint-disable-line no-console
    } finally {
      setLoadingFeedbacks(false);
    }
  }, [testId, ordering]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleLoadMore = async () => {
    if (!nextPage || loadingMore) return;
    setLoadingMore(true);
    try {
      const url = new URL(nextPage);
      const page = url.searchParams.get('page');
      const data = await getTestFeedbacks({ test_id: testId, page, ordering });
      setFeedbacks((prev) => [...prev, ...(data?.results ?? [])]);
      setNextPage(data?.next ?? null);
    } catch (err) {
      console.error('Failed to load more feedbacks:', err); // eslint-disable-line no-console
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOrderingChange = (event) => {
    setOrdering(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allowCreate) return;
    const text = comment.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await createTestFeedback({ test_id: Number(testId), comment: text });
      setComment('');
      await fetchFeedbacks();
    } catch (err) {
      console.error('Failed to submit feedback:', err); // eslint-disable-line no-console
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStart = (fb) => {
    setEditingId(fb.id);
    setEditText(fb.comment);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditSave = async (feedbackId) => {
    if (readOnly) return;
    const text = editText.trim();
    if (!text || savingId) return;
    setSavingId(feedbackId);
    try {
      await updateTestFeedback({ feedback_id: feedbackId, comment: text });
      setFeedbacks((prev) =>
        prev.map((fb) => (fb.id === feedbackId ? { ...fb, comment: text } : fb)),
      );
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to update feedback:', err); // eslint-disable-line no-console
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (readOnly || deletingId) return;
    setDeletingId(feedbackId);
    try {
      await deleteTestFeedback(feedbackId);
      setFeedbacks((prev) => prev.filter((fb) => fb.id !== feedbackId));
    } catch (err) {
      console.error('Failed to delete feedback:', err); // eslint-disable-line no-console
    } finally {
      setDeletingId(null);
    }
  };

  const isOwn = (fb) => fb.created_by !== 'A' && String(fb.author_id) === String(currentUserId);
  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (feedbackFilter === 'ai') return fb.created_by === 'A';
    if (feedbackFilter === 'teacher') return fb.created_by !== 'A';
    return true;
  });

  const cardPadding = compact ? 1.5 : 2.5;
  const titleFontSize = compact ? 13 : 15;
  const commentRows = compact ? 3 : 4;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!readOnly && (
        <Paper
          elevation={0}
          sx={{
            p: cardPadding,
            borderRadius: 3,
            mb: compact ? 1.5 : 2.5,
            border: '1px solid #f0f0f0',
            flexShrink: 0,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <SmartToyIcon sx={{ color: 'primary.main' }} />
            <Typography fontWeight={700} fontSize={titleFontSize}>
              Write your comment
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              multiline
              rows={commentRows}
              fullWidth
              placeholder={
                allowCreate ? 'Add your feedback for this test...' : 'AI feedback is read-only'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!allowCreate}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' },
              }}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                size="small"
                endIcon={<SendIcon />}
                disabled={!allowCreate || submitting || !comment.trim()}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                {submitting ? 'Sending...' : 'Send'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Paper
        elevation={0}
        sx={{
          p: cardPadding,
          borderRadius: 3,
          border: '1px solid #f0f0f0',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          mb={2}
          flexWrap="wrap"
        >
          <Typography fontWeight={700} fontSize={titleFontSize}>
            Comments
          </Typography>
          {feedbackFilter !== 'ai' && (
            <FormControl size="small" sx={{ minWidth: compact ? 130 : 150 }}>
              <Select
                value={ordering}
                onChange={handleOrderingChange}
                sx={{ borderRadius: 2, fontSize: 13, height: compact ? 32 : 36 }}
              >
                <MenuItem value="-created_at">Newest</MenuItem>
                <MenuItem value="created_at">Oldest</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
        {loadingFeedbacks ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} />
          </Box>
        ) : filteredFeedbacks.length === 0 ? (
          <Typography color="text.secondary" fontSize={14} textAlign="center" py={2}>
            No comments yet.
          </Typography>
        ) : (
          filteredFeedbacks.map((fb, idx) => (
            <Box key={fb.id}>
              {idx > 0 && <Divider sx={{ my: 1.5 }} />}
              <Box display="flex" gap={1.5} alignItems="flex-start">
                <Avatar src={fb.author_avatar} sx={{ width: 28, height: 28, mt: 0.3 }} />
                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.3}>
                    <Typography fontWeight={700} fontSize={13} noWrap>
                      {fb.author_name}
                    </Typography>
                    {fb.created_by === 'A' && (
                      <Chip
                        label="AI"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          bgcolor: '#f3e5f5',
                          color: '#9c27b0',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography
                      fontSize={12}
                      color="text.secondary"
                      ml="auto"
                      noWrap
                      flexShrink={0}
                    >
                      {new Date(fb.created_at).toLocaleDateString('en-GB')}
                    </Typography>
                    {allowManage && isOwn(fb) && editingId !== fb.id && (
                      <Box display="flex" gap={0.25} flexShrink={0}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditStart(fb)}
                            sx={{ p: 0.25 }}
                          >
                            <EditIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(fb.id)}
                            disabled={deletingId === fb.id}
                            sx={{ p: 0.25 }}
                          >
                            <DeleteIcon
                              sx={{
                                fontSize: 14,
                                color: deletingId === fb.id ? 'text.disabled' : 'error.main',
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>

                  {allowManage && editingId === fb.id ? (
                    <Box>
                      <TextField
                        multiline
                        fullWidth
                        size="small"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        sx={{
                          mb: 0.75,
                          '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13 },
                        }}
                        autoFocus
                      />
                      <Box display="flex" gap={0.5} justifyContent="flex-end">
                        <Button
                          size="small"
                          onClick={handleEditCancel}
                          startIcon={<CloseIcon />}
                          sx={{ textTransform: 'none', fontSize: 12, minWidth: 0, px: 1 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleEditSave(fb.id)}
                          startIcon={<CheckIcon />}
                          disabled={savingId === fb.id || !editText.trim()}
                          sx={{ textTransform: 'none', fontSize: 12, minWidth: 0, px: 1 }}
                        >
                          {savingId === fb.id ? 'Saving...' : 'Save'}
                        </Button>
                      </Box>
                    </Box>
                  ) : fb.created_by === 'A' ? (
                    <Box
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.82rem',
                        lineHeight: 1.65,
                        '& h3': {
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: 'text.primary',
                          mt: 1.25,
                          mb: 0.5,
                          backgroundColor: 'rgba(25, 118, 210, 0.05)',
                          padding: '6px 10px',
                          borderRadius: 1,
                          borderLeft: '3px solid',
                          borderLeftColor: 'primary.main',
                        },
                        '& h3:first-of-type': {
                          mt: 0,
                        },
                        '& p': {
                          m: 0,
                          mb: 0.75,
                          lineHeight: 1.65,
                        },
                        '& ul': {
                          m: 0,
                          mb: 0.75,
                          pl: 2,
                          listStyleType: 'disc',
                        },
                        '& ol': {
                          m: 0,
                          mb: 0.75,
                          pl: 2,
                          listStyleType: 'decimal',
                        },
                        '& ul li, & ol li': {
                          mb: 0.5,
                          lineHeight: 1.55,
                        },
                        '& strong': {
                          fontWeight: 700,
                        },
                        '& em': {
                          fontStyle: 'italic',
                        },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: fb.comment || '<p>No comment content.</p>',
                      }}
                    />
                  ) : (
                    <Typography fontSize={13} color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {fb.comment}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))
        )}
        {nextPage && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              size="small"
              onClick={handleLoadMore}
              disabled={loadingMore}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13 }}
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
