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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function TestEditorActions({
  onPreview,
  isPreviewActive,
  onFeedback,
  isFeedbackActive,
  onSendReview,
  onSaveDraft,
  onPublish,
  onCancelClick,
  onTour,
  isLoading = false,
  readingStyle = false,
  sticky = false,
  sx,
}) {
  const wrapperSx = readingStyle
    ? {
        display: 'grid',
        gap: { xs: 0.75, sm: 1, md: 2 },
        mb: 2,
        py: 1,
        alignItems: 'center',
        // xs/sm: 2 rows — row1: left actions span full width, row2: action buttons
        // md+: single row, left actions + action buttons side-by-side
        gridTemplateAreas: {
          xs: `
            "item1 item1"
            "item2 item3"
          `,
          sm: `
            "item1 item1 item1"
            "item2 item3 item4"
          `,
          md: `
            "item1 item2 item3 item4"
          `,
        },
        gridTemplateColumns: {
          xs: '1fr 1fr',
          sm: '1fr 1fr 1fr',
          md: '1fr auto auto auto',
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
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 1.5, sm: 0 },
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
        {/* Left group: Preview / Feedback / Guide — wrap on xs so buttons don't squash */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {onPreview && (
            <Button
              startIcon={isPreviewActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
              variant="outlined"
              onClick={onPreview}
              disabled={isLoading}
              sx={{
                flex: { xs: '1 1 auto', sm: 'none' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                whiteSpace: 'nowrap',
              }}
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
              sx={{
                flex: { xs: '1 1 auto', sm: 'none' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                whiteSpace: 'nowrap',
              }}
            >
              {isFeedbackActive ? 'Hide Feedback' : 'Show Feedback'}
            </Button>
          )}

          {onTour && (
            <Button
              startIcon={<HelpOutlineIcon />}
              variant="outlined"
              onClick={onTour}
              disabled={isLoading}
              sx={{
                flex: { xs: '1 1 auto', sm: 'none' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                whiteSpace: 'nowrap',
              }}
            >
              Guide
            </Button>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-end' },
          }}
        >
          {onCancelClick && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancelClick}
              disabled={isLoading}
              sx={{
                flex: { xs: '1 1 auto', sm: 'none' },
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
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
              sx={{
                flex: { xs: '1 1 auto', sm: 'none' },
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                whiteSpace: 'nowrap',
              }}
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
              sx={{
                flex: { xs: '1 1 auto', sm: 'none' },
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                whiteSpace: 'nowrap',
              }}
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
              sx={{
                flex: { xs: '1 1 auto', sm: 'none' },
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
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
      {/* item1: Preview + Feedback + Guide — spans full width on xs/sm, left column on md+ */}
      <Box
        sx={{
          gridArea: 'item1',
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 0.5, sm: 0.75, md: 1 },
          alignItems: 'center',
          justifySelf: 'stretch',
        }}
      >
        {onPreview && (
          <Button
            startIcon={isPreviewActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
            variant="text"
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              fontSize: { xs: '0.72rem', sm: '0.8rem', md: '1rem' },
              px: { xs: 1, sm: 1.5, md: 2 },
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
            onClick={onPreview}
            disabled={isLoading}
          >
            {isPreviewActive ? 'Hide Preview' : 'Show Preview'}
          </Button>
        )}
        {onFeedback && (
          <Button
            startIcon={isFeedbackActive ? <ChatBubbleIcon /> : <ChatBubbleOutlineIcon />}
            variant="text"
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              fontSize: { xs: '0.72rem', sm: '0.8rem', md: '1rem' },
              px: { xs: 1, sm: 1.5, md: 2 },
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
            onClick={onFeedback}
            disabled={isLoading}
          >
            {isFeedbackActive ? 'Hide Feedback' : 'Show Feedback'}
          </Button>
        )}
        {onTour && (
          <Button
            startIcon={<HelpOutlineIcon />}
            variant="text"
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              fontSize: { xs: '0.72rem', sm: '0.8rem', md: '1rem' },
              px: { xs: 1, sm: 1.5, md: 2 },
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
            onClick={onTour}
            disabled={isLoading}
          >
            Guide
          </Button>
        )}
      </Box>
      {onSendReview && (
        <Button
          variant="outlined"
          startIcon={<SendIcon />}
          sx={{
            gridArea: 'item2',
            backgroundColor: 'natural.background',
            color: 'primary.main',
            fontWeight: 500,
            fontSize: { xs: '0.72rem', sm: '0.8rem', md: '1rem' },
            px: { xs: 1.5, md: 2.5 },
            textTransform: 'none',
            boxShadow: 'none',
            whiteSpace: 'nowrap',
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
            fontSize: { xs: '0.72rem', sm: '0.8rem', md: '1rem' },
            px: { xs: 1.5, md: 2.5 },
            textTransform: 'none',
            boxShadow: 'none',
            whiteSpace: 'nowrap',
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
            fontSize: { xs: '0.72rem', sm: '0.8rem', md: '1rem' },
            fontWeight: 500,
            textTransform: 'none',
            px: { xs: 1.5, md: 2.5 },
            boxShadow: 'none',
            whiteSpace: 'nowrap',
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
          sx={{
            gridArea: 'item2',
            textTransform: 'none',
            fontSize: { xs: '0.72rem', sm: '0.8rem', md: '1rem' },
            px: { xs: 1.5, md: 2.5 },
            whiteSpace: 'nowrap',
          }}
          onClick={onCancelClick}
          disabled={isLoading}
        >
          Cancel
        </Button>
      )}
    </Box>
  );
}
