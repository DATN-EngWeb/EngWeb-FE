'use client';

import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const STATUS_LABELS = {
  D: 'Draft',
  I: 'In Review',
  P: 'Published',
};

export default function ViewTestHeader({ title, subtitle, skillLabel, status, showEdit, onEdit }) {
  const statusLabel = STATUS_LABELS[status] || status || 'Unknown';

  return (
    <Box
      sx={{
        mb: 3,
        borderRadius: 4,
        p: { xs: 2, md: 3 },
        color: 'primary.main',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'dark.main',
        boxShadow: '0 6px 16px rgba(61, 30, 25, 0.06)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
          <Chip
            label={skillLabel}
            sx={{
              color: 'primary.dark',
              fontWeight: 700,
              bgcolor: 'warning.main',
            }}
          />
          <Chip
            label={statusLabel}
            sx={{
              fontWeight: 700,
              bgcolor:
                status === 'P'
                  ? 'success.pastel'
                  : status === 'I'
                    ? 'info.pastel'
                    : 'warning.pastel',
              color:
                status === 'P' ? 'success.dark' : status === 'I' ? 'info.dark' : 'warning.dark',
            }}
          />
        </Stack>

        {showEdit && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Edit Test
          </Button>
        )}
      </Stack>

      <Typography sx={{ mt: 4, color: 'darkGrey.main' }}>{subtitle}</Typography>
    </Box>
  );
}
