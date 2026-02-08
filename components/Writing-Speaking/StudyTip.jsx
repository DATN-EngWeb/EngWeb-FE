import LightbulbIcon from '@mui/icons-material/Lightbulb';
import * as styles from './../../styles/student/HistoryTestStyles';
import { Box, Typography, Stack } from '@mui/material';
export const StudyTip = ({ level = 'A1' }) => (
  <Box sx={styles.studyTipBox}>
    <Stack direction="row" spacing={1} alignItems="center">
      <LightbulbIcon sx={{ color: '#ffb300' }} />
      <Typography variant="subtitle2" fontWeight={800} color="#4e342e">
        Study Tip
      </Typography>
    </Stack>
    <Typography variant="caption" color="#5d4037" sx={{ lineHeight: 1.6 }}>
      Assignments at level {level} should focus on correct sentence structure and basic connectors
      like 'and', 'but', and 'because' to score higher.
    </Typography>
  </Box>
);
