'use client';

import { Button, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import CancelIcon from '@mui/icons-material/Cancel';

export default function TestEditorActions({
  onPreview,
  isPreviewActive,
  onFeedback,
  isFeedbackActive,
  onSendReview,
  onSaveDraft,
  onPublish,
  onCancelClick,
  isLoading = false,
  readingStyle = false,
  sticky = false,
  sx,
}) {
  const wrapperSx = readingStyle
    ? {
        display: 'grid',
        gap: { xs: 1, md: 2 },
        mb: 2,
        py: 1,
        alignItems: 'center',
        gridTemplateAreas: {
          xs: `
          "item1 item4"
          "item2 item3"
        `,
          sm: `
          "item1 item2 item3 item4"
        `,
        },
        gridTemplateColumns: {
          xs: '1fr 1fr',
          sm: '1fr auto auto auto',
        },
        ...(sticky && {
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: '#FFF4E9',
        }),
      }
    : {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        ...(sticky && {
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: '#FFF4E9',
          py: 1,
          px: 1,
          mx: -1,
          borderRadius: 1,
        }),
      };

  if (!readingStyle) {
    return (
      <Box sx={{ ...wrapperSx, ...sx }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onPreview && (
            <Button
              startIcon={isPreviewActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
              variant="outlined"
              onClick={onPreview}
              disabled={isLoading}
            >
              {isPreviewActive ? 'Hide Preview' : 'Show Preview'}
            </Button>
          )}

          {onFeedback && (
            <Button
              startIcon={isFeedbackActive ? <ChatBubbleIcon /> : <ChatBubbleOutlineIcon />}
              variant="outlined"
              onClick={onFeedback}
              disabled={isLoading}
            >
              {isFeedbackActive ? 'Hide Feedback' : 'Show Feedback'}
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {onCancelClick && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancelClick}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          {onSendReview && (
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              onClick={onSendReview}
              disabled={isLoading}
            >
              Send for Review
            </Button>
          )}
          {onSaveDraft && (
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={onSaveDraft}
              disabled={isLoading}
            >
              Save Draft
            </Button>
          )}
          {onPublish && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<PublishIcon />}
              onClick={onPublish}
              disabled={isLoading}
            >
              Public
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ...wrapperSx, ...sx }}>
      {onPreview && (
        <Button
          startIcon={isPreviewActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
          variant="text"
          sx={{
            gridArea: 'item1',
            color: 'primary.main',
            fontWeight: 500,
            fontSize: { xs: '0.7rem', md: '1rem' },
            justifySelf: { xs: 'stretch', sm: 'start' },
            px: 4,
            textTransform: 'none',
          }}
          onClick={onPreview}
          disabled={isLoading}
        >
          {isPreviewActive ? 'Hide Preview' : 'Show Preview'}
        </Button>
      )}
      {onSendReview && (
        <Button
          variant="outlined"
          startIcon={<SendIcon />}
          sx={{
            gridArea: 'item2',
            backgroundColor: 'natural.background',
            color: 'primary.main',
            fontWeight: 500,
            fontSize: { xs: '0.7rem', md: '1rem' },
            px: 2.5,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { backgroundColor: 'background.default', boxShadow: 'none' },
          }}
          onClick={onSendReview}
          disabled={isLoading}
        >
          Send for Review
        </Button>
      )}
      {onSaveDraft && (
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          sx={{
            gridArea: 'item3',
            backgroundColor: 'natural.background',
            color: 'primary.main',
            fontWeight: 500,
            fontSize: { xs: '0.7rem', md: '1rem' },
            px: 2.5,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { backgroundColor: 'background.default', boxShadow: 'none' },
          }}
          onClick={onSaveDraft}
          disabled={isLoading}
        >
          Save Draft
        </Button>
      )}
      {onPublish && (
        <Button
          variant="contained"
          color="warning"
          startIcon={<PublishIcon />}
          sx={{
            gridArea: 'item4',
            backgroundColor: 'yellow.main',
            color: 'primary.main',
            fontSize: { xs: '0.7rem', md: '1rem' },
            fontWeight: 500,
            textTransform: 'none',
            px: 2.5,
            boxShadow: 'none',
            '&:hover': { backgroundColor: 'warning.dark', boxShadow: 'none' },
          }}
          onClick={onPublish}
          disabled={isLoading}
        >
          Public
        </Button>
      )}
      {onCancelClick && (
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          sx={{ gridArea: 'item2', textTransform: 'none' }}
          onClick={onCancelClick}
          disabled={isLoading}
        >
          Cancel
        </Button>
      )}
    </Box>
  );
}
