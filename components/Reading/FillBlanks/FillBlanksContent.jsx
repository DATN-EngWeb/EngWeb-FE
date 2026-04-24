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
  const containerRef = React.useRef(null);
  const [passageContent, setPassageContent] = useState(passage);

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
      const clientX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
      const container = containerRef.current;
      if (!container) {
        const totalWidth = window.innerWidth || document.body.clientWidth;
        if (!totalWidth) return;
        const newLeftWidth = (clientX / totalWidth) * 100;
        setLeftWidth(Math.min(75, Math.max(25, newLeftWidth)));
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const relativeX = clientX - containerRect.left;
      const newLeftWidth = (relativeX / containerRect.width) * 100;
      setLeftWidth(Math.min(75, Math.max(25, newLeftWidth)));
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      if (isDragging) {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
  }, [isDragging]);

  const handlePartChange = (event, newValue) => {
    setSelectedPart(newValue);
    onPartChange(newValue);
  };

  const handleAnswerChange = (blankNumber, value) => {
    if (isTeacher || showResults) return;
    const newAnswers = { ...selectedAnswers, [blankNumber]: value };
    setSelectedAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  const renderPassageWithBlanks = () => {
    if (!passageContent) return null;
    const processPassage = passageContent
      .replace(/\((\d+)\)/g, (match, number) => {
        return `<span style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; margin: 0 4px; vertical-align: middle; background-color: #FFF3E0; color: #E65100; border: 1px solid #FFB74D; border-radius: 6px; font-weight: 700; font-size: 0.9rem; cursor: default; user-select: none;">${number}</span>`;
      })
      .replace(/_+/g, () => {
        return `<span style="display: inline-flex; width: 120px; height: 28px; margin: 0 4px; vertical-align: middle; border: 1px solid #B0BEC5; border-radius: 14px; background-color: transparent;"></span>`;
      });
    return <div dangerouslySetInnerHTML={{ __html: processPassage }} />;
  };

  const isMultiChoiceFormat =
    questions && questions.length > 0 && questions.some((q) => q.options && q.options.length > 1);

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
          onSubmit={showResults ? null : () => onSubmit(selectedAnswers)}
          isTeacher={isTeacher || showResults}
          timerNode={timerNode || (!isTeacher && !showResults ? <TestTimer /> : null)}
          onAIReview={onAIReview}
          onExit={onExit}
        />
      )}

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
                {parts.map((p, i) => (
                  <Tab
                    key={i}
                    label={p}
                    sx={{
                      ...tabStyles,
                      color:
                        selectedPart === i ? 'reading.tabActiveText' : 'reading.tabInactiveText',
                      fontWeight: selectedPart === i ? 600 : 500,
                      backgroundColor:
                        selectedPart === i ? 'reading.tabActiveBg' : 'reading.tabInactiveBg',
                      borderColor:
                        selectedPart === i ? 'reading.tabActiveBg' : 'reading.borderLight',
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
            ref={containerRef}
            data-content-wrapper
            sx={{
              ...contentWrapperStyles,
              height: '100%',
              flexDirection: { xs: 'column', md: 'row' },
              display: 'flex',
              alignItems: 'stretch',
              gap: 0,
            }}
          >
            <Box
              sx={{
                ...leftPaneStyles,
                flex: '0 0 auto',
                width: { xs: '100%', md: `${leftWidth}%` },
                height: '100%',
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                p: 0,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'scroll',
                  overflowX: 'hidden',
                  p: 3,
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

            <Box
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              onDragStart={(e) => e.preventDefault()}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                cursor: 'col-resize',
                flexShrink: 0,
                zIndex: 10,
                position: 'relative',
                userSelect: 'none',
                touchAction: 'none',
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
                flex: '0 0 auto',
                width: { xs: '100%', md: `calc(${100 - leftWidth}% - 32px)` },
                height: '100%',
                maxHeight: '100%',
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
                  px: 1.5,
                  py: 3,
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
                <Paper sx={instructionBoxStyles}>
                  <ErrorRoundedIcon sx={{ color: 'reading.instructionIcon', fontSize: '1.5rem' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: 'reading.instructionIcon' }}>
                      Instruction
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'text.primary' }}>
                      Read the passage on the left and fill in the blanks with the correct words.
                    </Typography>
                  </Box>
                </Paper>

                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      ...answerInputContainerStyles,
                      gridTemplateColumns: isMultiChoiceFormat ? '1fr' : 'repeat(2, 1fr)',
                      gap: 3,
                    }}
                  >
                    {isMultiChoiceFormat
                      ? questions.map((q, idx) => {
                          const selectedVal = selectedAnswers[q.id] || '';
                          const qInfo = questions.find((qu) => qu.id === q.id);
                          return (
                            <Box
                              key={q.id}
                              sx={{
                                ...questionContainerStyles,
                                border: showResults ? '1px solid' : 'none',
                                borderColor: showResults
                                  ? qInfo?.options?.find((o) => o.value === selectedVal)?.isCorrect
                                    ? 'success.light'
                                    : 'error.light'
                                  : 'transparent',
                                p: 2,
                                borderRadius: 2,
                              }}
                            >
                              <Box sx={questionNumberStyles}>{q.question_number || idx + 1}</Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  sx={questionTextStyles}
                                  dangerouslySetInnerHTML={{
                                    __html: q.question || `Question ${q.question_number}`,
                                  }}
                                />
                                <RadioGroup
                                  value={selectedVal}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  sx={{ mt: 1 }}
                                >
                                  {q.options?.map((opt, oIdx) => {
                                    const isSelected = selectedVal === opt.value;
                                    const isCorrect = opt.isCorrect;
                                    let bgColor = 'transparent',
                                      borderColor = 'divider';
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
                                        key={oIdx}
                                        sx={{
                                          ...optionContainerStyles,
                                          bgcolor: bgColor,
                                          border: '1px solid',
                                          borderColor,
                                          mb: 1,
                                          px: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                        }}
                                      >
                                        <FormControlLabel
                                          value={opt.value}
                                          control={<Radio disabled={isTeacher || showResults} />}
                                          label={
                                            <Typography sx={optionLabelStyles}>
                                              {opt.label}
                                            </Typography>
                                          }
                                          sx={{ flex: 1, m: 0 }}
                                        />
                                        {showResults && isCorrect && (
                                          <Typography
                                            variant="caption"
                                            sx={{ color: 'success.main', fontWeight: 700 }}
                                          >
                                            Correct
                                          </Typography>
                                        )}
                                      </Box>
                                    );
                                  })}
                                </RadioGroup>
                                {showResults && q.explanation && (
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
                                      {q.explanation}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          );
                        })
                      : blanks.map((num) => {
                          const qInfo = questions.find((qu) => qu.question_number === num);
                          const questionId = qInfo?.id || num;
                          const userAns = selectedAnswers[questionId] || '';
                          const isCorrect =
                            userAns.toLowerCase().trim() ===
                            (qInfo?.correctText || '').toLowerCase().trim();

                          return (
                            <Box
                              key={questionId}
                              sx={{
                                ...answerInputBoxStyles,
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                height: 'auto',
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  width: '100%',
                                }}
                              >
                                <Box sx={answerNumberStyles}>{num}</Box>
                                <TextField
                                  fullWidth
                                  value={userAns}
                                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                                  disabled={isTeacher || showResults}
                                  sx={{
                                    ...answerInputStyles,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: showResults
                                        ? isCorrect
                                          ? 'success.main'
                                          : 'error.main'
                                        : 'divider',
                                      borderWidth: showResults ? 2 : 1,
                                    },
                                  }}
                                  variant="outlined"
                                  autoComplete="off"
                                />
                              </Box>
                              {showResults && (
                                <Box sx={{ width: '100%', pl: 5 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'success.main',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    Correct Answer: {qInfo?.correctText}
                                  </Typography>
                                  {qInfo?.explanation && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        p: 1.5,
                                        bgcolor: '#fff7ed',
                                        borderRadius: '8px',
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
                                        variant="caption"
                                        sx={{ color: '#9a3412', lineHeight: 1.4 }}
                                      >
                                        {qInfo.explanation}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                  </Box>
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

export default FillBlanksContent;
