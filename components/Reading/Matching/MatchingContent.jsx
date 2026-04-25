'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Tooltip,
} from '@mui/material';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import Header from '../../Home/Header';
import TestHeading from '../../Student/Common/TestHeading';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
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
  navigationFooterStyles,
  backLinkStyles,
  sectionInfoStyles,
  nextButtonStyles,
} from '@/styles/Reading/MatchingStyles';
import TestTimer from '../Common/TestTimer';

const MatchingContent = ({
  testName = 'Practice Test Name',
  parts = ['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5'],
  currentPart = 3,
  passage = '',
  passageTitle = '',
  sentences = [],
  gaps = [],
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
  const [leftWidth, setLeftWidth] = useState(55); // percentage width for passage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);
  const [passageContent, setPassageContent] = useState(passage);
  const [processedSentences, setProcessedSentences] = useState(sentences);

  useEffect(() => {
    setPassageContent(passage);
    const fetchContent = async () => {
      if (
        passage &&
        typeof passage === 'string' &&
        passage.startsWith('http') &&
        passage.includes('storage.googleapis.com')
      ) {
        try {
          const response = await fetch(passage);
          const text = await response.text();
          setPassageContent(text);
        } catch (error) {
          console.error('Failed to fetch passage content:', error); // eslint-disable-line no-console
        }
      }
    };
    fetchContent();
  }, [passage]);

  useEffect(() => {
    setProcessedSentences(sentences);
    const fetchSentences = async () => {
      const newSentences = await Promise.all(
        sentences.map(async (s) => {
          if (
            s.text &&
            typeof s.text === 'string' &&
            s.text.startsWith('http') &&
            s.text.includes('storage.googleapis.com')
          ) {
            try {
              const response = await fetch(s.text);
              const text = await response.text();
              return { ...s, text };
            } catch (error) {
              console.error('Failed to fetch sentence content:', error); // eslint-disable-line no-console
              return s;
            }
          }
          return s;
        }),
      );
      setProcessedSentences(newSentences);
    };
    fetchSentences();
  }, [sentences]);

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
      const clientX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
      // Get the actual container width (contentWrapper)
      const container = containerRef.current;
      if (!container) {
        const totalWidth = window.innerWidth || document.body.clientWidth;
        if (!totalWidth) return;
        const newLeftWidth = (clientX / totalWidth) * 100;
        const clamped = Math.min(75, Math.max(25, newLeftWidth));
        setLeftWidth(clamped);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerLeft = containerRect.left;
      const containerWidth = containerRect.width;

      if (!containerWidth) return;

      // Calculate relative position within container
      const relativeX = clientX - containerLeft;
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
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const handlePartChange = (event, newValue) => {
    setSelectedPart(newValue);
    onPartChange(newValue);
  };

  const handleAnswerChange = (gapNumber, value) => {
    if (isTeacher) return;

    const question = questions.find((q) => q.question_number === gapNumber);
    if (!question) return;

    const newAnswers = {
      ...selectedAnswers,
      [question.id]: value,
    };
    setSelectedAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  const handleSubmit = () => {
    onSubmit(selectedAnswers);
  };

  const renderPassageWithGaps = () => {
    if (!passageContent) return null;

    const processedPassage = passageContent.replace(/\[(\d+)\]/g, (match, number) => {
      return `<span style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; margin: 0 4px; vertical-align: middle; background-color: #FFF3E0; color: #E65100; border: 1px solid #FFB74D; border-radius: 6px; font-weight: 700; font-size: 0.9rem; cursor: default; user-select: none;">${number}</span>`;
    });

    return <div dangerouslySetInnerHTML={{ __html: processedPassage }} />;
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
      {!embedded && (
        <TestHeading
          testName={testName}
          onSubmit={showResults ? null : handleSubmit}
          isTeacher={isTeacher || showResults}
          timerNode={timerNode || (!isTeacher && !showResults ? <TestTimer /> : null)}
          onAIReview={onAIReview}
          onExit={onExit}
        />
      )}
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
            ref={containerRef}
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
                {/* Đã chuyển phần mô tả/tiêu đề sang Instruction bên phải */}
                <Box sx={{ ...passageTextStyles, component: 'div' }}>{renderPassageWithGaps()}</Box>
              </Box>
            </Box>

            {/* Draggable divider */}
            <Box
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              onDragStart={(e) => e.preventDefault()}
              sx={{
                position: 'relative',
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                cursor: 'col-resize',
                flexShrink: 0,
                zIndex: 10,
                userSelect: 'none',
                touchAction: 'none',
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
                <Box sx={{ px: 1.5, py: 3 }}>
                  <Paper sx={instructionBoxStyles}>
                    <ErrorRoundedIcon
                      sx={{ color: 'reading.instructionIcon', fontSize: '1.5rem' }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: 'reading.instructionIcon',
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
                        Read the passage on the left and match the correct sentences or headings to
                        each person or category.
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                {/* Content Section */}
                <Box sx={{ px: 1.5, py: 3, pt: 0 }}>
                  <Paper
                    sx={{
                      p: 2.5,
                      backgroundColor: 'background.paper',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                      mb: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: 'text.primary',
                        mb: 2,
                      }}
                    >
                      Match Question
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {processedSentences.map((sentence, index) => (
                        <Box
                          key={`${sentence.id}-${index}`}
                          sx={{
                            display: 'flex',
                            gap: 1,
                            p: 1.5,
                            backgroundColor: 'background.paper',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: 'darkGrey.main',
                              minWidth: '24px',
                            }}
                          >
                            {index + 1}.
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.95rem',
                              color: 'text.primary',
                              lineHeight: 1.6,
                            }}
                            dangerouslySetInnerHTML={{ __html: sentence.text }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      p: 2.5,
                      backgroundColor: 'background.paper',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 3,
                        width: '100%',
                      }}
                    >
                      {gaps.map((gapNumber) => (
                        <Box
                          key={gapNumber}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            minWidth: 0, // Prevent grid items from overflowing
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: 'primary.main',
                                color: 'background.paper',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '1rem',
                                flexShrink: 0,
                              }}
                            >
                              {gapNumber}
                            </Box>
                            <FormControl fullWidth size="small">
                              <Select
                                value={(() => {
                                  const q = questions.find(
                                    (qu) => qu.question_number === gapNumber,
                                  );
                                  return selectedAnswers[q?.id] || '';
                                })()}
                                onChange={(e) => handleAnswerChange(gapNumber, e.target.value)}
                                displayEmpty
                                disabled={isTeacher || showResults}
                                sx={{
                                  backgroundColor: 'background.paper',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: showResults
                                      ? (() => {
                                          const q = questions.find(
                                            (qu) => qu.question_number === gapNumber,
                                          );
                                          const val = selectedAnswers[q?.id];
                                          return val === q?.correctLabel
                                            ? 'success.main'
                                            : 'error.main';
                                        })()
                                      : 'divider',
                                    borderWidth: showResults ? 2 : 1,
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: showResults ? 'inherit' : 'secondary.main',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: showResults ? 'inherit' : 'secondary.main',
                                  },
                                }}
                              >
                                <MenuItem value="" disabled>
                                  Select
                                </MenuItem>
                                {processedSentences
                                  .map((_, idx) => String.fromCharCode(65 + idx))
                                  .map((label) => (
                                    <MenuItem key={label} value={label}>
                                      {label}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </Box>

                          {showResults && (
                            <Box sx={{ pl: { xs: 0, sm: 6 }, mt: 0.5, minWidth: 0 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  flexWrap: 'wrap',
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 700,
                                    color: 'text.secondary',
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Correct Answer:
                                </Typography>
                                <Box
                                  sx={{
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: '4px',
                                    bgcolor: 'success.main',
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    display: 'inline-flex',
                                  }}
                                >
                                  {(() => {
                                    const q = questions.find(
                                      (qu) => qu.question_number === gapNumber,
                                    );
                                    return q?.correctLabel || 'N/A';
                                  })()}
                                </Box>
                              </Box>

                              {(() => {
                                const q = questions.find((qu) => qu.question_number === gapNumber);
                                if (q?.explanation) {
                                  return (
                                    <Box
                                      sx={{
                                        p: 1.5,
                                        bgcolor: '#fff7ed',
                                        borderRadius: '8px',
                                        border: '1px solid #ffedd5',
                                        boxSizing: 'border-box',
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: '#ea580c',
                                          fontWeight: 800,
                                          display: 'block',
                                          mb: 0.5,
                                          fontSize: '0.7rem',
                                        }}
                                      >
                                        EXPLANATION
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: '#9a3412',
                                          fontSize: '0.75rem',
                                          lineHeight: 1.4,
                                          display: 'block',
                                          wordBreak: 'break-word',
                                        }}
                                      >
                                        {q.explanation}
                                      </Typography>
                                    </Box>
                                  );
                                }
                                return null;
                              })()}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Paper>

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
                        visibility: currentSection < totalSections ? 'visible' : 'hidden',
                        pointerEvents: currentSection < totalSections ? 'auto' : 'none',
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

export default MatchingContent;
