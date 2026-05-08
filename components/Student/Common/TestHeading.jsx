'use client';

import { Box, Button, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import { listeningtestStyles } from '@/styles/Student/Listening/listeningTestStyles';

export default function TestHeading({
  testName = '',
  partLabel,
  timerNode,
  onSubmit = () => {},
  isTeacher = false,
  onAIReview,
  onSaveDraft,
}) {
  return (
    <>
      <Box sx={{ ...listeningtestStyles.mainContainer, position: 'relative' }}>
        <Box
          maxWidth="lg"
          sx={{
            ...listeningtestStyles.testHeadingContainer,
            mx: 'auto',
          }}
        >
          {/* Left: Timer */}
          <Box sx={listeningtestStyles.timeLeft}>{timerNode}</Box>
          {/* Center: test name + part label */}
          <Box sx={listeningtestStyles.nameTestAndFormatPart}>
            <Typography sx={listeningtestStyles.nameTest}>{testName}</Typography>
            {partLabel && <Typography sx={listeningtestStyles.formatName}>{partLabel}</Typography>}
          </Box>
          {/* Right: Submit Test and/or AI Review */}
          <Box
            sx={{
              width: { xs: 'auto', md: '320px' },
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1.5,
              order: { xs: 3, md: 3 },
            }}
          >
            {onAIReview && (
              <Button
                sx={{
                  ...listeningtestStyles.submitButton,
                  backgroundColor: 'info.pastel',
                  color: 'info.main',
                  py: 1,
                  fontSize: '0.8125rem',
                  minWidth: 'auto',
                  px: 2,
                  '&:hover': { bgcolor: '#e3f2fd' },
                }}
                onClick={onAIReview}
              >
                AI Feedback
              </Button>
            )}
            {onSaveDraft && (
              <Button
                startIcon={<SaveOutlinedIcon />}
                sx={listeningtestStyles.draftButton}
                onClick={onSaveDraft}
              >
                Save Draft
              </Button>
            )}
            {onSubmit && (
              <Button
                startIcon={<SendIcon />}
                sx={listeningtestStyles.submitButton}
                onClick={onSubmit}
              >
                Submit Test
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
