'use client';

import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

import { listeningtestStyles } from '@/styles/Student/Listening/listeningTestStyles';

export default function TestHeading({
  testName = '',
  partLabel,
  timerNode,
  onSubmit = () => {},
  isTeacher = false,
  onAIReview,
  onExit,
}) {
  return (
    <>
      <Box
        sx={{
          ...listeningtestStyles.testHeadingContainer,
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Left: Timer or Back/Exit */}
        <Box
          sx={{
            width: { xs: 'auto', md: '320px' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0.5,
          }}
        >
          {onExit && (
            <Button
              onClick={onExit}
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Back
            </Button>
          )}
          {timerNode}
        </Box>

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
          {onSubmit && (
            <Button
              startIcon={<SendIcon />}
              sx={{
                ...listeningtestStyles.submitButton,
                py: 1,
                px: 2,
                fontSize: '0.8125rem',
                minWidth: 'auto',
              }}
              onClick={onSubmit}
            >
              Submit Test
            </Button>
          )}
        </Box>
      </Box>

      {/* Orange separator */}
      <Box sx={listeningtestStyles.separatorLine} />
    </>
  );
}
