'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ForumIcon from '@mui/icons-material/Forum';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { getTestFeedbacks } from '../../../../../../api/feedback';
import FeedbackCard from '../../../../../../components/Teacher/Feedback/FeedbackCard';
import {
  getProductiveTestDetails,
  getReceptiveTestDetails,
  getRecepiveTestDetails,
} from '../../../../../../api/test';

const STATUS_LABELS = {
  D: 'Draft',
  I: 'In Review',
  P: 'Published',
};

const SKILL_LABELS = {
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
  speaking: 'Speaking',
};

const TEST_DETAIL_FETCHERS = {
  reading: getReceptiveTestDetails,
  listening: getRecepiveTestDetails,
  writing: getProductiveTestDetails,
  speaking: getProductiveTestDetails,
};

function normalizeFeedbackResponse(data) {
  if (Array.isArray(data)) {
    return { items: data, next: null };
  }

  return {
    items: data?.results ?? [],
    next: data?.next ?? null,
  };
}

export default function ViewTestFeedbackPage({ params }) {
  const { skill, test_id } = use(params);
  const router = useRouter();

  const normalizedSkill = (skill || '').toLowerCase();

  const [testTitle, setTestTitle] = useState('Test Feedback');
  const [testStatus, setTestStatus] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [aiFeedback, setAiFeedback] = useState(null);
  const [teacherFeedbacks, setTeacherFeedbacks] = useState([]);
  const [nextTeacherPage, setNextTeacherPage] = useState(null);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [feedbackError, setFeedbackError] = useState(null);
  const [loadingMoreTeachers, setLoadingMoreTeachers] = useState(false);

  const supportsAiGeneration = ['speaking', 'writing'].includes(normalizedSkill);
  const canGenerateAiFeedback = supportsAiGeneration && testStatus === 'I';

  const skillLabel = useMemo(
    () => SKILL_LABELS[normalizedSkill] || (skill ? String(skill) : 'Unknown'),
    [normalizedSkill, skill],
  );

  const loadFeedbacks = useCallback(async () => {
    setLoadingFeedbacks(true);
    setFeedbackError(null);

    try {
      const [aiFeedbackData, teacherFeedbackData] = await Promise.all([
        getTestFeedbacks({ test_id, created_by: 'A' }),
        getTestFeedbacks({ test_id, created_by: 'T' }),
      ]);

      const aiPayload = normalizeFeedbackResponse(aiFeedbackData);
      const teacherPayload = normalizeFeedbackResponse(teacherFeedbackData);

      setAiFeedback(aiPayload.items[0] || null);
      setTeacherFeedbacks(teacherPayload.items);
      setNextTeacherPage(teacherPayload.next);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to load feedback list.');
    } finally {
      setLoadingFeedbacks(false);
    }
  }, [test_id]);

  useEffect(() => {
    const fetchPageData = async () => {
      setPageLoading(true);
      setPageError(null);

      try {
        const detailFetcher = TEST_DETAIL_FETCHERS[normalizedSkill];
        if (!detailFetcher) {
          throw new Error('Unsupported skill type in feedback route.');
        }

        const details = await detailFetcher(test_id);
        setTestTitle(details?.title || `${skillLabel} Test Feedback`);
        setTestStatus(details?.status || null);
      } catch (err) {
        setPageError(err.message || 'Failed to load test details.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchPageData();
  }, [normalizedSkill, skillLabel, test_id]);

  useEffect(() => {
    if (!pageLoading && !pageError) {
      loadFeedbacks();
    }
  }, [loadFeedbacks, pageLoading, pageError]);

  const handleLoadMoreTeachers = async () => {
    if (!nextTeacherPage || loadingMoreTeachers) return;

    setLoadingMoreTeachers(true);
    try {
      const page = new URL(nextTeacherPage).searchParams.get('page');
      const data = await getTestFeedbacks({ test_id, created_by: 'T', page });
      const payload = normalizeFeedbackResponse(data);
      setTeacherFeedbacks((prev) => [...prev, ...payload.items]);
      setNextTeacherPage(payload.next);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to load more teacher feedbacks.');
    } finally {
      setLoadingMoreTeachers(false);
    }
  };

  const handleRequestAiFeedback = async () => {
    setFeedbackError('Generate AI feedback is not implemented yet.');
  };

  if (pageLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (pageError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Alert severity="error">{pageError}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {testTitle}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Chip label={skillLabel} sx={{ fontWeight: 700 }} />
            <Chip
              label={STATUS_LABELS[testStatus] || testStatus || 'Unknown'}
              color={testStatus === 'I' ? 'info' : testStatus === 'P' ? 'success' : 'warning'}
            />
          </Stack>
        </Box>
      </Stack>

      {feedbackError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {feedbackError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'start',
        }}
      >
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <SmartToyIcon color="info" />
              <Typography variant="h6" fontWeight={700}>
                AI Feedback
              </Typography>
            </Stack>

            {loadingFeedbacks ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} />
              </Box>
            ) : aiFeedback ? (
              <FeedbackCard feedback={aiFeedback} isAi />
            ) : (
              <Stack spacing={1.5}>
                <Alert severity="info">No AI feedback for this test yet.</Alert>
                {supportsAiGeneration && (
                  <Button
                    variant="contained"
                    startIcon={<AutoFixHighIcon />}
                    onClick={handleRequestAiFeedback}
                    disabled={!canGenerateAiFeedback}
                    sx={{ width: 'fit-content', textTransform: 'none', fontWeight: 700 }}
                  >
                    Generate AI Feedback
                  </Button>
                )}
                {supportsAiGeneration && !canGenerateAiFeedback && (
                  <Typography variant="body2" color="text.secondary">
                    AI feedback can be generated only when the test status is In Review.
                  </Typography>
                )}
                {!supportsAiGeneration && (
                  <Typography variant="body2" color="text.secondary">
                    Auto-generated AI feedback is currently available for Speaking and Writing only.
                  </Typography>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <ForumIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Teacher Feedback
              </Typography>
            </Stack>

            {loadingFeedbacks ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} />
              </Box>
            ) : teacherFeedbacks.length === 0 ? (
              <Alert severity="info">No teacher feedback found.</Alert>
            ) : (
              <Stack spacing={1.5}>
                {teacherFeedbacks.map((feedback) => (
                  <FeedbackCard key={feedback.id} feedback={feedback} />
                ))}

                {nextTeacherPage && (
                  <Button
                    variant="text"
                    onClick={handleLoadMoreTeachers}
                    disabled={loadingMoreTeachers}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {loadingMoreTeachers ? 'Loading...' : 'Load more'}
                  </Button>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
