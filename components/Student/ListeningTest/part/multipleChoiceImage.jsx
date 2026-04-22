'use client';

import { useEffect } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';

export default function MultipleChoiceImagePart({
  dataPart,
  isActive,
  userAnswers,
  onUpdateAnswers,
  media,
  disabled,
  detailAnswers,
}) {
  const { audioSrc, imageSrcs } = media;

  useEffect(() => {
    if (!isActive) {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((audio) => {
        audio.pause();
        // audio.currentTime = 0;
      });
    }
  }, [isActive]);

  const handleSetCorrectOption = (questionId, optionID) => {
    const newAnswers = {
      ...userAnswers,
      [questionId]: optionID,
    };

    onUpdateAnswers(newAnswers);
  };

  return (
    <Container
      maxWidth="md"
      sx={{ ...listeningPartStyles.containerCol, display: isActive ? 'grid' : 'none' }}
    >
      {/* -------- Audio And Instruction Section --------- */}
      <Box sx={listeningPartStyles.basicFlexColCenStart}>
        {/* -------- Audio --------- */}
        <Box sx={{ width: '100%', height: 'auto' }}>
          {audioSrc ? (
            <CustomAudioPlayer src={audioSrc} isActive={isActive} />
          ) : (
            <Typography variant="caption">Loading audio...</Typography>
          )}
        </Box>
        {/* -------- Instruction --------- */}
        <Box sx={listeningPartStyles.instructionContainer}>
          <InstructionIcon />
          <Box sx={listeningPartStyles.instructionWrapper}>
            <Typography sx={{ color: 'red.text', fontSize: '1rem', fontWeight: 600, mb: 0.5 }}>
              Instruction
            </Typography>
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {dataPart?.description ||
                'Listen to the audio and look at the pictures. Choose the correct picture for each questions.'}
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* -------- Question Section --------- */}
      <Box sx={listeningPartStyles.questionSection}>
        {dataPart?.receptive_questions?.map((question, index) => {
          const questionResult = Array.isArray(detailAnswers)
            ? detailAnswers.find((ans) => ans.question_id === question.id)
            : null;

          const correctAnswer = question.receptive_answers?.find((a) => a.is_correct);
          const correctAnswerText = correctAnswer
            ? correctAnswer.option_label || correctAnswer.label
            : '';

          return (
            <Box
              key={question.id}
              id={`question-${question.id}`}
              sx={listeningPartStyles.questionContainerCol}
            >
              {/* -------- Question Name Section --------- */}
              <Box sx={listeningPartStyles.questionTextContainer}>
                <Typography sx={listeningPartStyles.questionLabelRectangle}>{index + 1}</Typography>
                <Typography sx={listeningPartStyles.questionText}>
                  {question.content || question.text}
                </Typography>
              </Box>
              {/* -------- Options Section --------- */}
              <Box sx={listeningPartStyles.optionsGrid}>
                {question.receptive_answers.map((option) => {
                  const isSelectedInTesting = userAnswers[question.id] === option.id;
                  const isSelectedInReview = questionResult?.selected_answer_id === option.id;
                  const isCorrect = questionResult?.is_correct;

                  return (
                    <Box key={option.id} sx={listeningPartStyles.optionContainer}>
                      <Box
                        sx={{
                          ...listeningPartStyles.imgContainer,
                          ...(questionResult &&
                            isSelectedInReview && {
                              border: `3px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
                              borderRadius: '8px',
                            }),
                        }}
                      >
                        <img src={imageSrcs[option.id]} alt={`Option ${option.id}`} />
                      </Box>
                      <Button
                        disabled={disabled}
                        sx={{
                          ...listeningPartStyles.labelButton,
                          ...(isSelectedInTesting && {
                            backgroundColor: 'primary.main',
                            boxShadow: 'none',
                            color: 'yellow.main',
                          }),
                          ...(questionResult &&
                            isSelectedInReview && {
                              backgroundColor: isCorrect ? 'success.main' : 'error.main',
                              boxShadow: 'none',
                              color: '#ffffff',
                              '&.Mui-disabled': {
                                backgroundColor: isCorrect ? 'success.main' : 'error.main',
                                color: '#ffffff',
                              },
                            }),
                        }}
                        onClick={() => !disabled && handleSetCorrectOption(question.id, option.id)}
                      >
                        {option.option_label || option.label}
                      </Button>
                    </Box>
                  );
                })}
              </Box>
              {/* -------- Explanation Section --------- */}
              {questionResult && (
                <Box sx={listeningPartStyles.explanationContainer}>
                  <Typography sx={listeningPartStyles.correctText}>
                    Correct Answer: {correctAnswerText}
                  </Typography>
                  {question.explanation && (
                    <Typography sx={listeningPartStyles.explanationText}>
                      <strong>Explanation:</strong> {question.explanation}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}
