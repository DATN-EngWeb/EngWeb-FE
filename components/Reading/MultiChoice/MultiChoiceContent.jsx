'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import Header from '../../Home/Header';
import TestHeading from '../../Student/Common/TestHeading';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import {
  containerStyles,
  headerWrapperStyles,
  tabsContainerStyles,
  tabStyles,
  contentWrapperStyles,
  leftPaneStyles,
  passageTitleStyles,
  passageTextStyles,
  rightPaneStyles,
  instructionBoxStyles,
  instructionIconStyles,
  questionContainerStyles,
  questionNumberStyles,
  questionTextStyles,
  optionContainerStyles,
  optionLabelStyles,
  navigationFooterStyles,
  backLinkStyles,
  sectionInfoStyles,
  nextButtonStyles,
} from '@/styles/Reading/MultiChoiceReadingStyles';
import TestTimer from '../Common/TestTimer';

const MultiChoiceContent = ({
  testName = 'Practice Test Name',
  parts = ['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5'],
  currentPart = 1,
  passage = '',
  passageTitle = '',
  questions = [],
  answers,
  showResults = false,
  onAnswerChange = () => {},
  onPartChange = () => {},
  isTeacher = false,
  onSubmit = () => {},
  onBack = () => {},
  onNext = () => {},
  currentSection = 1,
  totalSections = 5,
  embedded = false,
  timerNode,
  onAIReview,
  onExit,
}) => {
  const [selectedPart, setSelectedPart] = useState(currentPart - 1);
  const [selectedAnswers, setSelectedAnswers] = useState(answers || {});
  const [leftWidth, setLeftWidth] = useState(55);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setSelectedPart(currentPart - 1);
  }, [currentPart]);

  useEffect(() => {
    setSelectedAnswers(answers || {});
  }, [answers]);

  useEffect(() => {
    if (embedded) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [embedded]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (event) => {
      event.preventDefault();
      const container = document.querySelector('[data-content-wrapper]');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const relativeX = event.clientX - containerRect.left;
      const newLeftWidth = (relativeX / containerRect.width) * 100;
      setLeftWidth(Math.min(75, Math.max(25, newLeftWidth)));
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handlePartChange = (event, newValue) => {
    setSelectedPart(newValue);
    onPartChange(newValue);
  };

  const handleAnswerChange = (questionId, value) => {
    if (isTeacher || showResults) return;
    const newAnswers = { ...selectedAnswers, [questionId]: value };
    setSelectedAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  return (
    <Box
      sx={{
        ...(embedded
          ? { position: 'relative', width: '100%', minHeight: '100%' }
          : {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: '100vh',
              width: '100vw',
              overflow: 'hidden',
            }),
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      {!embedded && <Header />}
      <TestHeading
        testName={testName}
        onSubmit={showResults ? null : () => onSubmit(selectedAnswers)}
        isTeacher={isTeacher || showResults}
        timerNode={timerNode || (!isTeacher && !showResults ? <TestTimer /> : null)}
        onAIReview={onAIReview}
        onExit={onExit}
      />

      <Box sx={{ backgroundColor: 'background.paper' }}>
        <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={headerWrapperStyles}>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Tabs
                value={selectedPart}
                onChange={handlePartChange}
                sx={{
                  ...tabsContainerStyles,
                  '& .MuiTabs-flexContainer': { gap: 1.5 },
                  '& .MuiTabs-indicator': { display: 'none' },
                }}
              >
                {parts.map((part, index) => (
                  <Tab
                    key={index}
                    label={part}
                    sx={{
                      ...tabStyles,
                      color:
                        selectedPart === index
                          ? 'reading.tabActiveText'
                          : 'reading.tabInactiveText',
                      fontWeight: selectedPart === index ? 600 : 500,
                      backgroundColor:
                        selectedPart === index ? 'reading.tabActiveBg' : 'reading.tabInactiveBg',
                      borderColor:
                        selectedPart === index ? 'reading.tabActiveBg' : 'reading.borderLight',
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ ...containerStyles, flex: 1, overflow: 'hidden' }}>
        <Container maxWidth={false} disableGutters sx={{ height: '100%', px: 0 }}>
          <Box
            data-content-wrapper
            sx={{
              ...contentWrapperStyles,
              height: '100%',
              flexDirection: { xs: 'column', md: 'row' },
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
            <Box
              sx={{
                ...leftPaneStyles,
                width: { xs: '100%', md: `${leftWidth}%` },
                overflowY: 'auto',
                p: 3,
                backgroundColor: 'background.paper',
              }}
            >
              {passageTitle && <Typography sx={passageTitleStyles}>{passageTitle}</Typography>}
              <Typography sx={passageTextStyles} dangerouslySetInnerHTML={{ __html: passage }} />
            </Box>

            <Box
              onMouseDown={() => setIsDragging(true)}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                cursor: 'col-resize',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{ width: 2, height: '100%', bgcolor: isDragging ? 'warning.main' : 'divider' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '1px solid',
                  borderColor: isDragging ? 'warning.main' : 'divider',
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                ⇔
              </Box>
            </Box>

            <Box
              sx={{
                ...rightPaneStyles,
                width: { xs: '100%', md: `calc(${100 - leftWidth}% - 32px)` },
                overflowY: 'auto',
              }}
            >
              <Box sx={{ p: 3 }}>
                <Paper sx={instructionBoxStyles}>
                  <Box sx={instructionIconStyles}>ℹ️</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: 'secondary.main' }}>
                      Instruction
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem' }}>
                      Choose the best answer for each question.
                    </Typography>
                  </Box>
                </Paper>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                  {questions.map((question, index) => {
                    const selectedValue = selectedAnswers[question.id] || '';
                    return (
                      <Box
                        key={question.id || index}
                        sx={{
                          ...questionContainerStyles,
                          border: showResults ? '1px solid' : 'none',
                          borderColor: showResults
                            ? question.options.find((o) => o.value === selectedValue)?.isCorrect
                              ? 'success.light'
                              : 'error.light'
                            : 'transparent',
                          p: showResults ? 2 : 0,
                          borderRadius: 2,
                        }}
                      >
                        <Box sx={questionNumberStyles}>{index + 1}</Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={questionTextStyles}
                            dangerouslySetInnerHTML={{ __html: question.question }}
                          />
                          <RadioGroup
                            value={selectedValue}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            sx={{ mt: 1 }}
                          >
                            {question.options?.map((option, optIndex) => {
                              const isSelected = selectedValue === option.value;
                              const isCorrect = option.isCorrect;

                              let bgColor = 'transparent';
                              let borderColor = 'divider';
                              if (showResults) {
                                if (isSelected && isCorrect)
                                  ((bgColor = '#f0fdf4'), (borderColor = '#16a34a'));
                                else if (isSelected && !isCorrect)
                                  ((bgColor = '#fef2f2'), (borderColor = '#dc2626'));
                                else if (isCorrect)
                                  ((bgColor = '#f0fdf4'), (borderColor = '#16a34a'));
                              }

                              return (
                                <Box
                                  key={optIndex}
                                  sx={{
                                    ...optionContainerStyles,
                                    bgcolor: bgColor,
                                    border: '1px solid',
                                    borderColor: borderColor,
                                    mb: 1,
                                    borderRadius: 1,
                                    px: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <FormControlLabel
                                    value={option.value}
                                    control={<Radio disabled={isTeacher || showResults} />}
                                    label={
                                      <Typography sx={optionLabelStyles}>{option.label}</Typography>
                                    }
                                    sx={{ flex: 1, m: 0 }}
                                  />
                                  {showResults && isCorrect && (
                                    <Chip
                                      label="Correct"
                                      size="small"
                                      color="success"
                                      sx={{ height: 20, fontSize: '0.65rem' }}
                                    />
                                  )}
                                </Box>
                              );
                            })}
                          </RadioGroup>

                          {showResults && question.explanation && (
                            <Box
                              sx={{
                                mt: 1.5,
                                p: 2,
                                bgcolor: '#fff7ed',
                                borderRadius: '12px',
                                border: '1px solid #ffedd5',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 800,
                                  color: '#ea580c',
                                  display: 'block',
                                  mb: 0.5,
                                }}
                              >
                                EXPLANATION
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: '#9a3412', lineHeight: 1.6, fontWeight: 500 }}
                              >
                                {question.explanation}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                <Box sx={{ ...navigationFooterStyles, mt: 4 }}>
                  <Button onClick={onBack} sx={backLinkStyles} disabled={currentSection === 1}>
                    &lt; Back
                  </Button>
                  <Typography sx={sectionInfoStyles}>
                    Section {currentSection} of {totalSections}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={nextButtonStyles}
                    onClick={onNext}
                    disabled={currentSection === totalSections}
                  >
                    Next Part
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MultiChoiceContent;
