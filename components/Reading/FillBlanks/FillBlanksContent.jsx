'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from '@mui/material';
import Header from '../../Home/Header';
import TestHeading from '../../Student/Common/TestHeading';
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
  passageContainerStyles,
  rightPaneStyles,
  instructionBoxStyles,
  instructionIconStyles,
  answerInputContainerStyles,
  answerInputBoxStyles,
  answerNumberStyles,
  answerInputStyles,
  navigationFooterStyles,
  backLinkStyles,
  sectionInfoStyles,
  nextButtonStyles,
} from '@/styles/Reading/FillBlanksStyles';

import {
  questionContainerStyles,
  questionNumberStyles,
  questionTextStyles,
  optionContainerStyles,
  optionLabelStyles,
} from '@/styles/Reading/MultiChoiceReadingStyles';
import TestTimer from '../Common/TestTimer';

const FillBlanksContent = ({
  testName = 'Practice Test Name',
  parts = ['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5'],
  currentPart = 2,
  passage = '',
  passageTitle = '',
  blanks = [],
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
  embedded = false,
  onAIReview,
  onExit,
}) => {
  const [selectedPart, setSelectedPart] = useState(currentPart - 1);
  const [selectedAnswers, setSelectedAnswers] = useState(answers || {});
  const [leftWidth, setLeftWidth] = useState(55); // percentage width for passage
  const [isDragging, setIsDragging] = useState(false);

  // Sync internal state with props when currentPart changes
  useEffect(() => {
    setSelectedPart(currentPart - 1);
  }, [currentPart]);

  useEffect(() => {
    setSelectedAnswers(answers || {});
  }, [answers]);

  // Disable body scroll when component mounts
  useEffect(() => {
    if (embedded) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [embedded]);

  // Handle drag to resize panes on desktop
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

  const handleAnswerChange = (blankNumber, value) => {
    if (isTeacher) return;

    const newAnswers = {
      ...selectedAnswers,
      [blankNumber]: value,
    };
    setSelectedAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  const handleSubmit = () => {
    onSubmit(selectedAnswers);
  };

  const renderPassageWithBlanks = () => {
    if (!passage) return null;

    const processPassage = passage
      .replace(/\((\d+)\)/g, (match, number) => {
        return `<span style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; margin: 0 4px; vertical-align: middle; background-color: #FFF3E0; color: #E65100; border: 1px solid #FFB74D; border-radius: 6px; font-weight: 700; font-size: 0.9rem; cursor: default; user-select: none;">${number}</span>`;
      })
      .replace(/_+/g, () => {
        return `<span style="display: inline-flex; width: 120px; height: 28px; margin: 0 4px; vertical-align: middle; border: 1px solid #B0BEC5; border-radius: 14px; background-color: transparent;"></span>`;
      });

    return <div dangerouslySetInnerHTML={{ __html: processPassage }} />;
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
        onSubmit={handleSubmit}
        isTeacher={isTeacher}
        timerNode={!isTeacher ? <TestTimer /> : null}
        onAIReview={onAIReview}
        onExit={onExit}
      />
      <Box sx={{ backgroundColor: 'background.paper' }}>
        <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={headerWrapperStyles}>
            {/* Row 2: Timer - Parts tabs - Submit button */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              {/* Tabs ở giữa */}
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Tabs
                  value={selectedPart}
                  onChange={handlePartChange}
                  sx={{
                    ...tabsContainerStyles,
                    '& .MuiTabs-flexContainer': {
                      justifyContent: 'center',
                      gap: 1.5,
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
                <Box sx={passageContainerStyles}>{renderPassageWithBlanks()}</Box>
              </Box>
            </Box>

            {/* Draggable divider */}
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
              {/* Handle circle */}
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
                        Look at the passage on the left and write the missing word for each number.
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                {/* Answers Section */}
                <Box sx={{ p: 3, pt: 3 }}>
                  <Box
                    sx={{
                      ...answerInputContainerStyles,
                      gridTemplateColumns:
                        questions &&
                        questions.length > 0 &&
                        questions.some((q) => q.options && q.options.length > 0)
                          ? '1fr'
                          : 'repeat(2, 1fr)',
                    }}
                  >
                    {questions &&
                    questions.length > 0 &&
                    questions.some((q) => q.options && q.options.length > 0)
                      ? questions.map((question) => {
                          const options = question.options || [];

                          return (
                            <Box key={question.id} sx={questionContainerStyles}>
                              <Box sx={questionNumberStyles}>{question.id}</Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  sx={questionTextStyles}
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      question.question || `Question ${question.question_number}`,
                                  }}
                                />
                                <FormControl component="fieldset" fullWidth>
                                  <RadioGroup
                                    value={selectedAnswers[question.id] || ''}
                                    onChange={(e) =>
                                      handleAnswerChange(question.id, e.target.value)
                                    }
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 1,
                                      width: '100%',
                                    }}
                                  >
                                    {options.map((option, index) => (
                                      <FormControlLabel
                                        key={index}
                                        value={option.value ?? ''}
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
                                          <Typography sx={optionLabelStyles}>
                                            {option.label}
                                          </Typography>
                                        }
                                        sx={{
                                          ...optionContainerStyles,
                                          width: '100%',
                                          margin: 0,
                                          mb: 1,
                                        }}
                                      />
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              </Box>
                            </Box>
                          );
                        })
                      : blanks.map((blankNumber) => (
                          <Box key={blankNumber} sx={answerInputBoxStyles}>
                            <Box sx={answerNumberStyles}>{blankNumber}</Box>
                            <TextField
                              fullWidth
                              placeholder="Type answer ..."
                              value={selectedAnswers[blankNumber] || ''}
                              onChange={(e) => handleAnswerChange(blankNumber, e.target.value)}
                              disabled={isTeacher}
                              sx={answerInputStyles}
                              variant="outlined"
                              autoComplete="off"
                            />
                          </Box>
                        ))}
                  </Box>

                  <Box
                    sx={{
                      ...navigationFooterStyles,
                      display: isTeacher ? 'none' : 'flex',
                    }}
                  >
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

export default FillBlanksContent;
