import React from 'react';
import { Box, Paper, Typography, Stack, Grid, Button, Alert } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { levelTheme } from '../TestCard';
import * as styles from '../../styles/student/HistoryTestStyles';
import ProgressTrackingCard from '../Writing-Speaking/ProgressTrackingCard';
import { SidebarForum } from '../Writing-Speaking/SidebarForum';
import { StudyTip } from '../Writing-Speaking/StudyTip';

export default function ReceptiveTestHistory({ testData, onPracticeNow }) {
  const submissions = [];

  return (
    <Box sx={styles.mainWrapper}>
      <Grid container spacing={4}>
        {/* column left */}
        <Grid item sx={{ width: '65%' }}>
          <Paper elevation={0} sx={styles.paperCard}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" fontWeight={800} color="#4e342e">
                {testData?.title || 'Receptive Test'}
              </Typography>
              <Box sx={styles.levelTag(levelTheme[testData?.level])} mt={1} width="fit-content">
                Level {testData?.level || 'A1'}
              </Box>
            </Stack>

            <Alert icon={<InfoIcon />} sx={styles.instructionAlert}>
              <Typography variant="subtitle2" fontWeight={700}>
                Instruction
              </Typography>
              {testData?.description ||
                'Please complete the test within the time limit. You will not be able to pause once started.'}
            </Alert>
          </Paper>

          <Box sx={{ mb: 4, textAlign: 'center', justifyContent: 'center' }}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                borderRadius: '12px',
                backgroundColor: 'warning.main',
                color: 'primary.main',
                boxShadow: 'none',
                py: 1.5,
                '&:hover': {
                  boxShadow: 'none',
                  backgroundColor: 'warning.dark',
                },
              }}
              onClick={onPracticeNow}
            >
              <>
                <Edit sx={{ mr: 1 }} /> Practice Now
              </>
            </Button>
          </Box>

          {/* Section: History */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            color="primary.main"
          >
            <SectionTitle title="Submission History" color="#cfd8dc" />
            <Typography variant="caption" fontWeight={700}>
              {submissions.length} attempts
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {submissions.length > 0 ? (
              <></>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  color: 'primary.main',
                  p: 6,
                  textAlign: 'center',
                  borderRadius: '24px',
                  border: '1px solid #f0f0f0',
                  bgcolor: 'white',
                  boxShadow: 'none',
                }}
              >
                <Box sx={{ mb: 2, opacity: 0.3 }}>
                  <HistoryEduIcon sx={{ fontSize: 64 }} />
                </Box>
                <Typography variant="body1" fontWeight={700}>
                  You haven't submitted any responses yet.
                </Typography>
                <Typography variant="body2">
                  Start your first attempt to track your performance!
                </Typography>
              </Paper>
            )}
          </Stack>
        </Grid>

        {/* column right (Sidebar) */}
        <Grid item sx={{ width: '30%' }}>
          <Stack spacing={3}>
            <ProgressTrackingCard historyData={[]} />
            <SidebarForum count={128} />
            <StudyTip level={testData?.level} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

const SectionTitle = ({ title, color }) => (
  <Typography
    variant="h6"
    fontWeight={800}
    sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
  >
    <Box sx={{ width: 4, height: 24, bgcolor: color, borderRadius: 2 }} />
    {title}
  </Typography>
);
