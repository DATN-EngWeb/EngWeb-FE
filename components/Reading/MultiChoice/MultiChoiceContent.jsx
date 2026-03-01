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
  IconButton,
} from '@mui/material';
import Header from '../../Home/Header';
import {
  containerStyles,
  headerWrapperStyles,
  headerSectionStyles,
  testNameStyles,
  partTitleStyles,
  submitButtonStyles,
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
  onAnswerChange = () => {},
  onPartChange = () => {},
  isTeacher = false,
  onSubmit = () => {},
  onBack = () => {},
  onNext = () => {},
  currentSection = 1,
  totalSections = 5,
}) => {
  const [selectedPart, setSelectedPart] = useState(currentPart - 1);
  const [selectedAnswers, setSelectedAnswers] = useState(answers || {});
  const [leftWidth, setLeftWidth] = useState(55); // percentage width for passage
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setSelectedPart(currentPart - 1);
  }, [currentPart]);

  useEffect(() => {
    setSelectedAnswers(answers || {});
  }, [answers]);

  // Disable body scroll when component mounts
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Handle drag to resize left/right panes on desktop
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event) => {
      event.preventDefault();
      // Get the actual container width (contentWrapper)
      const container = document.querySelector('[data-content-wrapper]');
      if (!container) {
        const totalWidth = window.innerWidth || document.body.clientWidth;
        if (!totalWidth) return;
        const newLeftWidth = (event.clientX / totalWidth) * 100;
        const clamped = Math.min(75, Math.max(25, newLeftWidth));
        setLeftWidth(clamped);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerLeft = containerRect.left;
      const containerWidth = containerRect.width;

      if (!containerWidth) return;

      // Calculate relative position within container
      const relativeX = event.clientX - containerLeft;
      const newLeftWidth = (relativeX / containerWidth) * 100;
      const clamped = Math.min(75, Math.max(25, newLeftWidth));
      setLeftWidth(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const handlePartChange = (event, newValue) => {
    setSelectedPart(newValue);
    onPartChange(newValue);
  };

  const handleAnswerChange = (questionId, value) => {
    if (isTeacher) return;

    const newAnswers = {
      ...selectedAnswers,
      [questionId]: value,
    };
    setSelectedAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  const handleSubmit = () => {
    onSubmit(selectedAnswers);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      <Header />
      <Box sx={{ backgroundColor: 'background.paper' }}>
        <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={headerWrapperStyles}>
            {/* Row 2: Timer - Parts tabs - Submit button trên cùng một hàng */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              {/* Timer bên trái */}
              {!isTeacher && (
                <Box sx={{ minWidth: 120, display: 'flex', justifyContent: 'flex-start' }}>
                  <TestTimer />
                </Box>
              )}

              {/* Tabs ở giữa */}
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Tabs
                  value={selectedPart}
                  onChange={handlePartChange}
                  sx={{
                    ...tabsContainerStyles,
                    '& .MuiTabs-flexContainer': {
                      justifyContent: 'center',
                      gap: 3,
                    },
                    '& .MuiTabs-indicator': {
                      display: 'none',
                    },
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

              {/* Submit bên phải */}
              {!isTeacher && (
                <Box sx={{ minWidth: 160, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" sx={submitButtonStyles} onClick={handleSubmit}>
                    Submit Test
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          ...containerStyles,
          flex: 1,
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          pb: 0,
        }}
      >
        <Container maxWidth={false} disableGutters sx={{ height: '100%', px: 0 }}>
          <Box
            data-content-wrapper
            sx={{
              ...contentWrapperStyles,
              height: '100%',
              maxHeight: '100%',
              mb: 0,
              flexDirection: { xs: 'column', md: 'row' },
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'stretch',
              gap: 0,
            }}
          >
            {/* Left pane: passage */}
            <Box
              sx={{
                ...leftPaneStyles,
                flex: '0 0 auto',
                width: { xs: '100%', md: `${leftWidth}%` },
                height: '100%',
                maxHeight: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: 'background.paper',
                borderRadius: 0,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'scroll',
                  overflowX: 'hidden',
                  minHeight: 0,
                  p: 3,
                  // Force scrollbar to always be visible
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#ccc',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#999',
                    },
                  },
                }}
              >
                {passageTitle && <Typography sx={passageTitleStyles}>{passageTitle}</Typography>}
                <Typography sx={passageTextStyles} dangerouslySetInnerHTML={{ __html: passage }} />
              </Box>
            </Box>

            {/* Draggable divider (desktop only) */}
            <Box
              onMouseDown={() => setIsDragging(true)}
              sx={{
                position: 'relative',
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                cursor: 'col-resize',
                flexShrink: 0,
              }}
              role="separator"
            >
              {/* Vertical line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '50%',
                  width: 2,
                  transform: 'translateX(-50%)',
                  backgroundColor: isDragging ? 'warning.main' : 'divider',
                }}
              />
              {/* Handle circle with arrows icon */}
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '1px solid',
                  borderColor: isDragging ? 'warning.main' : 'divider',
                  backgroundColor: 'background.paper',
                  boxShadow: '0 0 4px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  color: 'text.secondary',
                  userSelect: 'none',
                }}
              >
                ⇔
              </Box>
            </Box>

            {/* Right pane: questions */}
            <Box
              sx={{
                ...rightPaneStyles,
                flex: '0 0 auto',
                width: { xs: '100%', md: `calc(${100 - leftWidth}% - 32px)` },
                height: '100%',
                maxHeight: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'scroll',
                  overflowX: 'hidden',
                  minHeight: 0,
                  // Force scrollbar to always be visible
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#ccc',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#999',
                    },
                  },
                }}
              >
                {/* Instruction Section */}
                <Box sx={{ p: 3, pb: 0 }}>
                  <Paper sx={instructionBoxStyles}>
                    <Box sx={instructionIconStyles}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                          fill="currentColor"
                        />
                      </svg>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: 'secondary.main',
                          mb: 0.5,
                        }}
                      >
                        Instruction
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.9rem',
                          color: 'text.primary',
                        }}
                      >
                        Read the text and choose the best answer for each question.
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                {/* Questions Section */}
                <Box sx={{ p: 3, pt: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {questions.map((question, index) => (
                      <Box key={question.id || index} sx={questionContainerStyles}>
                        <Box sx={questionNumberStyles}>{index + 1}</Box>
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}
                        >
                          <Typography
                            sx={questionTextStyles}
                            dangerouslySetInnerHTML={{ __html: question.question }}
                          />
                          <RadioGroup
                            value={selectedAnswers[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            sx={{ mt: 2 }}
                          >
                            {question.options?.map((option, optIndex) => (
                              <FormControlLabel
                                key={optIndex}
                                value={option.value}
                                control={
                                  <Radio
                                    sx={{
                                      color: 'text.primary',
                                      '&.Mui-checked': {
                                        color: 'secondary.main',
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Typography sx={optionLabelStyles}>{option.label}</Typography>
                                }
                                sx={optionContainerStyles}
                                disabled={isTeacher}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={navigationFooterStyles}>
                    <Button onClick={onBack} sx={backLinkStyles} disabled={isTeacher}>
                      &lt; Back
                    </Button>
                    <Typography sx={sectionInfoStyles}>
                      Section {currentSection} of {totalSections}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        ...nextButtonStyles,
                        backgroundColor: 'primary.main',
                        visibility: currentSection < totalSections ? 'visible' : 'hidden',
                        pointerEvents: currentSection < totalSections ? 'auto' : 'none',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                      onClick={onNext}
                      disabled={isTeacher}
                    >
                      Next Part
                    </Button>
                  </Box>
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
