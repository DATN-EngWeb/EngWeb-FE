'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, TextField, Paper, Tabs, Tab } from '@mui/material';
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

const FillBlanksContent = ({
  testName = 'Practice Test Name',
  parts = ['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5'],
  currentPart = 2,
  passage = '',
  passageTitle = '',
  blanks = [],
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

  // Sync internal state with props when currentPart changes
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

    const processPassage = passage.replace(/\((\d+)\)/g, (match, number) => {
      return `<span style="font-weight: 700; color: #1976d2; text-decoration: underline; text-decoration-style: dotted; cursor: pointer;">(${number})</span>`;
    });

    return <div dangerouslySetInnerHTML={{ __html: processPassage }} />;
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
                  {parts[selectedPart]}: Fill in the Blanks
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
              <Box sx={passageContainerStyles}>{renderPassageWithBlanks()}</Box>
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

              <Box sx={answerInputContainerStyles}>
                {blanks.map((blankNumber) => (
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
                    />
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

export default FillBlanksContent;
