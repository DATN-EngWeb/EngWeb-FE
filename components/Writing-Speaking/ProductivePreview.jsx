import { Box, Paper, Typography, Divider, Button, Collapse } from '@mui/material';
import SignpostIcon from '@mui/icons-material/Signpost';
import { useState } from 'react';
import CustomAudioPlayer from '../Test/customAudioPlayer';
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
      <Paper sx={{ ...styles.PREVIEW_PAPER_STYLE, border: '1px solid', borderColor: 'dark.main' }}>
        <Typography
          variant="h5"
          align="center"
          fontWeight={700}
          sx={{ mb: 2, color: 'primary.main' }}
        >
          {title || 'Test Title'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {audio && (
          <Box sx={{ mb: 4 }}>
            <CustomAudioPlayer src={audio} />
          </Box>
        )}

        <Box
          className="ck-content"
          dangerouslySetInnerHTML={{
            __html:
              description && description !== '<p></p>'
                ? description
                : `<p style="color: #a0a0a0; font-style: italic;">Typing your test...</p>`,
          }}
          sx={{ minHeight: '100px', '& p': { margin: 0 }, fontFamily: 'Arial !important' }}
        />

        {suggestion && (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SignpostIcon />}
                onClick={() => setShowSuggestion(!showSuggestion)}
                sx={{
                  ml: 'auto',
                  px: 2,
                  py: 0.5,
                  borderRadius: '1rem',
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
                  sx={{
                    ...styles.suggestionContent,
                    '&, & *': { fontFamily: 'Arial !important' },
                  }}
                  dangerouslySetInnerHTML={{ __html: suggestion }}
                />
              </Box>
            </Collapse>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
