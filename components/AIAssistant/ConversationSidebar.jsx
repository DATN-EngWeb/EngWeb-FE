'use client';

import { useState } from 'react';
import {
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
  Divider,
} from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WavyDots from './WavyDots';
import {
  conversationSidebarStyles,
  getConversationItemPaperSx,
} from '../../styles/AIAssistant/ConversationSidebarStyles';

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
    <Box sx={conversationSidebarStyles.root}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={conversationSidebarStyles.logoWrap}>
            <AutoAwesomeRoundedIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={conversationSidebarStyles.title}>
              AI Assistant
            </Typography>
            <Typography variant="caption" sx={conversationSidebarStyles.subtitle}>
              Mode-first chat for students
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={onClose} sx={conversationSidebarStyles.closeButton}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={conversationSidebarStyles.createButtonRow}
      >
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
          sx={conversationSidebarStyles.createButton}
        >
          {isCreatingConversation ? 'Creating...' : 'New conversation'}
        </Button>
      </Stack>

      <Box sx={conversationSidebarStyles.listWrap}>
        <Typography variant="overline" sx={conversationSidebarStyles.listLabel}>
          Recent conversations
        </Typography>
        <Stack spacing={1.1} sx={conversationSidebarStyles.listStack}>
          {isLoadingConversations ? (
            <>
              {[1, 2, 3].map((i) => (
                <Paper key={`skeleton-${i}`} sx={conversationSidebarStyles.skeletonPaper}>
                  <Box sx={conversationSidebarStyles.skeletonThumb} />
                  <Box sx={conversationSidebarStyles.skeletonTextWrap}>
                    <Box sx={conversationSidebarStyles.skeletonLinePrimary} />
                    <Box sx={conversationSidebarStyles.skeletonLineSecondary} />
                  </Box>
                </Paper>
              ))}
            </>
          ) : visibleConversations.length === 0 ? (
            <Paper sx={conversationSidebarStyles.emptyPaper}>
              <Typography variant="body2" sx={conversationSidebarStyles.emptyText}>
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
                  sx={getConversationItemPaperSx(isActive)}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={conversationSidebarStyles.contentGrow}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box sx={conversationSidebarStyles.contentGrow}>
                          {editingId === conversationKey ? (
                            <Stack spacing={0.75} sx={conversationSidebarStyles.editStack}>
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
                                  sx={conversationSidebarStyles.saveButton}
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
                                  sx={conversationSidebarStyles.cancelButton}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </Stack>
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={conversationSidebarStyles.conversationTitle}
                              noWrap
                            >
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
                                sx={conversationSidebarStyles.optionsButton}
                              >
                                <MoreVertRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Menu
                              anchorEl={menuAnchorEl}
                              open={menuConversationId === conversationKey && !!menuAnchorEl}
                              onClose={onMenuClose}
                              slotProps={{
                                paper: { sx: conversationSidebarStyles.menuPaper },
                              }}
                            >
                              <MenuItem
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onMenuEdit(event, conversation);
                                }}
                                sx={conversationSidebarStyles.menuItem}
                              >
                                Edit
                              </MenuItem>
                              <Divider sx={{ my: 0.25 }} />
                              <MenuItem
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRequestDelete(event, conversation);
                                }}
                                sx={conversationSidebarStyles.deleteMenuItem}
                              >
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
