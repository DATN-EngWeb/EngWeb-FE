/* global sessionStorage, setInterval, clearInterval */
'use client';
import React, { use } from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import * as styles from '../../styles/student/HistoryTestStyles';
import HistoryTable from '../Student/HistoryTable';
import HistoryAIFeedbackModal from '../WritingTest/HistoryAIFeedbackModal';
import { levelTheme } from '../TestCard';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProductiveTest, getProductiveTestDetails } from '../../api/test';
import { SidebarForum } from './SidebarForum';
import Edit from '@mui/icons-material/Edit';
import {
  Box,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Typography,
  Stack,
  Paper,
  Pagination,
} from '@mui/material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';

const PAGE_SIZE = 10;

export default function ProductiveTestHistory() {
  const params = useParams();
  const test_id = params?.test_id;
  const router = useRouter();
  const [testData, setTestData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openAIModal, setOpenAIModal] = useState(false);
  const [selectedAIFeedback, setSelectedAIFeedback] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchData = async () => {
      try {
        setLoading(true);
        //sessionStorage.removeItem('current_writing_attempt');
        const [listAttempt, details] = await Promise.all([
          getProductiveTest(test_id, { page, page_size: PAGE_SIZE }),
          getProductiveTestDetails(test_id),
        ]);
        setHistoryData(listAttempt?.results || []);
        setTestData(details);
        setHistoryData(Array.isArray(listAttempt) ? listAttempt : (listAttempt?.results ?? []));
        setTotalCount(Array.isArray(listAttempt) ? listAttempt.length : (listAttempt?.count ?? 0));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching data:', error);
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    if (test_id) fetchData();
  }, [test_id, page]);

  useEffect(() => {
    setPage(1);
  }, [test_id]);

  const draft = historyData?.find((h) => h.type === 'D');
  const submissions = historyData?.filter((h) => h.type === 'S') || [];
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  const handleContinue = () => {
    const dataToSave = {
      answer: draft.user_answer_text,
      note: draft.user_note_text,
      isReadOnly: draft.type === 'S',
      startTime: draft.start_time,
      totalTime: draft.total_time,
    };
    sessionStorage.setItem('current_productive_attempt', JSON.stringify(dataToSave));
    {
      testData.skill === 'S'
        ? router.push(`/student/speaking/${test_id}/${draft.id}`)
        : router.push(`/student/writing/${test_id}/${draft.id}`);
    }
  };
  const handlePracticeNow = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        const skillPath = testData.skill === 'S' ? 'speaking' : 'writing';
        const currentUrl = `/student/${skillPath}/${test_id}`;
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }
    }
    sessionStorage.removeItem('current_productive_attempt');
    testData.skill === 'S'
      ? router.push(`/student/speaking/${test_id}/${submissions.length + 1}`)
      : router.push(`/student/writing/${test_id}/${submissions.length + 1}`);
  };

  const handleViewDetail = (item) => {
    if (item.type === 'S') {
      if (item.ai_feedback) {
        localStorage.setItem('category', JSON.stringify(item.ai_feedback));
      } else {
        localStorage.removeItem('category');
      }

      if (item.remaining_turns) {
        localStorage.setItem('remainAIturns', JSON.stringify(item.remaining_turns));
      }
      const wordCount = item.user_answer_text
        ? item.user_answer_text.trim().split(/\s+/).length
        : 0;
      localStorage.setItem(
        'aiFeedbackContext',
        JSON.stringify({
          historyId: item.id,
          text: item.user_answer_text,
          wordCount: wordCount,
          title: item.title || 'Writing Task',
          type: item.format || (item.skill === 'W' ? 'A' : 'S'),
          audio: item.audio_path,
          duration: item.total_time,
        }),
      );
      router.push(
        item.skill === 'S'
          ? `/student/speaking/${item.productive_test}/${item.attempt}/AI-feedback`
          : `/student/writing/${item.productive_test}/${item.attempt}/AI-feedback`,
      );
      return;
    }

    const dataToSave = {
      answer: item.user_answer_text,
      note: item.user_note_text,
      isReadOnly: false,
      startTime: item.start_time,
      totalTime: item.total_time,
      audio: item.audio_path,
      feedback: item.ai_feedback,
    };
    sessionStorage.setItem('current_productive_attempt', JSON.stringify(dataToSave));
    if (item.skill === 'S') {
      router.push(`/student/speaking/${item.productive_test}/${item.attempt}`);
    } else {
      router.push(`/student/writing/${item.productive_test}/${item.attempt}`);
    }
  };

  const handleShare = (item) => {
    if (item.is_shared) {
      if (item.skill === 'W') {
        router.push(`/student/writing/${item.productive_test}/forum?open_post=${item.post_id}`);
      } else {
        router.push(`/student/speaking/${item.productive_test}/forum?open_post=${item.post_id}`);
      }
    } else {
      if (item.skill === 'W') {
        router.push(`/student/writing/${item.productive_test}/share/${item.id}`);
      } else {
        router.push(`/student/speaking/${item.productive_test}/share/${item.id}`);
      }
    }
  };

  const handleOpenAIReviewed = (item) => {
    if (item.ai_feedback) {
      setSelectedAIFeedback(item.ai_feedback);
      setOpenAIModal(true);
    }
  };

  return (
    <Box sx={styles.mainWrapper}>
      <Grid container spacing={4}>
        {/* column left */}
        <Grid item sx={{ width: '65%' }}>
          <Paper elevation={0} sx={styles.paperCard}>
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
              <Paper elevation={0} sx={styles.draftPaper}>
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
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    backgroundColor: 'warning.dark',
                  },
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
              data={submissions.map((sub) => ({
                ...sub,
                skill: testData.skill,
                min_words: testData.productive_test.min_word,
              }))}
              skill={testData.skill}
              onViewDetail={handleViewDetail}
              onShare={handleShare}
              onOpenAIReviewed={handleOpenAIReviewed}
            />
          </Box>

          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Box>
          )}
        </Grid>

        {/* column right (Sidebar) */}

        <Grid item sx={{ width: '30%' }}>
          <Stack spacing={3}>
            <SidebarForum />
          </Stack>
        </Grid>
      </Grid>
      <HistoryAIFeedbackModal
        open={openAIModal}
        onClose={() => setOpenAIModal(false)}
        data={selectedAIFeedback}
      />
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
