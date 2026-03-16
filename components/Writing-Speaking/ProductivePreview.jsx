import { Box, Paper, Typography, Divider, Button, Collapse } from '@mui/material';
import SignpostIcon from '@mui/icons-material/Signpost';
import { useState } from 'react';
import DisplayAudio from '../Upload/DisplayAudio';
import * as styles from '../../styles/Teacher/productive/ProductiveStyles';

export default function ProductivePreview({
  title,
  description,
  suggestion,
  audio,
  preview = true,
}) {
  const [showSuggestion, setShowSuggestion] = useState(false);

  return (
    <Box sx={styles.STICKY_PREVIEW_WRAPPER}>
      {preview && (
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 700 }}>
          Preview
        </Typography>
      )}
      <Paper sx={styles.PREVIEW_PAPER_STYLE}>
        <Typography
          variant="h5"
          align="center"
          fontWeight={700}
          sx={{ mb: 2, color: 'primary.main' }}
        >
          {title || 'Test Title'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box
          className="ck-content"
          dangerouslySetInnerHTML={{
            __html:
              description && description !== '<p></p>'
                ? description
                : `<p style="color: #a0a0a0; font-style: italic;">Typing your test...</p>`,
          }}
          sx={{ minHeight: '100px', '& p': { margin: 0 } }}
        />

        {audio && (
          <Box sx={{ mt: 4 }}>
            <DisplayAudio src={audio} />
          </Box>
        )}

        {suggestion && (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SignpostIcon />}
                onClick={() => setShowSuggestion(!showSuggestion)}
                sx={{
                  mb: 1,
                  ml: 'auto',
                  borderRadius: '20px',
                  textTransform: 'none',

                  ...(showSuggestion && {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }),
                }}
              >
                {showSuggestion ? 'Hide Suggestion' : 'View Suggestion'}
              </Button>
            </Box>
            <Collapse in={showSuggestion}>
              <Box sx={{ p: 2, bgcolor: 'warning.pastel', borderRadius: '8px', mt: 1 }}>
                <Box variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main' }}>
                  💡 Suggestion
                </Box>
                <Box
                  className="ck-content"
                  dangerouslySetInnerHTML={{ __html: suggestion }}
                  sx={{ fontSize: '0.9rem', ml: 3 }}
                />
              </Box>
            </Collapse>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
