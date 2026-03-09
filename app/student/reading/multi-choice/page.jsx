'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CircularProgress, Box, Alert, Button } from '@mui/material';
import MultiChoiceReading from '@/components/Reading/MultiChoice/MultiChoiceReading';
import { getFullReceptiveTest } from '@/api/tests';
import { transformMultiChoiceTest } from '@/utils/testDataTransform';

function ReadingMultiChoicePageContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(1);
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  useEffect(() => {
    async function fetchTestData() {
      if (!testId) {
        setError('Test ID is required. Please provide testId in URL params.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const backendTest = await getFullReceptiveTest(testId);

        const transformed = transformMultiChoiceTest(backendTest);

        if (!transformed.parts || transformed.parts.length === 0) {
          setError('This test does not contain multiple choice questions.');
          setLoading(false);
          return;
        }

        setTestData(transformed);
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

  const handleSubmit = () => {
    // Test submitted successfully
  };

  const handleBack = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleNext = () => {
    if (testData && currentSection < testData.parts.length) {
      setCurrentSection(currentSection + 1);
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

  const currentPartData = testData.parts[currentSection - 1] || testData.parts[0];

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: '90px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'background.paper',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <Box component="span" sx={{ fontSize: '14px', color: 'text.secondary', fontWeight: '600' }}>
          Mode:
        </Box>
        <Box
          component="button"
          onClick={() => setIsTeacherMode(false)}
          sx={{
            padding: '8px 16px',
            border: '2px solid',
            borderColor: !isTeacherMode ? 'primary.main' : 'reading.borderGrey',
            backgroundColor: !isTeacherMode ? 'primary.main' : 'background.paper',
            color: !isTeacherMode ? 'primary.contrastText' : 'text.secondary',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          Student
        </Box>
        <Box
          component="button"
          onClick={() => setIsTeacherMode(true)}
          sx={{
            padding: '8px 16px',
            border: '2px solid',
            borderColor: isTeacherMode ? 'primary.main' : 'reading.borderGrey',
            backgroundColor: isTeacherMode ? 'primary.main' : 'background.paper',
            color: isTeacherMode ? 'primary.contrastText' : 'text.secondary',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          Teacher
        </Box>
      </Box>

      <MultiChoiceReading
        testName="IELTS Reading Practice Test"
        parts={testData.parts.map((p) => p.title)}
        currentPart={currentSection}
        passage={currentPartData.passage}
        passageTitle={currentPartData.passageTitle}
        questions={currentPartData.questions}
        answers={answers}
        onAnswerChange={handleAnswerChange}
        isTeacher={isTeacherMode}
        onSubmit={handleSubmit}
        onBack={handleBack}
        onNext={handleNext}
        currentSection={currentSection}
        totalSections={testData.parts.length}
      />
    </>
  );
}

export default function ReadingMultiChoicePage() {
  return (
    <Suspense
      fallback={
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
          <Box sx={{ fontSize: '18px', color: 'text.secondary' }}>Loading...</Box>
        </Box>
      }
    >
      <ReadingMultiChoicePageContent />
    </Suspense>
  );
}
