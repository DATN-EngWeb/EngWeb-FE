'use client';

import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import WavyDots from './WavyDots';

const MODE_CONFIG_BY_ID = {
  translate: { label: 'Translate', icon: AutoAwesomeRoundedIcon },
  grammar: { label: 'Grammar', icon: AutoAwesomeRoundedIcon },
  vocabulary: { label: 'Vocabulary', icon: AutoAwesomeRoundedIcon },
  brainstorm: { label: 'Brainstorm', icon: AutoAwesomeRoundedIcon },
  general: { label: 'General', icon: AutoAwesomeRoundedIcon },
};

export default function ConversationSidebar({
  open,
  onClose,
  conversations,
  isLoadingConversations,
  activeConversationId,
  isCreatingConversation,
  editingId,
  editingTitle,
  editingLoading,
  menuAnchorEl,
  menuConversationId,
  onCreateConversation,
  onOpenConversation,
  onEditConversation,
  onEditTitleChange,
  onSaveEditConversation,
  onCancelEditConversation,
  onArchiveConversation,
  onMenuOpen,
  onMenuClose,
  onMenuEdit,
  onMenuArchive,
}) {
  const visibleConversations = Array.isArray(conversations)
    ? conversations.filter((conversation) => !conversation?.isDraft)
    : [];

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteConversation, setPendingDeleteConversation] = useState(null);

  const handleRequestDelete = (event, conversation) => {
    event.stopPropagation();
    setPendingDeleteConversation(conversation);
    setConfirmDeleteOpen(true);
    onMenuClose();
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setPendingDeleteConversation(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteConversation) return;

    await onMenuArchive?.({ stopPropagation() {} }, pendingDeleteConversation);
    setConfirmDeleteOpen(false);
    setPendingDeleteConversation(null);
  };

  return (
    <Box
      sx={{
        p: 2.25,
        borderRight: { md: '1px solid rgba(0, 0, 0, 0.08)' },
        bgcolor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: '0 14px 28px rgba(83, 40, 34, 0.22)',
            }}
          >
            <AutoAwesomeRoundedIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              AI Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Mode-first chat for students
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={onClose} sx={{ bgcolor: 'background.paper' }}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={
            isCreatingConversation ? (
              <WavyDots color="primary.contrastText" />
            ) : (
              <AddCommentRoundedIcon />
            )
          }
          onClick={() => onCreateConversation('general')}
          disabled={isCreatingConversation}
          sx={{ py: 1.2, fontWeight: 800 }}
        >
          {isCreatingConversation ? 'Creating...' : 'New conversation'}
        </Button>
      </Stack>

      <Box sx={{ mt: 2.25, flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 900 }}>
          Recent conversations
        </Typography>
        <Stack spacing={1.1} sx={{ mt: 1 }}>
          {isLoadingConversations ? (
            <>
              {[1, 2, 3].map((i) => (
                <Paper
                  key={`skeleton-${i}`}
                  sx={{
                    p: 1.25,
                    borderRadius: 3,
                    bgcolor: 'rgba(0, 0, 0, 0.06)',
                    border: 'none',
                    display: 'flex',
                    gap: 1.25,
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'rgba(0, 0, 0, 0.08)',
                      flexShrink: 0,
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        height: 12,
                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                        borderRadius: 1,
                        mb: 0.75,
                        width: '70%',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                    <Box
                      sx={{
                        height: 10,
                        bgcolor: 'rgba(0, 0, 0, 0.06)',
                        borderRadius: 1,
                        width: '50%',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </>
          ) : visibleConversations.length === 0 ? (
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(83, 40, 34, 0.03)',
                border: '1px dashed rgba(83, 40, 34, 0.14)',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                No recent conversations
              </Typography>
            </Paper>
          ) : (
            visibleConversations.map((conversation) => {
              const conversationKey = conversation.id || conversation.localId;
              const isActive =
                conversationKey === activeConversationId ||
                (!conversation.id && conversation.localId === activeConversationId);
              const modeConfig =
                MODE_CONFIG_BY_ID[conversation.mode || 'general'] || MODE_CONFIG_BY_ID.general;
              const ModeIcon = modeConfig.icon || AutoAwesomeRoundedIcon;

              return (
                <Paper
                  key={conversationKey}
                  role="button"
                  tabIndex={0}
                  onClick={() => conversation.id && onOpenConversation(conversation)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      if (conversation.id) {
                        onOpenConversation(conversation);
                      }
                    }
                  }}
                  sx={{
                    p: 1.25,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isActive ? 'primary.main' : 'rgba(83, 40, 34, 0.08)',
                    bgcolor: isActive ? 'rgba(83, 40, 34, 0.05)' : 'background.paper',
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          {editingId === conversationKey ? (
                            <Stack spacing={0.75} sx={{ width: '100%' }}>
                              <TextField
                                value={editingTitle}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => onEditTitleChange(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onSaveEditConversation(conversationKey);
                                  }
                                  if (e.key === 'Escape') {
                                    onCancelEditConversation(e);
                                  }
                                }}
                                disabled={editingLoading}
                                size="small"
                                variant="outlined"
                                fullWidth
                                autoFocus
                                InputProps={{
                                  style: { fontWeight: 700, fontSize: '0.95rem' },
                                }}
                              />
                              <Stack direction="row" spacing={0.75}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onSaveEditConversation(conversationKey);
                                  }}
                                  disabled={editingLoading}
                                  startIcon={<CheckRoundedIcon />}
                                  sx={{ borderRadius: 1.5, fontWeight: 700, flex: 1 }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onCancelEditConversation(event);
                                  }}
                                  disabled={editingLoading}
                                  startIcon={<CloseRoundedIcon />}
                                  sx={{ borderRadius: 1.5, fontWeight: 700, flex: 1 }}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </Stack>
                          ) : (
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }} noWrap>
                              {conversation.title}
                            </Typography>
                          )}
                        </Box>

                        {editingId !== conversationKey && (
                          <>
                            <Tooltip title="Options">
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onMenuOpen(event, conversationKey);
                                }}
                                sx={{ color: 'text.secondary', flexShrink: 0 }}
                              >
                                <MoreVertRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Menu
                              anchorEl={menuAnchorEl}
                              open={menuConversationId === conversationKey && !!menuAnchorEl}
                              onClose={onMenuClose}
                              PaperProps={{
                                sx: {
                                  borderRadius: 2,
                                  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                                },
                              }}
                            >
                              <MenuItem
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onMenuEdit(event, conversation);
                                }}
                                sx={{ fontWeight: 600 }}
                              >
                                <EditRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
                                Edit
                              </MenuItem>
                              <MenuItem
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRequestDelete(event, conversation);
                                }}
                                sx={{ fontWeight: 600, color: 'error.dark' }}
                              >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
                                Delete
                              </MenuItem>
                            </Menu>
                          </>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              );
            })
          )}
        </Stack>
      </Box>

      <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete conversation?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This conversation will be removed from your list. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
