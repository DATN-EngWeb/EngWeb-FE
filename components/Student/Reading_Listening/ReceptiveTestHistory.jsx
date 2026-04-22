/* global sessionStorage, setInterval, clearInterval */
'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Edit from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import * as styles from '@/styles/Student/HistoryTestStyles';
import HistoryItem from './HistoryItem';
import HistoryTable from '../HistoryTable';
import { levelTheme } from '../../TestCard';
import ProgressTrackingCard from '../../Writing-Speaking/ProgressTrackingCard';
import { getReceptiveTestHistoryByTestId, getReceptiveTestDetails } from '@/api/test';
import {
  Box,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Typography,
  Stack,
  Paper,
} from '@mui/material';

export default function ReceptiveTestHistory({ onPracticeNow }) {
  const params = useParams();
  const test_id = params?.test_id;
  const router = useRouter();
  const [testData, setTestData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchData = async () => {
      try {
        setLoading(true);
        //sessionStorage.removeItem('current_writing_attempt');
        const [listAttempt, details] = await Promise.all([
          getReceptiveTestHistoryByTestId(test_id),
          getReceptiveTestDetails(test_id),
        ]);
        setTestData(details);
        setHistoryData(listAttempt?.results || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (test_id) fetchData();
  }, [test_id]);
  const draft = historyData?.find((h) => h.type === 'D');
  const submissions = historyData?.filter((h) => h.type === 'S') || [];

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  const handleContinue = () => {
    if (!draft) {
      // eslint-disable-next-line no-console
      console.error('Biến draft đang bị null hoặc undefined!');
      return;
    }

    const dataToSave = {
      answer_histories: draft.answer_histories || [],
      attempt: draft.attempt || 1,
      isReadOnly: draft.type === 'S',
      startTime: draft.start_time,
      totalTime: draft.total_time,
    };

    if (typeof window !== 'undefined') {
      try {
        const stringifiedData = JSON.stringify(dataToSave);
        window.sessionStorage.setItem('current_receptive_attempt', stringifiedData);

        // console.log('Đã lưu vào SS:', window.sessionStorage.getItem('current_receptive_attempt'));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Lỗi khi lưu vào sessionStorage:', e);
      }
    }

    const targetPath =
      testData?.skill === 'L'
        ? `/student/listening/${test_id}/${draft.id}`
        : `/student/reading/${test_id}/${draft.id}`;

    router.push(targetPath);
  };
  const handleViewDetail = (item) => {
    const dataToSave = {
      history_id: item.id,
      answer_histories: item.answer_histories,
      isReadOnly: item.type === 'S',
      startTime: item.start_time,
      totalTime: item.total_time,
      bonus_point: item.bonus_point,
      earned_bonus_point: item.earned_bonus_point,
      total_score: item.total_score,
      feedback_message: item.feedback_message,
    };
    sessionStorage.setItem('current_receptive_attempt', JSON.stringify(dataToSave));
    if (item.skill === 'L') {
      router.push(`/student/listening/${item.receptive_test}/${item.attempt}`);
    } else {
      router.push(`/student/reading/${item.receptive_test}/${item.attempt}`);
    }
  };

  const handlePracticeNow = () => {
    if (testData.skill === 'R') {
      onPracticeNow();
    } else {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          const skillPath = testData.skill === 'L' ? 'listening' : 'reading';
          const currentUrl = `/student/${skillPath}/${test_id}`;
          router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
          return;
        }
      }

      window.sessionStorage.removeItem('current_receptive_attempt');
      testData.skill === 'L'
        ? router.push(`/student/listening/${test_id}/${submissions.length + 1}`)
        : router.push(`/student/reading/${test_id}/${submissions.length + 1}`);
    }
  };

  return (
    <Box sx={styles.mainWrapper}>
      <Grid container spacing={4}>
        {/* column left */}
        <Grid item sx={{ width: '65%' }}>
          <Paper sx={styles.paperCard}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" fontWeight={800} color="#4e342e">
                {testData.title || 'Productive Test'}
              </Typography>
              <Box sx={styles.levelTag(levelTheme[testData.level])} mt={1} width="fit-content">
                Level {testData.level}
              </Box>
            </Stack>

            <Alert icon={<InfoIcon />} sx={styles.instructionAlert}>
              <Typography variant="subtitle2" fontWeight={700}>
                Instruction
              </Typography>
              {testData.instruction || 'Please complete the draft before final submission.'}
            </Alert>
          </Paper>

          {/* Section: Current Session */}
          {draft ? (
            <Box sx={{ mb: 4 }}>
              <SectionTitle title="Current Session" color="#ffb300" />
              <Paper sx={styles.draftPaper}>
                <DraftActive
                  lastSaved={
                    draft
                      ? new Date(draft.end_time).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour12: false,
                        })
                      : ''
                  }
                  onContinue={() => handleContinue()}
                />
              </Paper>
            </Box>
          ) : (
            <Box sx={{ mb: 4, textAlign: 'center', justifyContent: 'center' }}>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'warning.main',
                  color: 'primary.main',
                }}
                onClick={() => handlePracticeNow()}
              >
                <>
                  <Edit sx={{ mr: 1 }} /> Practice Now
                </>
              </Button>
            </Box>
          )}

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

          <Box>
            <HistoryTable
              data={submissions.map((sub) => ({ ...sub, skill: testData.skill }))}
              skill={testData.skill}
              onViewDetail={handleViewDetail}
            />
          </Box>
        </Grid>

        {/* column right (Sidebar) */}

        <Grid item sx={{ width: '30%' }}>
          <Stack spacing={3}>
            <ProgressTrackingCard historyData={historyData} type={testData.type} />
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

const DraftActive = ({ lastSaved, onContinue }) => (
  <>
    <Box
      sx={{
        bgcolor: '#fff3e0',
        width: 50,
        height: 50,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 2,
      }}
    >
      <EditNoteIcon sx={{ color: '#ffb300' }} />
    </Box>
    <Typography variant="h6" fontWeight={800}>
      Draft in Progress
    </Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>
      Last saved: {lastSaved}
    </Typography>
    <Button
      variant="contained"
      startIcon={<OpenInNewIcon />}
      onClick={onContinue}
      sx={{
        bgcolor: '#ffb300',
        color: '#4e342e',
        borderRadius: '12px',
        fontWeight: 800,
        '&:hover': { bgcolor: '#ffa000' },
      }}
    >
      Continue Drafting
    </Button>
  </>
);
