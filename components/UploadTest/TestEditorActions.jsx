'use client';

import { Button, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import CancelIcon from '@mui/icons-material/Cancel';

export default function TestEditorActions({
  onPreview,
  isPreviewActive,
  onSendReview,
  onSaveDraft,
  onPublish,
  onCancelClick,
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      {onPreview && (
        <Button
          startIcon={isPreviewActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
          variant="text"
          onClick={onPreview}
        >
          {isPreviewActive ? 'Hide Preview' : 'Show Preview'}
        </Button>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        {onCancelClick && (
          <Button variant="outlined" startIcon={<CancelIcon />} onClick={onCancelClick}>
            Cancel
          </Button>
        )}
        {onSendReview && (
          <Button variant="outlined" startIcon={<SendIcon />} onClick={onSendReview}>
            Send for Review
          </Button>
        )}
        {onSaveDraft && (
          <Button variant="outlined" startIcon={<SaveIcon />} onClick={onSaveDraft}>
            Save Draft
          </Button>
        )}
        {onPublish && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<PublishIcon />}
            onClick={onPublish}
          >
            Public
          </Button>
        )}
      </Box>
    </Box>
  );
}
