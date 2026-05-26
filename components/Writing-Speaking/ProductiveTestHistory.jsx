'use client';
import React from 'react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import * as styles from '@/styles/Student/HistoryTestStyles';
import HistoryTable from '../Student/HistoryTable';
import HistoryAIFeedbackModal from '../WritingTest/HistoryAIFeedbackModal';
import { levelTheme } from '../TestCard';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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
  Skeleton,
  Fade,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const PAGE_SIZE = 10;

export default function ProductiveTestHistory() {
  const params = useParams();
  const test_id = params?.test_id;
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [testData, setTestData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [openAIModal, setOpenAIModal] = useState(false);
  const [selectedAIFeedback, setSelectedAIFeedback] = useState(null);

  //ref when click pagination, scroll smoothly to top of history section instead of top of page (which is default behavior of pagination component)
  const historyRef = useRef(null);

  // Fetch first page of history and test details when test_id changes, show loading spinner
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchInitial = async () => {
      try {
        setInitialLoading(true);
        const [listAttempt, details] = await Promise.all([
          getProductiveTest(test_id, { page: 1, page_size: PAGE_SIZE }),
          getProductiveTestDetails(test_id),
        ]);
        setTestData(details);
        const results = Array.isArray(listAttempt) ? listAttempt : (listAttempt?.results ?? []);
        setHistoryData(results);
        setTotalCount(Array.isArray(listAttempt) ? listAttempt.length : (listAttempt?.count ?? 0));
      } catch (err) {
        console.error(err);
        setHistoryData([]);
      } finally {
        setInitialLoading(false);
      }
    };
    if (test_id) fetchInitial();
  }, [test_id]);

  // Fetch when change page, ignore loading when first fetch
  useEffect(() => {
    if (initialLoading) return;
    const fetchPage = async () => {
      try {
        setPageLoading(true);
        const listAttempt = await getProductiveTest(test_id, { page, page_size: PAGE_SIZE });
        const results = Array.isArray(listAttempt) ? listAttempt : (listAttempt?.results ?? []);
        setHistoryData(results);
        setTotalCount(Array.isArray(listAttempt) ? listAttempt.length : (listAttempt?.count ?? 0));
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchPage();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [test_id]);

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const draft = historyData?.find((h) => h.type === 'D');
  const submissions = historyData?.filter((h) => h.type === 'S') || [];
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleContinue = () => {
    const dataToSave = {
      answer: draft.user_answer_text,
      note: draft.user_note_text,
      isReadOnly: draft.type === 'S',
      startTime: draft.start_time,
      totalTime: draft.total_time,
    };
    sessionStorage.setItem('current_productive_attempt', JSON.stringify(dataToSave));
    testData.skill === 'S'
      ? router.push(`/student/speaking/${test_id}/${draft.id}`)
      : router.push(`/student/writing/${test_id}/${draft.id}`);
  };

  const handlePracticeNow = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        const skillPath = testData.skill === 'S' ? 'speaking' : 'writing';
        router.push(`/login?redirect=${encodeURIComponent(`/student/${skillPath}/${test_id}`)}`);
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
      if (item.ai_feedback) localStorage.setItem('category', JSON.stringify(item.ai_feedback));
      else localStorage.removeItem('category');
      if (item.remaining_turns != null)
        localStorage.setItem('remainAIturns', JSON.stringify(item.remaining_turns));
      else localStorage.removeItem('remainAIturns');
      const wordCount = item.user_answer_text
        ? item.user_answer_text.trim().split(/\s+/).length
        : 0;
      localStorage.setItem(
        'aiFeedbackContext',
        JSON.stringify({
          historyId: item.id,
          text: item.user_answer_text,
          wordCount,
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
    item.skill === 'S'
      ? router.push(`/student/speaking/${item.productive_test}/${item.attempt}`)
      : router.push(`/student/writing/${item.productive_test}/${item.attempt}`);
  };

  const handleShare = (item) => {
    if (item.is_shared) {
      item.skill === 'W'
        ? router.push(`/student/writing/${item.productive_test}/forum?open_post=${item.post_id}`)
        : router.push(`/student/speaking/${item.productive_test}/forum?open_post=${item.post_id}`);
    } else {
      item.skill === 'W'
        ? router.push(`/student/writing/${item.productive_test}/share/${item.id}`)
        : router.push(`/student/speaking/${item.productive_test}/share/${item.id}`);
    }
  };

  const handleOpenAIReviewed = (item) => {
    if (item.ai_feedback) {
      setSelectedAIFeedback(item.ai_feedback);
      setOpenAIModal(true);
    }
  };

  const handlePageChange = (_, value) => {
    setPage(value);
    // Scroll smoothly to top of history section when click pagination, instead of default behavior which scrolls to top of page
    setTimeout(() => {
      historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <Box sx={styles.mainWrapper}>
      <Grid container spacing={isMobile ? 2 : 4}>
        {/* Cột trái */}
        <Grid item xs={12} md={8}>
          {/* Card tiêu đề */}
          <Paper
            elevation={0}
            sx={{ ...styles.paperCard, p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, md: 3 } }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={{ xs: 1, sm: 2 }}
              mb={1.5}
            >
              <Typography
                variant="h4"
                fontWeight={800}
                color="primary.main"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' },
                  wordBreak: 'break-word',
                }}
              >
                {testData.title || 'Productive Test'}
              </Typography>
              <Box
                sx={{
                  ...styles.levelTag(levelTheme[testData.level]),
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-start', sm: 'auto' },
                }}
              >
                Level {testData.level}
              </Box>
            </Stack>

            <Alert
              icon={<InfoIcon fontSize={isSmall ? 'small' : 'medium'} />}
              sx={{ ...styles.instructionAlert, mt: { xs: 1.5, md: 2 } }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Instruction
              </Typography>
              {testData.instruction || 'Please complete the draft before final submission.'}
            </Alert>
          </Paper>

          {/* Draft / Practice Now */}
          {draft ? (
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <SectionTitle title="Current Session" color="#ffb300" />
              <Paper
                elevation={0}
                sx={{ ...styles.draftPaper, p: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}
              >
                <DraftActive
                  lastSaved={new Date(draft.end_time).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour12: false,
                  })}
                  onContinue={handleContinue}
                  isSmall={isSmall}
                />
              </Paper>
            </Box>
          ) : (
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Button
                fullWidth
                variant="contained"
                size={isSmall ? 'medium' : 'large'}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'warning.main',
                  color: 'primary.main',
                  boxShadow: 'none',
                  py: { xs: 1, sm: 1.5 },
                  '&:hover': { boxShadow: 'none', backgroundColor: 'warning.dark' },
                }}
                onClick={handlePracticeNow}
              >
                <Edit sx={{ mr: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                Practice Now
              </Button>
            </Box>
          )}

          {/* History section */}
          {/* scroll-margin-top to account for fixed header */}
          <Box ref={historyRef} sx={{ scrollMarginTop: '80px' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <SectionTitle title="Submission History" color="#cfd8dc" />
              <Typography variant="caption" fontWeight={700} sx={{ flexShrink: 0, ml: 1 }}>
                {submissions.length} attempts
              </Typography>
            </Stack>

            {/* Skeleton rows when loading */}
            {pageLoading ? (
              <Box>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={58} sx={{ mb: 1, borderRadius: 2 }} />
                ))}
              </Box>
            ) : (
              <Fade in timeout={300}>
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
              </Fade>
            )}

            {totalPages > 1 && (
              <Box sx={{ mt: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  size={isSmall ? 'small' : 'large'}
                  disabled={pageLoading}
                />
              </Box>
            )}
          </Box>
        </Grid>

        {/* column for sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={isMobile ? 2 : 3}>
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
    sx={{
      mb: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      fontSize: { xs: '1rem', sm: '1.25rem' },
    }}
  >
    <Box sx={{ width: 4, height: 22, bgcolor: color, borderRadius: 2, flexShrink: 0 }} />
    {title}
  </Typography>
);

const DraftActive = ({ lastSaved, onContinue, isSmall }) => (
  <>
    <Box
      sx={{
        bgcolor: '#fff3e0',
        width: { xs: 40, sm: 50 },
        height: { xs: 40, sm: 50 },
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 1.5,
      }}
    >
      <EditNoteIcon sx={{ color: '#ffb300', fontSize: { xs: '1.4rem', sm: '1.75rem' } }} />
    </Box>
    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
      Draft in Progress
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      mb={2}
      sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}
    >
      Last saved: {lastSaved}
    </Typography>
    <Button
      variant="contained"
      startIcon={<OpenInNewIcon fontSize={isSmall ? 'small' : 'medium'} />}
      onClick={onContinue}
      size={isSmall ? 'small' : 'medium'}
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
