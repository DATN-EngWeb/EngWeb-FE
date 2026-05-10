'use client';

import React from 'react';
import { Alert } from '@mui/material';
import MultiChoiceReading from '@/components/Reading/MultiChoice/MultiChoiceReading';
import FillBlanksReading from '@/components/Reading/FillBlanks/FillBlanksReading';
import MatchingReading from '@/components/Reading/Matching/MatchingReading';
import TestTimer from '@/components/Reading/Common/TestTimer';

const ReceptiveReviewView = ({
  testData,
  currentPartIndex,
  setCurrentPartIndex,
  userAnswers,
  history,
  onExit,
}) => {
  const currentPart = testData?.transformedParts?.[currentPartIndex];

  if (!currentPart || !currentPart.data) {
    return (
      <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        This part format is not yet supported.
      </Alert>
    );
  }

  const commonProps = {
    testName: testData.title,
    parts: testData.transformedParts.map((p, idx) => `Part ${idx + 1}`),
    currentPart: currentPartIndex + 1,
    answers: userAnswers,
    showResults: true,
    onPartChange: (idx) => setCurrentPartIndex(idx),
    onBack: () => currentPartIndex > 0 && setCurrentPartIndex(currentPartIndex - 1),
    onNext: () =>
      currentPartIndex < testData.transformedParts.length - 1 &&
      setCurrentPartIndex(currentPartIndex + 1),
    totalSections: testData.transformedParts.length,
    currentSection: currentPartIndex + 1,
    timerNode: <TestTimer isActive={false} initialSeconds={history?.total_time || 0} />,
    onExit: onExit,
    embedded: true,
  };

  switch (currentPart.componentType) {
    case 'multi-choice':
      return (
        <MultiChoiceReading
          {...commonProps}
          passage={currentPart.data.passage}
          passageTitle={currentPart.data.passageTitle}
          questions={currentPart.data.questions}
          stimulusPageUrls={currentPart.data.stimulusPageUrls}
          hidePassage={currentPart.format === 'F' && !String(currentPart.data.passage || '').trim()}
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
          questions={currentPart.data.questions}
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

export default ReceptiveReviewView;
