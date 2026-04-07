'use client';

import { useEffect } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import { listeningPartStyles } from '../../../../styles/student/Listening/listeningTestStyles';

export default function MultipleChoiceImagePart({
  dataPart,
  isActive,
  userAnswers,
  onUpdateAnswers,
  disabled,
  media,
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
            <Typography sx={{ color: 'red.text', fontSize: '1rem', fontWeight: 600 }}>
              Instruction
            </Typography>
            <Typography
              sx={{
                color: 'dark.main',
                fontSize: '0.8rem',
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
        {dataPart?.receptive_questions?.map((question, index) => (
          <Box key={question.id} sx={listeningPartStyles.questionContainerCol}>
            {/* -------- Question Name Section --------- */}
            <Box sx={listeningPartStyles.questionTextContainer}>
              <Typography sx={listeningPartStyles.questionLabelRectangle}>{index + 1}</Typography>
              <Typography sx={listeningPartStyles.questionText}>
                {question.content || question.text}
              </Typography>
            </Box>
            {/* -------- Options Section --------- */}
            <Box sx={listeningPartStyles.optionsGrid}>
              {question.receptive_answers.map((option) => (
                <Box key={option.id} sx={listeningPartStyles.optionContainer}>
                  <Box sx={listeningPartStyles.imgContainer}>
                    <img src={imageSrcs[option.id]} alt={`Option ${option.id}`} />
                  </Box>
                  <Button
                    key={option.id}
                    sx={{
                      ...listeningPartStyles.labelButton,
                      ...(userAnswers[question.id] === option.id && {
                        backgroundColor: 'primary.main',
                        boxShadow: 'none',
                        color: 'yellow.main',
                        '&:hover': {},
                        '&.Mui-disabled': {
                          color: 'primary.contrastText',
                        },
                      }),
                    }}
                    onClick={() => handleSetCorrectOption(question.id, option.id)}
                    disabled={disabled}
                  >
                    {option.option_label || option.label}
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
