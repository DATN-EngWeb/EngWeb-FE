'use client';

import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SendRounded from '@mui/icons-material/SendRounded';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

const STATUS_LABELS = {
  D: 'Draft',
  I: 'In Review',
  P: 'Published',
};

export default function ViewTestHeader({
  title,
  subtitle,
  skillLabel,
  status,
  showEdit,
  onEdit,
  showViewFeedback,
  onViewFeedback,
  showDelete,
  onDelete,
  deleting,
  onInReview,
  onPublished,
  updatingStatus,
}) {
  const statusLabel = STATUS_LABELS[status] || status || 'Unknown';

  const whiteButtonSx = {
    textTransform: 'none',
    fontWeight: 700,
    borderRadius: 2,
    backgroundColor: '#fff',
    border: '1px solid',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#fafafa',
      boxShadow: 'none',
    },
  };

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

        <Stack direction="row" spacing={1}>
          {status === 'D' && onInReview && (
            <Button
              variant="outlined"
              startIcon={<SendRounded sx={{ fontSize: 20 }} />}
              onClick={onInReview}
              disabled={updatingStatus}
              sx={{
                ...whiteButtonSx,
                borderColor: 'primary.main',
                color: 'primary.main',
              }}
            >
              In Review
            </Button>
          )}

          {(status === 'D' || status === 'I') && onPublished && (
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon sx={{ fontSize: 20 }} />}
              onClick={onPublished}
              disabled={updatingStatus}
              sx={{
                ...whiteButtonSx,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: '#fafafa',
                },
              }}
            >
              Public
            </Button>
          )}

          {showViewFeedback && (
            <Button
              variant="outlined"
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
              onClick={onViewFeedback}
              sx={{
                ...whiteButtonSx,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: '#fafafa',
                },
              }}
            >
              View Feedback
            </Button>
          )}

          {showEdit && (
            <Button
              variant="outlined"
              startIcon={<DescriptionOutlined sx={{ fontSize: 20 }} />}
              onClick={onEdit}
              sx={{
                ...whiteButtonSx,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: '#fafafa',
                },
              }}
            >
              Edit Test
            </Button>
          )}

          {showDelete && (
            <Button
              variant="outlined"
              startIcon={<DeleteRoundedIcon sx={{ fontSize: 20 }} />}
              onClick={onDelete}
              disabled={deleting}
              sx={{
                ...whiteButtonSx,
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: '#fafafa',
                },
              }}
            >
              {deleting ? 'Deleting...' : 'Delete Test'}
            </Button>
          )}
        </Stack>
      </Stack>

      <Typography sx={{ mt: 4, color: 'darkGrey.main' }}>{subtitle}</Typography>
    </Box>
  );
}
