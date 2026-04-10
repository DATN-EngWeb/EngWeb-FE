import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
} from '@mui/material';
import Edit from '@mui/icons-material/EditRounded';
import InfoIcon from '@mui/icons-material/InfoRounded';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { levelTheme } from '../TestCard';
import * as styles from '../../styles/student/HistoryTestStyles';
import ProgressTrackingCard from '../Writing-Speaking/ProgressTrackingCard';
import { SidebarForum } from '../Writing-Speaking/SidebarForum';
import { StudyTip } from '../Writing-Speaking/StudyTip';

export default function ReceptiveTestHistory({ testData, onPracticeNow }) {
  const submissions = [];
  const totalQuestions =
    testData?.parts?.reduce((sum, p) => sum + (p.rawPart?.receptive_questions?.length || 0), 0) ||
    0;

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
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: '24px',
                  border: '1px solid #f0f0f0',
                  bgcolor: 'white',
                  boxShadow: 'none',
                }}
              >
                <Table sx={{ minWidth: 650 }} aria-label="submission history table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: '#94a3b8',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#94a3b8',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#94a3b8',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Score
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#94a3b8',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        XP
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#94a3b8',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Time Spent
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: '#94a3b8',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((sub, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {sub.end_time || sub.created_at
                            ? new Date(sub.end_time || sub.created_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main">
                            {sub.type === 'S' ? 'Completed' : 'Draft'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="primary.main">
                            {sub.score || '0'}/{totalQuestions}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Box component="span" sx={{ color: 'warning.main', display: 'flex' }}>
                              <StarRoundedIcon sx={{ fontSize: '1rem' }} />
                            </Box>
                            <Typography variant="body2" color="warning.main">
                              {sub.total_score || 0} XP
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {sub.total_time
                            ? `${Math.floor(sub.total_time / 60)}:${(sub.total_time % 60).toString().padStart(2, '0')}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            endIcon={<VisibilityIcon />}
                            sx={{
                              bgcolor: '#6366f1',
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' },
                            }}
                            onClick={() => {
                              window.location.href = `/student/reading/${testData?.id}/results/${sub.id}`;
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
            <ProgressTrackingCard historyData={submissions} />
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
