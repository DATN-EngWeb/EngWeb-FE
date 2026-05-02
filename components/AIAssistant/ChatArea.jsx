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
import WavyDots from './WavyDots';
import MessageBubble from './MessageBubble';

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
}) {
  const messagesEndRef = useRef(null);
  const activeQuota =
    quota ||
    activeConversation?.quota ||
    (quotaRemaining != null ? { remaining: quotaRemaining } : null);

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          pb: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            {activeConversation?.title || 'New conversation'}
          </Typography>
          {activeQuota?.remaining != null && (
            <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
              <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Quota:
                {activeQuota.limit != null
                  ? ` ${activeQuota.remaining}/${activeQuota.limit}`
                  : ` ${activeQuota.remaining}`}
              </Box>
              {activeQuota.reset_at && (
                <Box component="span" sx={{ ml: 1 }}>
                  Resets at {formatResetAt(activeQuota.reset_at)}
                </Box>
              )}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2, pb: 1, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Stack spacing={1.75}>
          {canLoadMoreMessages && (
            <Stack direction="row" justifyContent="center" sx={{ pb: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onLoadMoreMessages}
                disabled={isLoadingMoreMessages}
                startIcon={isLoadingMoreMessages ? <WavyDots /> : null}
                sx={{
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 800,
                  px: 2,
                }}
              >
                {isLoadingMoreMessages ? 'Loading...' : 'Load more'}
              </Button>
            </Stack>
          )}

          {(!activeConversation || (activeConversation.messages || []).length === 0) &&
            !isThinking && (
              <Paper
                sx={{
                  p: 2.25,
                  borderRadius: 4,
                  border: '1px solid rgba(25, 118, 210, 0.14)',
                  bgcolor: 'rgba(25, 118, 210, 0.04)',
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                      <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                        {activeConversation ? 'Conversation ready' : 'AI Assistant ready'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                        {activeConversation
                          ? 'Send your first message to start this conversation.'
                          : 'Choose a mode and send a message to begin.'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={0.75}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Try one of these:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      • Ask for a translation with natural tone.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      • Request grammar correction with explanation.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Paper
                sx={{
                  px: 2,
                  py: 1.25,
                  borderRadius: 4,
                  border: '1px solid rgba(83, 40, 34, 0.10)',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <WavyDots />
                </Stack>
              </Paper>
            </Stack>
          )}
          <Box ref={messagesEndRef} />
        </Stack>
      </Box>

      <Box
        sx={{
          p: { xs: 2, md: 3 },
          pt: 0,
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid rgba(0, 0, 0, 0.10)',
          }}
        >
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
                    <InputAdornment position="end" sx={{ mr: 0.5 }}>
                      <IconButton
                        onClick={onSend}
                        disabled={!draft.trim() || (quotaRemaining != null && quotaRemaining <= 0)}
                        edge="end"
                        sx={{
                          color: 'primary.main',
                        }}
                      >
                        <SendRoundedIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.92)',
                  py: 1,
                },
              }}
            />

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
                MenuProps={{
                  PaperProps: {
                    sx: {
                      mt: 1,
                      borderRadius: 3,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 18px 48px rgba(15, 23, 42, 0.12)',
                    },
                  },
                }}
                sx={{
                  minWidth: 118,
                  height: 30,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.96)',
                  color: 'primary.main',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(25, 118, 210, 0.35)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: '1px',
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 0.75,
                    pr: 3,
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'primary.main',
                  },
                }}
              >
                {MODE_CONFIGS.map((mode) => (
                  <MenuItem key={mode.id} value={mode.id}>
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
                MenuProps={{
                  PaperProps: {
                    sx: {
                      mt: 1,
                      borderRadius: 3,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 18px 48px rgba(15, 23, 42, 0.12)',
                    },
                  },
                }}
                sx={{
                  minWidth: 92,
                  height: 30,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.96)',
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(25, 118, 210, 0.35)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: '1px',
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 0.75,
                    pr: 3,
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'primary.main',
                  },
                }}
              >
                {LEVEL_CONFIGS.map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', lineHeight: 1.5, ml: 'auto' }}
              >
                Tip: choose General when you are not sure which mode fits best.
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
