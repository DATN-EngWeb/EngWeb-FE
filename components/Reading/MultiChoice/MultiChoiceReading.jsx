'use client';

import React, { useState } from 'react';
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
import Footer from '../../Home/Footer';
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

const MultiChoiceReading = ({
  testName = 'Practice Test Name',
  parts = ['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5'],
  currentPart = 1,
  passage = '',
  passageTitle = '',
  questions = [],
  answers = {},
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
    <>
      <Header />

      <Box sx={{ backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={headerWrapperStyles}>
            <Box sx={headerSectionStyles}>
              <Box>
                <Typography sx={testNameStyles}>{testName}</Typography>
                <Typography sx={partTitleStyles}>
                  {parts[selectedPart]}: Multiple Choice Long Text
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
              <Typography sx={passageTextStyles}>{passage}</Typography>
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
                    Read the text and choose the best answer for each question.
                  </Typography>
                </Box>
              </Paper>

              {questions.map((question, index) => (
                <Box key={question.id || index} sx={questionContainerStyles}>
                  <Box sx={questionNumberStyles}>{index + 1}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={questionTextStyles}>{question.question}</Typography>
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
                          label={<Typography sx={optionLabelStyles}>{option.label}</Typography>}
                          sx={optionContainerStyles}
                          disabled={isTeacher}
                        />
                      ))}
                    </RadioGroup>
                  </Box>
                </Box>
              ))}

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
      <Footer />
    </>
  );
};

export default MultiChoiceReading;
