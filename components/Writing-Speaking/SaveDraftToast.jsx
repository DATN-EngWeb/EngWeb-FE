'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  LinearProgress,
  Stack,
  Typography,
  Paper,
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { QUOTES, fadeUp, ConfettiCanvas, LoadingOrb } from './SharedDialogUtils';

// ─── Saving state ─────────────────────────────────────────────────────────────

function SavingState() {
  return (
    <Stack spacing={2.25} alignItems="center" textAlign="center" py={1}>
      <LoadingOrb icon={SaveOutlinedIcon} />

      <Box>
        <Typography variant="h6" fontWeight={700}>
          Saving draft...
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5} lineHeight={1.65}>
          System is securely storing your draft.
          <br />
          Please do not close or refresh the page.
        </Typography>
      </Box>

      <Box width="100%">
        <LinearProgress
          sx={{
            height: 4,
            borderRadius: 99,
            bgcolor: 'grey.100',
            '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: 'primary.main' },
          }}
        />
        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          textAlign="center"
          mt={0.75}
          sx={{
            animation: 'blink 1.8s ease-in-out infinite',
            '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
          }}
        >
          Processing, please wait...
        </Typography>
      </Box>
    </Stack>
  );
}

// ─── Saved state ─────────────────────────────────────────────────────────────

function SavedState({ quote, savedAt, onClose }) {
  return (
    <Stack
      spacing={3}
      alignItems="center"
      width="100%"
      sx={{
        animation: 'popIn 0.5s ease-out forwards',
        '@keyframes popIn': {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      }}
    >
      <ConfettiCanvas />

      {/* Success Hero */}
      <Box textAlign="center" zIndex={1} sx={fadeUp(200)}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'success.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.25)',
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'success.dark' }} />
        </Box>
        <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
          Draft Saved!
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={280} mx="auto">
          Your progress has been securely saved. You can return anytime to finish this test.
        </Typography>
      </Box>

      {/* Inspirational Quote */}
      <Box zIndex={1} sx={{ ...fadeUp(400, '0.5s', '12px'), width: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'background.default',
            border: '1px dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main' }}>
            <AutoAwesomeIcon fontSize="small" />
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>
              Keep it up!
            </Typography>
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              "{quote}"
            </Typography>
            {savedAt && (
              <Typography variant="caption" color="text.disabled" display="block" mt={1}>
                Last saved at: {savedAt}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={1.5} width="100%" sx={fadeUp(600)}>
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            boxShadow: 'none',
          }}
        >
          Close
        </Button>
      </Stack>
    </Stack>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ onClose, onRetry }) {
  return (
    <Stack
      spacing={3}
      alignItems="center"
      width="100%"
      sx={{ animation: 'popIn 0.5s ease-out forwards' }}
    >
      <Box textAlign="center" zIndex={1} sx={fadeUp(100)}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'error.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            boxShadow: '0 8px 24px rgba(244, 67, 54, 0.25)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 34 34" fill="none">
            <line
              x1="11"
              y1="11"
              x2="23"
              y2="23"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              color="#D32F2F"
            />
            <line
              x1="23"
              y1="11"
              x2="11"
              y2="23"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              color="#D32F2F"
            />
          </svg>
        </Box>
        <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
          Save Failed
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={280} mx="auto">
          Something went wrong while saving your draft. Please try again.
        </Typography>
      </Box>

      <Stack spacing={1.5} width="100%" sx={fadeUp(300)}>
        {onRetry && (
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={onRetry}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            Try Again
          </Button>
        )}
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export default function SaveDraftToast({ status, onClose, onRetry }) {
  const [savedAt, setSavedAt] = useState('');
  const [quote, setQuote] = useState('');

  // Randomize quote on state change
  useEffect(() => {
    if (status === 'saved') {
      setSavedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }
  }, [status]);

  const open = status !== 'idle' && status != null;

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
          backgroundImage: 'none',
          overflow: 'hidden',
          position: 'relative',
        },
      }}
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.4)' } } }}
    >
      <DialogContent sx={{ p: 4, overflow: 'hidden', position: 'relative' }}>
        {status === 'saving' && <SavingState />}
        {status === 'saved' && <SavedState quote={quote} savedAt={savedAt} onClose={onClose} />}
        {status === 'error' && <ErrorState onClose={onClose} onRetry={onRetry} />}
      </DialogContent>
    </Dialog>
  );
}
