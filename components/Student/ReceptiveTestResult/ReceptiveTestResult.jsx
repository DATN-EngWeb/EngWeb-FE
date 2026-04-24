'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Container, Typography, CircularProgress, Button } from '@mui/material';
import { getReceptiveTestHistory } from '@/api/test';
import { getFullReceptiveTest } from '@/api/tests';
import {
  loadAudioSource,
  loadImageSource,
  fetchHtmlContent,
} from '../../../api/teacher/upload-reading';

import {
  transformMultiChoiceTest,
  transformFillBlanksTest,
  transformMatchingTest,
} from '@/utils/testDataTransform';

import ReceptiveReviewView from './ReceptiveReviewView';
import ReceptiveSummaryView from './ReceptiveSummaryView';

export default function ReceptiveTestResult({
  mode = 'summary',
  params: passedParams,
  historyId: passedHistoryId,
  testId: passedTestId,
}) {
  const browserParams = useParams();
  const params = passedParams || browserParams;
  const historyId = passedHistoryId || params?.historyId || params?.history_id;
  const testId = passedTestId || params?.test_id || params?.testId;
  const router = useRouter();

  const [history, setHistory] = useState(null);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  const showReview = mode === 'review';

  const navigateToReview = () => {
    router.push(`/student/reading/${testId}/results/${historyId}/review`);
  };

  const navigateToSummary = () => {
    router.push(`/student/reading/${testId}/results/${historyId}`);
  };

  useEffect(() => {
    const clearScrollLock = () => {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px';
      document.body.style.userSelect = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.body.removeAttribute('style');
    };

    clearScrollLock();
    const timer = setTimeout(clearScrollLock, 500);

    const blobUrlsToRevoke = [];

    async function fetchData() {
      if (!historyId || !testId || historyId === 'undefined' || testId === 'undefined') {
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');

        const [historyRes, testRes] = await Promise.all([
          getReceptiveTestHistory(historyId, token),
          getFullReceptiveTest(testId, token),
        ]);

        const partsData = testRes.receptive_test?.receptive_parts || [];

        // Preload resources
        const preloadPromises = partsData.map(async (part) => {
          if (part.format === 'A') {
            const imgPromises = [];
            part.receptive_questions?.forEach((q) => {
              q.receptive_answers?.forEach((opt) => {
                const imgUrl = opt.image?.url || opt.resources?.image;
                if (imgUrl) {
                  imgPromises.push(async () => {
                    const loadedUrl = imgUrl.startsWith('blob:')
                      ? imgUrl
                      : await loadImageSource(imgUrl);
                    if (opt.image?.url) opt.image.url = loadedUrl;
                    else if (opt.resources?.image) opt.resources.image = loadedUrl;
                    if (loadedUrl.startsWith('blob:')) blobUrlsToRevoke.push(loadedUrl);
                  });
                }
              });
            });
            await Promise.all(imgPromises.map((p) => p()));
          } else if (part.format === 'B') {
            const audioPromises = [];
            part.receptive_questions?.forEach((q) => {
              const qAudioUrl = q.audio?.url || q.resources?.audio;
              if (qAudioUrl) {
                audioPromises.push(async () => {
                  const loadedUrl = qAudioUrl.startsWith('blob:')
                    ? qAudioUrl
                    : await loadAudioSource(qAudioUrl);
                  if (q.audio?.url) q.audio.url = loadedUrl;
                  else if (q.resources?.audio) q.resources.audio = loadedUrl;
                  if (loadedUrl.startsWith('blob:')) blobUrlsToRevoke.push(loadedUrl);
                });
              }
            });
            await Promise.all(audioPromises.map((p) => p()));
          }

          if (part.content && part.content.includes('http')) {
            part.content = await fetchHtmlContent(part.content);
          }
          const qHtmlPromises = [];
          part.receptive_questions?.forEach((q) => {
            if (q.content && q.content.includes('http')) {
              qHtmlPromises.push(async () => {
                q.content = await fetchHtmlContent(q.content);
              });
            }
          });
          await Promise.all(qHtmlPromises.map((p) => p()));
        });

        await Promise.all(preloadPromises);

        // Transform parts for components
        const transformedParts = partsData
          .map((part) => {
            const format = part.format;
            let transformedData = null;

            if (['F', 'G', 'A', 'B', 'C'].includes(format)) {
              const transformed = transformMultiChoiceTest({ receptive_parts: [part] });
              transformedData = transformed.parts[0];
            } else if (['H', 'I', 'D'].includes(format)) {
              const transformed = transformFillBlanksTest({ receptive_parts: [part] });
              transformedData = transformed.parts[0];
            } else if (['J', 'E'].includes(format)) {
              const transformed = transformMatchingTest({ receptive_parts: [part] });
              transformedData = transformed.parts[0];
            }

            return {
              order: part.order,
              format,
              componentType: transformedData?.componentType || 'unknown',
              data: transformedData,
              rawPart: part,
            };
          })
          .sort((a, b) => a.order - b.order);

        setHistory(historyRes);
        setTestData({
          ...testRes,
          transformedParts,
        });
      } catch (err) {
        console.error('Error fetching results:', err); // eslint-disable-line no-console
        setError('Failed to load results.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      clearTimeout(timer);
      blobUrlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [historyId, testId]);

  const { stats, maxScore, userAnswers } = useMemo(() => {
    if (!history || !testData) return { stats: null, maxScore: 0, userAnswers: {} };

    let totalPossible = 0;
    if (testData?.receptive_test?.receptive_parts) {
      testData.receptive_test.receptive_parts.forEach((part) => {
        part.receptive_questions.forEach((q) => {
          totalPossible += q.score;
        });
      });
    }

    const totalQuestions = history.answer_histories.length;
    const correctCount = history.answer_histories.filter((a) => a.is_correct).length;
    const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(0) : 0;
    const timeSpent = history.total_time;
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;

    const answersMap = {};
    if (history?.answer_histories && testData?.receptive_test?.receptive_parts) {
      history.answer_histories.forEach((ah) => {
        const part = testData.receptive_test.receptive_parts.find((p) =>
          p.receptive_questions.some((q) => q.id === ah.question_id),
        );
        const question = part?.receptive_questions.find((q) => q.id === ah.question_id);
        const answer = question?.receptive_answers.find((a) => a.id === ah.selected_answer_id);

        const val = answer?.option_label || ah.user_answer_text || '';
        answersMap[ah.question_id] = val;
      });
    }

    return {
      stats: { totalQuestions, correctCount, accuracy, timeStr: `${minutes}m ${seconds}s` },
      maxScore: totalPossible,
      userAnswers: answersMap,
    };
  }, [history, testData]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: '#166534' }} />
        <Typography variant="h6" color="text.secondary">
          Analyzing your results...
        </Typography>
      </Box>
    );
  }

  if (error || !history || !testData) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Results not found'}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/student/reading')} sx={{ mt: 2 }}>
          Back to Hub
        </Button>
      </Container>
    );
  }

  const skillColor = testData.skill === 'R' ? '#166534' : '#1e40af';

  if (showReview) {
    return (
      <ReceptiveReviewView
        testData={testData}
        currentPartIndex={currentPartIndex}
        setCurrentPartIndex={setCurrentPartIndex}
        userAnswers={userAnswers}
        history={history}
        onExit={navigateToSummary}
      />
    );
  }

  return (
    <ReceptiveSummaryView
      testData={testData}
      history={history}
      stats={stats}
      maxScore={maxScore}
      navigateToReview={navigateToReview}
      router={router}
      testId={testId}
      skillColor={skillColor}
    />
  );
}
