'use client';

import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { listeningtestStyles } from '../../../styles/student/Listening/ListeningTestStyles.js';

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
      <Box sx={{ ...listeningtestStyles.testHeadingContainer, py: { xs: 0.5, md: 1 } }}>
        {/* Left: Timer or Back/Exit */}
        <Box
          sx={{ width: { xs: 'auto', md: '200px' }, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          {isTeacher && onExit && (
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

        {/* Right: Submit Test or AI Review */}
        <Box sx={listeningtestStyles.summitButtonWrapper}>
          {!isTeacher ? (
            <Button sx={listeningtestStyles.submitButton} onClick={onSubmit}>
              Submit Test
            </Button>
          ) : (
            onAIReview && (
              <Button sx={listeningtestStyles.submitButton} onClick={onAIReview}>
                AI Review
              </Button>
            )
          )}
        </Box>
      </Box>

      {/* Orange separator */}
      <Box sx={listeningtestStyles.separatorLine} />
    </>
  );
}
