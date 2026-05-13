'use client';

import { forwardRef } from 'react';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Box, Button, Paper, Snackbar, Stack, Typography, Backdrop } from '@mui/material';

const ConfirmCard = forwardRef(function ConfirmCard({ onClose, onConfirm, loading }, ref) {
  return (
    <Paper
      ref={ref}
      elevation={10}
      sx={{
        width: { xs: 'calc(100vw - 32px)', sm: 460 },
        maxWidth: '100vw',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'warning.main',
        background: 'background.paper',
        p: 2,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <WarningAmberRoundedIcon sx={{ color: 'primary.main', mt: 0.2 }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
            Confirm Delete
          </Typography>
          <Typography sx={{ mt: 0.5, color: 'secondary.main', fontSize: 14 }}>
            Delete this test? This action will mark it as removed.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={onConfirm}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
});

export default function DeleteConfirmSnackbar({
  open,
  onClose,
  onConfirm,
  loading,
  withinParent = false,
}) {
  if (withinParent) {
    if (!open) return null;

    return (
      <Box
        onClick={() => {
          if (!loading) onClose();
        }}
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.5,
          borderRadius: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.22)',
          backdropFilter: 'blur(1px)',
        }}
      >
        <ConfirmCard onClose={onClose} onConfirm={onConfirm} loading={loading} />
      </Box>
    );
  }

  return (
    <>
      <Backdrop
        open={open}
        onClick={() => {
          if (!loading) onClose();
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.snackbar - 1,
          backgroundColor: 'rgba(0, 0, 0, 0.22)',
          backdropFilter: 'blur(1px)',
        }}
      />
      <Snackbar
        open={open}
        onClose={(_, reason) => {
          if (reason === 'clickaway' || loading) return;
          onClose();
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '50% !important',
          left: '50% !important',
          right: 'auto !important',
          bottom: 'auto !important',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <ConfirmCard onClose={onClose} onConfirm={onConfirm} loading={loading} />
      </Snackbar>
    </>
  );
}
