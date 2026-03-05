/* eslint-env browser */
/* eslint-disable no-console */
/* global setInterval, clearInterval */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, Button, Snackbar, Alert } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getRecepiveTestDetails } from '../../../api/teacher/upload-reading';
import { createReceptiveTest } from '../../../api/test';
import { listeningtestStyles } from '../../../styles/Student/Listening/listeningTestStyles';
import { getListeningTestTypeLabel, formatTimeFromMinutes } from '../../../utils/stringFormat';
import MultipleChoiceImagePart from './part/multipleChoiceImage';
import FillBlankPart from './part/fillBlanks';
import MultipleChoiceSingleAudio from './part/multipleChoiceSingleAudio';
import MultipleChoiceQuestionAudio from './part/multipleChoiceMultiQuestionAudio';
import Matching from './part/matching';
import Skeleton from './skeleton';

export default function ListeningTestContent({ test_id, initialData }) {
  const router = useRouter();

  const [testData, setTestData] = useState(initialData || null);
  const [receptiveParts, setReceptiveParts] = useState([]);
  const [indexPart, setIndexPart] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [timeLeft, setTimeLeft] = useState(testData?.time || 0);
  const [allAnswers, setAllAnswers] = useState({});

  const [testHistory, setTestHistory] = useState({
    receptive_test: null,
    type: 'D',
    start_time: '2026-02-25T10:00:00Z',
    end_time: null,
    answer_histories: [],
  });

  const transformAnswers = (answersObj) => {
    const result = [];

    // Duyệt qua từng Part
    Object.values(answersObj).forEach((questions) => {
      // Duyệt qua từng câu hỏi trong Part đó
      Object.entries(questions).forEach(([questionId, value]) => {
        const historyItem = {
          receptive_question: questionId,
        };

        if (typeof value === 'number') {
          historyItem.receptive_answer = value;
        } else {
          historyItem.user_answer_text = value;
        }

        result.push(historyItem);
      });
    });

    return result;
  };

  const checkCompletionStatus = (testData, allAnswers) => {
    let totalQuestions = 0;
    testData.receptive_test.receptive_parts.forEach((part) => {
      totalQuestions += part.receptive_questions.length;
    });

    let totalAnswered = 0;
    Object.values(allAnswers).forEach((partAnswers) => {
      // partAnswers là object { "125": 214, ... }
      totalAnswered += Object.keys(partAnswers).length;
    });

    return totalQuestions === totalAnswered ? 'S' : 'D';
  };

  const handleSubmit = async () => {
    try {
      const currentType = checkCompletionStatus(testData, allAnswers);
      const formattedHistories = transformAnswers(allAnswers);

      setTestHistory((prev) => ({
        ...prev,
        type: currentType,
        answer_histories: formattedHistories,
        end_time: new Date().toISOString(),
      }));

      const token = localStorage.getItem('accessToken');
      const response = await createReceptiveTest(
        {
          receptive_test: testHistory.receptive_test,
          type: currentType,
          start_time: testHistory.start_time,
          end_time: new Date().toISOString(),
          answer_histories: formattedHistories,
        },
        token,
      );
      setSnackbar({ open: true, message: 'Draft saved successfully!', severity: 'success' });
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('current_productive_attempt');
        }
        // Chuyển hướng về trang danh sách hoặc kết quả
        router.push(`/student/listening/${test_id}`);
      }, 1000);
    } catch (error) {
      console.error('Draft save error:', error);
      if (error.status === 400) {
        setSnackbar({
          open: true,
          message: 'Invalid data. Please check your request.',
          severity: 'error',
        });
      } else if (error.status === 403) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to perform this action.',
          severity: 'error',
        });
      } else if (error.status === 401) {
        setSnackbar({
          open: true,
          message: 'Authentication required. Please log in again.',
          severity: 'error',
        });
      }
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchTestData = async () => {
      if (!test_id) return;
      try {
        const svData = await getRecepiveTestDetails(test_id);
        setTestData(svData);
        setReceptiveParts(svData.receptive_test.receptive_parts || []);
        setTimeLeft(svData.time * 60);
        setTestHistory((prev) => ({
          ...prev,
          receptive_test: svData.id,
          start_time: new Date().toISOString(),
        }));
        console.log('Dữ liệu bài thi nghe:', svData);
      } catch (error) {
        console.error('Lỗi tải dữ liệu bài thi:', error);
      }
    };

    fetchTestData();
  }, [test_id]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Phần delay để hiển thị Sekeleton
  const [isDelayed, setIsDelayed] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!testData || isDelayed) {
    return <Skeleton />;
  }

  const goNextPart = () => {
    if (indexPart < receptiveParts.length - 1) {
      window.scrollTo({ top: 64, behavior: 'smooth' });
      setIndexPart(indexPart + 1);
    }
  };

  const goPrevPart = () => {
    if (indexPart > 0) {
      window.scrollTo({ top: 64, behavior: 'smooth' });
      setIndexPart(indexPart - 1);
    }
  };

  // Hàm cập nhật câu trả lời người dùng
  const handleUpdateAnswers = (partId, answers) => {
    setAllAnswers((prev) => ({
      ...prev,
      [partId]: answers,
    }));
  };

  const renderPart = (part, index) => {
    // - 'A': Listening - Multiple choice images
    // - 'B': Listening - Multiple choice text (one audio per question)
    // - 'C': Listening - Multiple choice text (one audio for all question)
    // - 'D': Listening - Fill in the blank (text)
    // - 'E': Listening - Matching

    const isActive = indexPart === index;

    const commonProps = {
      dataPart: part,
      isActive: isActive,
      userAnswers: allAnswers[part.id] || {},
      onUpdateAnswers: (answers) => handleUpdateAnswers(part.id, answers),
    };

    switch (part.format) {
      case 'A':
        return <MultipleChoiceImagePart key={part.id} {...commonProps} />;
      case 'B':
        return <MultipleChoiceSingleAudio key={part.id} {...commonProps} />;
      case 'C':
        return <MultipleChoiceQuestionAudio key={part.id} {...commonProps} />;
      case 'D':
        return <FillBlankPart key={part.id} {...commonProps} />;
      case 'E':
        return <Matching key={part.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={listeningtestStyles.mainContainer}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Container maxWidth="lg">
        {/* -------- Test Heading Section --------- */}
        <Box sx={listeningtestStyles.testHeadingContainer}>
          {/* <Typography
            sx={{ ...listeningtestStyles.backButton, fontSize: { xs: '0.8rem', md: '1rem' } }}
          >
            <ExpandLessIcon
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.6rem', md: '1.8rem' },
                color: 'gray.main',
                transform: 'rotate(270deg)',
              }}
            />
            <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
              Back to homepage
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
              Homepage
            </Box>
          </Typography> */}
          <Box sx={listeningtestStyles.timeLeft}>
            <AccessTimeIcon
              sx={{
                color: 'secondary.main',
                fontSize: { xs: '1rem', md: '1.5rem' },
                mr: 0.5,
              }}
            />
            {formatTimeFromMinutes(timeLeft / 60)}
          </Box>
          <Box sx={listeningtestStyles.nameTestAndFormatPart}>
            <Typography sx={listeningtestStyles.nameTest}>{testData?.title}</Typography>
            <Typography sx={listeningtestStyles.formatName}>
              {`Part ${indexPart + 1}: `}
              {getListeningTestTypeLabel(receptiveParts[indexPart]?.format)}
            </Typography>
          </Box>
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            <Button sx={listeningtestStyles.submitButton} onClick={handleSubmit}>
              Submit Test
            </Button>
          </Box>
        </Box>
        <Box sx={listeningtestStyles.separatorLine}></Box>
        {/* -------- List Part Selection --------- */}
        <Box sx={listeningtestStyles.listPartContainer}>
          {receptiveParts.map((part, index) => (
            <Box
              sx={{
                ...listeningtestStyles.boxPart,
                ...(index === indexPart && {
                  backgroundColor: 'background.default',
                  borderColor: 'orange.light',
                  color: 'orange.dark',
                }),
                ...((index < indexPart - 1 || index > indexPart + 1) && {
                  display: { xs: 'none', sm: 'flex' },
                }),
                ...(((index === indexPart - 2 && indexPart === receptiveParts.length - 1) ||
                  (index === indexPart + 2 && indexPart === 0)) && {
                  display: 'flex',
                }),
              }}
              key={part.id}
              onClick={() => setIndexPart(index)}
            >
              Part {index + 1}
            </Box>
          ))}
        </Box>
        <Box sx={{ ...listeningtestStyles.separatorLine, backgroundColor: 'gray.main' }}></Box>
      </Container>
      {/* -------- Part Content Section --------- */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}>
        {receptiveParts.map((part, index) => renderPart(part, index))}
      </Box>
      {/* -------- Stepper Section --------- */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}>
        <Container maxWidth="lg" sx={listeningtestStyles.stepperContainer}>
          <Typography
            sx={{
              ...listeningtestStyles.backButton,
              visibility: indexPart === 0 ? 'hidden' : 'visible',
            }}
            onClick={() => goPrevPart()}
          >
            <ExpandLessIcon
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.6rem', md: '1.8rem' },
                color: 'gray.main',
                transform: 'rotate(270deg)',
              }}
            />
            Back
          </Typography>
          <Typography sx={{ fontSize: '1rem' }}>
            Section {indexPart + 1} of {receptiveParts.length}
          </Typography>
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            {indexPart !== receptiveParts.length - 1 ? (
              <Button sx={listeningtestStyles.nextButton} onClick={() => goNextPart()}>
                Next
              </Button>
            ) : (
              <Button sx={listeningtestStyles.nextButton} onClick={() => goNextPart()}>
                Submit
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
