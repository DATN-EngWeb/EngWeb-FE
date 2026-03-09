'use client';

import { Box, Button, Typography } from '@mui/material';
import { listeningtestStyles } from '../../../styles/Student/Listening/listeningTestStyles';

/**
 * Row 1 of the test header — reused by Listening and Reading test components.
 *
 * Props:
 *  testName   : string    — test title
 *  partLabel  : ReactNode — content inside the sub-label Typography (can be 2 separate text nodes)
 *                           e.g. <>{`Part 1: `}{formatLabel}</>
 *  timerNode  : ReactNode — content rendered on the left (e.g. <AccessTimeIcon /> + countdown)
 *  onSubmit   : () => void
 *  isTeacher  : boolean   — hides Submit button when true
 */
export default function TestHeading({
  testName = '',
  partLabel,
  timerNode,
  onSubmit = () => {},
  isTeacher = false,
}) {
  return (
    <>
      <Box sx={{ ...listeningtestStyles.testHeadingContainer, py: { xs: 0.5, md: 1 } }}>
        {/* Left: Timer */}
        <Box sx={{ width: { xs: 'auto', md: '200px' }, display: 'flex', alignItems: 'center' }}>
          {timerNode}
        </Box>

        {/* Center: test name + part label */}
        <Box sx={listeningtestStyles.nameTestAndFormatPart}>
          <Typography sx={listeningtestStyles.nameTest}>{testName}</Typography>
          {partLabel && <Typography sx={listeningtestStyles.formatName}>{partLabel}</Typography>}
        </Box>

        {/* Right: Submit Test */}
        {!isTeacher && (
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            <Button sx={listeningtestStyles.submitButton} onClick={onSubmit}>
              Submit Test
            </Button>
          </Box>
        )}
      </Box>

      {/* Orange separator */}
      <Box sx={listeningtestStyles.separatorLine} />
    </>
  );
}
