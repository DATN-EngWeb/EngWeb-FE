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
} from '@mui/material';
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

const MatchingContent = ({
  testName = 'Practice Test Name',
  parts = ['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5'],
  currentPart = 3,
  passage = '',
  passageTitle = '',
  sentences = [],
  gaps = [],
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

  useEffect(() => {
    setSelectedPart(currentPart - 1);
  }, [currentPart]);

  useEffect(() => {
    setSelectedAnswers(answers || {});
  }, [answers]);

  const handlePartChange = (event, newValue) => {
    setSelectedPart(newValue);
    onPartChange(newValue);
  };

  const handleAnswerChange = (gapNumber, value) => {
    if (isTeacher) return;

    const newAnswers = {
      ...selectedAnswers,
      [gapNumber]: value,
    };
    setSelectedAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  const handleSubmit = () => {
    onSubmit(selectedAnswers);
  };

  const renderPassageWithGaps = () => {
    if (!passage) return null;

    const processedPassage = passage.replace(/\[(\d+)\]/g, (match, number) => {
      return `<span style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; margin: 0 4px; vertical-align: middle; background-color: #E3F2FD; color: #1565C0; border: 1px solid #90CAF9; border-radius: 6px; font-weight: 700; font-size: 0.9rem; cursor: default; user-select: none;">${number}</span>`;
    });

    return <div dangerouslySetInnerHTML={{ __html: processedPassage }} />;
  };

  return (
    <>
      <Box sx={{ backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={headerWrapperStyles}>
            <Box sx={headerSectionStyles}>
              <Box>
                <Typography sx={testNameStyles}>{testName}</Typography>
                <Typography sx={partTitleStyles}>
                  {parts[selectedPart]}: Matching Sentences
                </Typography>
              </Box>
              {!isTeacher && (
                <Button variant="contained" sx={submitButtonStyles} onClick={handleSubmit}>
                  Submit Test
                </Button>
              )}
            </Box>

            <Box sx={tabsContainerStyles}>
              <Tabs
                value={selectedPart}
                onChange={handlePartChange}
                sx={{
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
          </Box>
        </Container>
      </Box>

      <Box sx={containerStyles}>
        <Container maxWidth="lg">
          <Box sx={contentWrapperStyles}>
            <Box sx={leftPaneStyles}>
              {passageTitle && <Typography sx={passageTitleStyles}>{passageTitle}</Typography>}
              <Box sx={{ ...passageTextStyles, component: 'div' }}>{renderPassageWithGaps()}</Box>
            </Box>

            <Box sx={rightPaneStyles}>
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
                      color: 'text.primary',
                      mb: 0.5,
                    }}
                  >
                    Instruction
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      color: 'text.secondary',
                    }}
                  >
                    You are going to read an article about a ballet dancer. Six sentences have been
                    removed from the article. Choose from the sentences A-F the one which fits each
                    gap (37-42).
                  </Typography>
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
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  Missing Sentences
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {sentences.map((sentence) => (
                    <Box
                      key={sentence.id}
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
                        {sentence.id}.
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
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  {gaps.map((gapNumber) => (
                    <Box
                      key={gapNumber}
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
                          backgroundColor: 'darkGrey.main',
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
                          value={selectedAnswers[gapNumber] || ''}
                          onChange={(e) => handleAnswerChange(gapNumber, e.target.value)}
                          disabled={isTeacher}
                          displayEmpty
                          sx={{
                            backgroundColor: 'background.paper',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'divider',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'secondary.main',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'secondary.main',
                            },
                          }}
                        >
                          <MenuItem value="" disabled>
                            Select
                          </MenuItem>
                          {sentences.map((sentence) => (
                            <MenuItem key={sentence.id} value={sentence.id}>
                              {sentence.id}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Box sx={navigationFooterStyles}>
                <Button onClick={onBack} sx={backLinkStyles} disabled={isTeacher}>
                  &lt; Back
                </Button>
                <Typography sx={sectionInfoStyles}>
                  Section {currentSection} of {totalSections}
                </Typography>
                <Button
                  variant="contained"
                  sx={nextButtonStyles}
                  onClick={onNext}
                  disabled={isTeacher}
                >
                  Next Part
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default MatchingContent;
