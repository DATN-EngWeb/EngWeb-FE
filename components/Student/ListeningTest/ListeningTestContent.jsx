/* eslint-env browser */
/* eslint-disable no-console */
/* global setInterval, clearInterval */
'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Snackbar, Alert } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getRecepiveTestDetails } from '../../../api/teacher/upload-reading';
import { listeningtestStyles } from '../../../styles/Student/Listening/listeningTestStyles';
import { getListeningTestTypeLabel, formatTimeFromMinutes } from '../../../utils/stringFormat';
import MultipleChoiceImagePart from './part/multipleChoiceImage';
import FillBlankPart from './part/fillBlanks';
import MultipleChoiceSingleAudio from './part/multipleChoiceSingleAudio';
import MultipleChoiceQuestionAudio from './part/multipleChoiceMultiQuestionAudio';
import Matching from './part/matching';
import Skeleton from './skeleton';

export default function ListeningTestContent({ test_id, initialData }) {
  const [testData, setTestData] = useState(initialData || null);
  const [receptiveParts, setReceptiveParts] = useState([]);
  const [indexPart, setIndexPart] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [timeLeft, setTimeLeft] = useState(testData?.time || 0);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!test_id) return;
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setSnackbar({ open: true, message: 'Authentication required', severity: 'error' });
          return;
        }

        const svData = await getRecepiveTestDetails(test_id, accessToken);
        setTestData(svData);
        setReceptiveParts(svData.receptive_test.receptive_parts || []);
        setTimeLeft(svData.time * 60);
        console.log('Dữ liệu bài thi nghe:', svData);
      } catch (error) {
        console.error('Lỗi tải dữ liệu bài thi:', error);
      }
    };

    fetchTestData();
  }, [test_id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);
  if (!testData) return <Skeleton />;

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

  const renderPart = (part, index) => {
    // - 'A': Listening - Multiple choice images
    // - 'B': Listening - Multiple choice text (one audio per question)
    // - 'C': Listening - Multiple choice text (one audio for all question)
    // - 'D': Listening - Fill in the blank (text)
    // - 'E': Listening - Matching

    const isActive = indexPart === index;

    switch (part.format) {
      case 'A':
        return <MultipleChoiceImagePart key={part.id} dataPart={part} isActive={isActive} />;
      case 'B':
        return <MultipleChoiceSingleAudio key={part.id} dataPart={part} isActive={isActive} />;
      case 'C':
        return <MultipleChoiceQuestionAudio key={part.id} dataPart={part} isActive={isActive} />;
      case 'D':
        return <FillBlankPart key={part.id} dataPart={part} isActive={isActive} />;
      case 'E':
        return <Matching key={part.id} dataPart={part} isActive={isActive} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ ...listeningtestStyles.mainContainer, overflow: 'hidden' }}>
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
          <Typography
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
          </Typography>
          <Box sx={listeningtestStyles.nameTestAndFormatPart}>
            <Typography sx={listeningtestStyles.nameTest}>{testData?.title}</Typography>
            <Typography sx={listeningtestStyles.formatName}>
              {`Part ${indexPart + 1}: `}
              {getListeningTestTypeLabel(receptiveParts[indexPart]?.format)}
            </Typography>
          </Box>
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            <Button sx={listeningtestStyles.submitButton}>Submit Test</Button>
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
              }}
              key={part.id}
              onClick={() => setIndexPart(index)}
            >
              Part {index + 1}
            </Box>
          ))}
          <Box sx={listeningtestStyles.timeLeft}>
            <AccessTimeIcon
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                mr: 0.5,
              }}
            />
            {formatTimeFromMinutes(timeLeft / 60)}
          </Box>{' '}
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
