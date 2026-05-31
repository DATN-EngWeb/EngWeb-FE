'use client';

import { useEffect, useRef } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import WavyDots from './WavyDots';
import MessageBubble from './MessageBubble';
import { chatAreaStyles, selectMenuProps } from '../../styles/AIAssistant/ChatAreaStyles';

const MODE_CONFIGS = [
  {
    id: 'translate',
    label: 'Translate',
    chipColor: 'success',
    title: 'Translate with tone control',
  },
  {
    id: 'grammar',
    label: 'Grammar',
    chipColor: 'warning',
    title: 'Grammar correction spotlight',
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    chipColor: 'info',
    title: 'Vocabulary cards and examples',
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm',
    chipColor: 'secondary',
    title: 'Idea canvas for writing and speaking',
  },
  {
    id: 'general',
    label: 'General',
    chipColor: 'primary',
    title: 'General mode that adapts',
  },
];

const LEVEL_CONFIGS = [
  { id: 'all', label: 'All level' },
  { id: 'a1', label: 'A1' },
  { id: 'a2', label: 'A2' },
  { id: 'b1', label: 'B1' },
  { id: 'b2', label: 'B2' },
  { id: 'c1', label: 'C1' },
  { id: 'c2', label: 'C2' },
];

export default function ChatArea({
  activeConversation,
  activeMode,
  activeModeConfig,
  selectedLevel,
  draft,
  isThinking,
  quota,
  quotaRemaining,
  composerError,
  inputRef,
  onDraftChange,
  onKeyDown,
  onSend,
  onModeChange,
  onLevelChange,
  onCreateConversation,
  canLoadMoreMessages,
  isLoadingMoreMessages,
  onLoadMoreMessages,
  onClearError,
}) {
  const messagesEndRef = useRef(null);
  const activeQuota =
    quota ||
    activeConversation?.quota ||
    (quotaRemaining != null ? { remaining: quotaRemaining } : null);
  const isBlockedByQuota = activeQuota?.remaining != null && activeQuota.remaining <= 0;
  const isQuotaError = composerError?.type === 'quota' || (isBlockedByQuota && !composerError);
  const isSendError = composerError?.type === 'send';

  const formatResetAt = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [
    activeConversation?.id,
    activeConversation?.localId,
    activeConversation?.messages?.[activeConversation?.messages?.length - 1]?.id,
    isThinking,
  ]);

  return (
    <Box sx={chatAreaStyles.root}>
      <Box sx={chatAreaStyles.header}>
        <Box>
          <Typography variant="h5" sx={chatAreaStyles.title}>
            {activeConversation?.title || 'New conversation'}
          </Typography>
          {activeQuota?.remaining != null && (
            <Typography variant="caption" sx={chatAreaStyles.quotaCaption}>
              <Box component="span" sx={chatAreaStyles.quotaValue}>
                Quota:
                {activeQuota.limit != null
                  ? ` ${activeQuota.remaining}/${activeQuota.limit}`
                  : ` ${activeQuota.remaining}`}
              </Box>
              {activeQuota.reset_at && (
                <Box component="span" sx={chatAreaStyles.quotaReset}>
                  Resets at {formatResetAt(activeQuota.reset_at)}
                </Box>
              )}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={chatAreaStyles.messagesContainer}>
        <Stack spacing={1.75}>
          {canLoadMoreMessages && (
            <Stack direction="row" justifyContent="center" sx={chatAreaStyles.loadMoreRow}>
              <Button
                variant="outlined"
                size="small"
                onClick={onLoadMoreMessages}
                disabled={isLoadingMoreMessages}
                startIcon={isLoadingMoreMessages ? <WavyDots /> : null}
                sx={chatAreaStyles.loadMoreButton}
              >
                {isLoadingMoreMessages ? 'Loading...' : 'Load more'}
              </Button>
            </Stack>
          )}

          {(!activeConversation || (activeConversation.messages || []).length === 0) &&
            !isThinking && (
              <Paper sx={chatAreaStyles.emptyStatePaper}>
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={chatAreaStyles.emptyStateAvatar}>
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={chatAreaStyles.emptyStateTitle}>
                        {activeConversation ? 'Conversation ready' : 'AI Assistant ready'}
                      </Typography>
                      <Typography variant="body2" sx={chatAreaStyles.emptyStateSubtitle}>
                        {activeConversation
                          ? 'Send your first message to start this conversation.'
                          : 'Choose a mode and send a message to begin.'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={0.75}>
                    <Typography variant="caption" sx={chatAreaStyles.emptyStateHintTitle}>
                      Try one of these:
                    </Typography>
                    <Typography variant="body2" sx={chatAreaStyles.emptyStateHintText}>
                      • Ask for a translation with natural tone.
                    </Typography>
                    <Typography variant="body2" sx={chatAreaStyles.emptyStateHintText}>
                      • Request grammar correction with explanation.
                    </Typography>
                    <Typography variant="body2" sx={chatAreaStyles.emptyStateHintText}>
                      • Brainstorm ideas for speaking or writing.
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            )}

          {(activeConversation?.messages || []).map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isThinking && (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar sx={chatAreaStyles.thinkingAvatar}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Paper sx={chatAreaStyles.thinkingPaper}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WavyDots />
                </Stack>
              </Paper>
            </Stack>
          )}
          <Box ref={messagesEndRef} />
        </Stack>
      </Box>

      <Box sx={chatAreaStyles.composerWrap}>
        <Paper sx={chatAreaStyles.composerPaper}>
          <Stack spacing={1.5}>
            <TextField
              inputRef={inputRef}
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask anything..."
              multiline
              minRows={2}
              maxRows={4}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end" sx={chatAreaStyles.inputAdornment}>
                      <IconButton
                        onClick={onSend}
                        disabled={!draft.trim() || isBlockedByQuota}
                        edge="end"
                        sx={chatAreaStyles.sendButton}
                      >
                        <SendRoundedIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={chatAreaStyles.textField}
            />

            {isQuotaError && (
              <Paper elevation={0} sx={chatAreaStyles.quotaErrorPaper}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={chatAreaStyles.minWidthRow}
                >
                  <AccessTimeRoundedIcon sx={{ fontSize: 18, color: 'warning.dark' }} />
                  <Typography variant="caption" sx={chatAreaStyles.quotaTitle}>
                    Quota reached
                  </Typography>
                </Stack>
                <Box sx={chatAreaStyles.minWidthRow}>
                  <Typography variant="body2" sx={chatAreaStyles.quotaBody}>
                    {composerError?.message || 'Your AI quota has been used up for now.'}
                  </Typography>
                  {activeQuota?.reset_at && (
                    <Typography variant="caption" sx={chatAreaStyles.mutedCaption}>
                      You can continue after {formatResetAt(activeQuota.reset_at)}.
                    </Typography>
                  )}
                </Box>
                <IconButton
                  onClick={onClearError}
                  size="small"
                  sx={chatAreaStyles.closeErrorButton}
                  aria-label="Close error"
                >
                  <CloseRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Paper>
            )}

            {isSendError && (
              <Paper elevation={0} sx={chatAreaStyles.sendErrorPaper}>
                <Stack spacing={0.25} sx={chatAreaStyles.sendErrorStack}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={chatAreaStyles.minWidthRow}
                  >
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 18, color: 'error.main' }} />
                    <Typography variant="caption" sx={chatAreaStyles.sendErrorTitle}>
                      Message not sent
                    </Typography>
                  </Stack>
                  <Box sx={chatAreaStyles.minWidthRow}>
                    <Typography variant="body2" sx={chatAreaStyles.textPrimary}>
                      {composerError?.message}
                    </Typography>
                    <Typography variant="caption" sx={chatAreaStyles.mutedCaption}>
                      Your draft is still in the input box. Edit and send again when ready.
                    </Typography>
                  </Box>
                </Stack>
                <IconButton
                  onClick={onClearError}
                  size="small"
                  sx={chatAreaStyles.closeErrorButton}
                  aria-label="Close error"
                >
                  <CloseRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Paper>
            )}

            <Stack
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing={1}
              flexWrap="wrap"
            >
              <Select
                value={activeMode}
                onChange={(e) => onModeChange(e.target.value)}
                size="small"
                displayEmpty
                renderValue={(value) =>
                  MODE_CONFIGS.find((mode) => mode.id === value)?.label || 'General'
                }
                MenuProps={selectMenuProps}
                sx={chatAreaStyles.modeSelect}
              >
                {MODE_CONFIGS.map((mode) => (
                  <MenuItem key={mode.id} value={mode.id} sx={chatAreaStyles.menuItem}>
                    {mode.label}
                  </MenuItem>
                ))}
              </Select>
              <Select
                value={selectedLevel}
                onChange={(e) => onLevelChange(e.target.value)}
                size="small"
                displayEmpty
                renderValue={(value) =>
                  LEVEL_CONFIGS.find((level) => level.id === value)?.label || 'All'
                }
                MenuProps={selectMenuProps}
                sx={chatAreaStyles.levelSelect}
              >
                {LEVEL_CONFIGS.map((level) => (
                  <MenuItem key={level.id} value={level.id} sx={chatAreaStyles.menuItem}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" sx={chatAreaStyles.filtersRow}>
                Tip: choose General when you are not sure which mode fits best.
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
