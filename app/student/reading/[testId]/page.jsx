'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CircularProgress, Box, Alert, Button } from '@mui/material';
import MultiChoiceReading from '@/components/Reading/MultiChoice/MultiChoiceReading';
import FillBlanksReading from '@/components/Reading/FillBlanks/FillBlanksReading';
import MatchingReading from '@/components/Reading/Matching/MatchingReading';
import { getFullReceptiveTest } from '@/api/tests';
import {
  transformMultiChoiceTest,
  transformFillBlanksTest,
  transformMatchingTest,
} from '@/utils/testDataTransform';
import ReceptiveTestHistory from '@/components/Reading/ReceptiveTestHistory';

export default function ReadingTestPage() {
  const params = useParams();
  const testId = params?.testId;

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [isPracticing, setIsPracticing] = useState(false);

  useEffect(() => {
    async function fetchTestData() {
      if (!testId) {
        setError('Test ID is required.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const backendTest = await getFullReceptiveTest(testId);

        if (!backendTest?.receptive_test?.receptive_parts) {
          setError('This test does not contain any parts.');
          setLoading(false);
          return;
        }

        const parts = backendTest.receptive_test.receptive_parts.map((part) => {
          const format = part.format;
          let componentType = 'unknown';
          let transformedData = null;

          if (format === 'F' || format === 'G') {
            componentType = 'multi-choice';
            const transformed = transformMultiChoiceTest({
              receptive_test: {
                receptive_parts: [part],
              },
            });
            transformedData = transformed.parts[0];
          } else if (format === 'H' || format === 'I') {
            componentType = 'fill-blanks';
            const transformed = transformFillBlanksTest({
              receptive_test: {
                receptive_parts: [part],
              },
            });
            transformedData = transformed.parts[0];
          } else if (format === 'J' || format === 'E') {
            componentType = 'matching';
            const transformed = transformMatchingTest({
              receptive_test: {
                receptive_parts: [part],
              },
            });
            transformedData = transformed.parts[0];
          }

          return {
            order: part.order,
            format,
            componentType,
            data: transformedData,
            rawPart: part,
          };
        });

        parts.sort((a, b) => a.order - b.order);

        setTestData({
          id: backendTest.id,
          title: backendTest.title,
          description: backendTest.description,
          level: backendTest.level,
          skill: backendTest.skill,
          time: backendTest.time,
          parts,
        });
      } catch (err) {
        setError(err.message || 'Failed to load test data');
      } finally {
        setLoading(false);
      }
    }

    fetchTestData();
  }, [testId]);

  const handleAnswerChange = (newAnswers) => {
    setAnswers(newAnswers);
  };

  const handleSubmit = (finalAnswers) => {
    window.alert(
      `Test submitted successfully!\n\nAnswers: ${JSON.stringify(finalAnswers, null, 2)}`,
    );
  };

  const handlePartChange = (newPartIndex) => {
    setCurrentPartIndex(newPartIndex);
  };

  const handleBack = () => {
    if (currentPartIndex > 0) {
      setCurrentPartIndex(currentPartIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (testData && currentPartIndex < testData.parts.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Box sx={{ fontSize: '18px', color: 'text.secondary' }}>Loading test data...</Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          padding: 3,
        }}
      >
        <Alert
          severity="error"
          sx={{ maxWidth: 600 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!testData || !testData.parts || testData.parts.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          padding: 3,
        }}
      >
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          No test data available.
        </Alert>
      </Box>
    );
  }

  const currentPart = testData.parts[currentPartIndex];

  const renderPartComponent = () => {
    if (!currentPart || !currentPart.data) {
      return (
        <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          This part format is not yet supported.
        </Alert>
      );
    }

    const commonProps = {
      testName: testData.title,
      parts: testData.parts.map((p, idx) => `Part ${idx + 1}`),
      currentPart: currentPartIndex + 1,
      answers,
      onAnswerChange: handleAnswerChange,
      onPartChange: handlePartChange,
      isTeacher: false,
      onSubmit: handleSubmit,
      onBack: handleBack,
      onNext: handleNext,
      currentSection: currentPartIndex + 1,
      totalSections: testData.parts.length,
    };

    switch (currentPart.componentType) {
      case 'multi-choice':
        return (
          <MultiChoiceReading
            {...commonProps}
            passage={currentPart.data.passage}
            passageTitle={currentPart.data.passageTitle}
            questions={currentPart.data.questions}
          />
        );

      case 'fill-blanks':
        return (
          <FillBlanksReading
            {...commonProps}
            passage={currentPart.data.passage}
            passageTitle={currentPart.data.passageTitle}
            blanks={currentPart.data.blanks}
            questions={currentPart.data.questions}
          />
        );

      case 'matching':
        return (
          <MatchingReading
            {...commonProps}
            passage={currentPart.data.passage}
            passageTitle={currentPart.data.passageTitle}
            sentences={currentPart.data.sentences}
            gaps={currentPart.data.gaps}
          />
        );

      default:
        return (
          <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            Unknown part format: {currentPart.format}
          </Alert>
        );
    }
  };

  if (!isPracticing) {
    return <ReceptiveTestHistory testData={testData} onPracticeNow={() => setIsPracticing(true)} />;
  }

  return <>{renderPartComponent()}</>;
}
