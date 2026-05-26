'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Container, Typography, Button } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getReceptiveTestHistory } from '@/api/test';
import { getFullReceptiveTestReview } from '@/api/tests';
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
import { listeningtestStyles } from '@/styles/Student/Listening/listeningTestStyles';
import Skeleton from '../ListeningTest/skeleton';

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
  const [viewMode, setViewMode] = useState(mode);

  const [targetQuestionId, setTargetQuestionId] = useState(null);

  const showReview = viewMode === 'review';

  const navigateToReview = (index = 0, questionId = null) => {
    if (typeof index === 'number') {
      setCurrentPartIndex(index);
    }
    setViewMode('review');
    if (questionId) {
      setTargetQuestionId(questionId);
    }
  };

  const navigateToSummary = () => {
    setViewMode('summary');
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
          getFullReceptiveTestReview(testId, token),
        ]);

        const partsData = testRes.receptive_test?.receptive_parts || [];
        partsData.sort((a, b) => a.order - b.order);
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
            if (
              q.content &&
              q.content.includes('http') &&
              part.format !== 'G' &&
              part.format !== 'J'
            ) {
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
        console.error('Error fetching results:', err);
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

  useEffect(() => {
    if (targetQuestionId && showReview) {
      let retryCount = 0;
      const maxRetries = 15;

      const attemptScroll = () => {
        const element = document.getElementById(`question-${targetQuestionId}`);

        if (element && element.getBoundingClientRect().height > 0) {
          window.requestAnimationFrame(() => {
            // 1. Cuộn vào giữa màn hình
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });

            // 2. CSS an toàn: CHỈ ĐẨY LÊN, KHÔNG ĐỔI MÀU
            if (!document.getElementById('safe-bounce-style')) {
              const style = document.createElement('style');
              style.id = 'safe-bounce-style';
              style.innerHTML = `
                @keyframes slightBounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-2px); } 
                }
                .safe-element-bounce {
                  animation: slightBounce 0.3s ease-in-out 2; 
                }
              `;
              document.head.appendChild(style);
            }

            // 3. Kịch bản nảy lên
            setTimeout(() => {
              element.classList.add('safe-element-bounce');

              // Dọn dẹp class sau khi animation hoàn thành
              setTimeout(() => {
                element.classList.remove('safe-element-bounce');
              }, 600);
            }, 300); // Đợi cuộn ổn định rồi mới nảy
          });

          // Reset lại target sau khi đã cuộn thành công
          setTargetQuestionId(null);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptScroll, 100);
        }
      };

      const timer = setTimeout(attemptScroll, 200);
      return () => clearTimeout(timer);
    }
  }, [currentPartIndex, targetQuestionId, showReview]);

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

        let answer = question?.receptive_answers.find((a) => a.id === ah.selected_answer_id);
        let val = answer?.option_label || ah.user_answer_text;

        if (!val && part) {
          const allAnswersInPart = part.receptive_questions.flatMap(
            (q) => q.receptive_answers || [],
          );
          const globalAnswer = allAnswersInPart.find((a) => a.id === ah.selected_answer_id);
          val = globalAnswer?.option_label;
        }

        answersMap[ah.question_id] = val || ah.selected_answer_id || '';
      });
    }

    return {
      stats: { totalQuestions, correctCount, accuracy, timeStr: `${minutes}m ${seconds}s` },
      maxScore: totalPossible,
      userAnswers: answersMap,
    };
  }, [history, testData]);

  const skillColor = testData?.skill === 'R' ? '#166534' : '#1e40af';

  if (loading) {
    return <Skeleton />;
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

  const receptiveParts = testData.receptive_test?.receptive_parts || [];

  // Gom cấu trúc Tab lại để xử lý Responsive Logic gọn gàng giống ReadingTestContent
  const tabs = [
    { label: 'Summary', isSummary: true },
    ...receptiveParts.map((part, index) => ({
      label: `Part ${part.order || index + 1}`,
      index,
      isSummary: false,
    })),
  ];
  const activeTabIndex = showReview ? currentPartIndex + 1 : 0;

  // Handle Stepper Navigation
  const handleBack = () => {
    if (activeTabIndex > 0) {
      const prevTab = tabs[activeTabIndex - 1];
      if (prevTab.isSummary) {
        navigateToSummary();
      } else {
        navigateToReview(prevTab.index);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (activeTabIndex < tabs.length - 1) {
      const nextTab = tabs[activeTabIndex + 1];
      navigateToReview(nextTab.index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}
    >
      {/* KHỐI 1: TEST HEADING */}
      <Box
        maxWidth="lg"
        sx={{
          ...listeningtestStyles.testHeadingContainer,
          mx: 'auto',
          backgroundColor: 'background.paper',
        }}
      >
        {/* Name Test and Format Part */}
        <Box sx={listeningtestStyles.nameTestAndFormatPart}>
          <Typography sx={listeningtestStyles.nameTest}>{testData.title}</Typography>
          <Typography sx={listeningtestStyles.formatName}>
            {showReview ? `Review - Part ${currentPartIndex + 1}` : 'Summary'}
          </Typography>
        </Box>
      </Box>

      {/* KHỐI 2: LIST PART SELECTION */}
      <Box maxWidth="lg" sx={{ ...listeningtestStyles.listPartContainer, mx: 'auto' }}>
        {tabs.map((tab, i) => (
          <Box
            key={i}
            onClick={() => (tab.isSummary ? navigateToSummary() : navigateToReview(tab.index))}
            sx={{
              ...listeningtestStyles.boxPart,
              // Áp dụng UI riêng cho tab Summary theo yêu cầu của bạn
              ...(tab.isSummary && {
                width: 'auto',
                px: 2,
              }),
              // Active state
              ...(i === activeTabIndex && {
                backgroundColor: 'background.default',
                borderColor: 'orange.light',
                color: 'orange.dark',
              }),
              // Responsive Logic: Cuộn tab giống bên ReadingTestContent
              ...((i < activeTabIndex - 1 || i > activeTabIndex + 1) && {
                display: { xs: 'none', sm: 'flex' },
              }),
              ...(((i === activeTabIndex - 2 && activeTabIndex === tabs.length - 1) ||
                (i === activeTabIndex + 2 && activeTabIndex === 0)) && {
                display: 'flex',
              }),
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>
      {/* Separator Line */}
      <Box sx={{ ...listeningtestStyles.separatorLine, backgroundColor: 'gray.main' }} />

      {/* KHỐI 3: CONTENT VIEW */}
      <Box
        sx={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        {showReview ? (
          <ReceptiveReviewView
            testData={testData}
            currentPartIndex={currentPartIndex}
            setCurrentPartIndex={setCurrentPartIndex}
            userAnswers={userAnswers}
            history={history}
            onExit={navigateToSummary}
          />
        ) : (
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
        )}
      </Box>

      {/* KHỐI 4: STEPPER NAVIGATION Ở DƯỚI CÙNG */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray', pb: 4 }}>
        <Container maxWidth="lg" sx={listeningtestStyles.stepperContainer}>
          <Typography
            sx={{
              ...listeningtestStyles.backButton,
              display: activeTabIndex === 0 ? { xs: 'none', md: 'flex' } : 'flex',
              visibility: activeTabIndex === 0 ? 'hidden' : 'visible',
            }}
            onClick={handleBack}
          >
            <ExpandLessIcon
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.6rem', md: '1.8rem' },
                color: 'gray.main',
                transform: 'rotate(270deg)',
              }}
            />
            Prev
          </Typography>

          <Typography sx={{ fontSize: '1rem' }}>
            Section {activeTabIndex + 1} of {tabs.length}
          </Typography>

          <Box
            sx={{
              ...listeningtestStyles.summitButtonWrapper,
              display: activeTabIndex === tabs.length - 1 ? { xs: 'none', md: 'flex' } : 'flex',
            }}
          >
            {activeTabIndex !== tabs.length - 1 && (
              <Button sx={listeningtestStyles.nextButton} onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
