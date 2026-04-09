'use client';

import { useState } from 'react';
import { Container, Box, Typography, Checkbox } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import InstructionIcon from '../../../Test/instructionIcon';
import { listeningPartStyles } from '../../../../styles/student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '../../../../styles/Teacher/Reading/QuesitonTypeStyles';

export default function MultipleChoiceSingleAudio({
  dataPart,
  isActive,
  userAnswers,
  onUpdateAnswers,
  media,
}) {
  const { audioSrcs } = media;
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

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
      sx={{ ...listeningPartStyles.containerCol, display: isActive ? 'flex' : 'none' }}
    >
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
            {dataPart?.description}
          </Typography>
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
            <Box sx={listeningPartStyles.audioAndOptionsContainer}>
              {/* -------- Audio Section --------- */}
              <Box sx={{ width: '100%', height: 'auto' }}>
                {audioSrcs ? (
                  <CustomAudioPlayer
                    src={audioSrcs[question.id]}
                    isActive={isActive}
                    isCurrentPlaying={currentPlayingId === question.id}
                    onPlay={() => setCurrentPlayingId(question.id)}
                    onPause={() => {
                      if (currentPlayingId === question.id) setCurrentPlayingId(null);
                    }}
                  />
                ) : (
                  <Typography variant="caption">Loading audio...</Typography>
                )}
              </Box>
              {/* -------- Options Section --------- */}
              <Box sx={listeningPartStyles.optionsGridRow}>
                {question.receptive_answers.map((option) => (
                  <Box
                    key={`${option.id}`}
                    sx={{ ...multipleChoiceStyles.optionContainer, cursor: 'pointer' }}
                    onClick={() => handleSetCorrectOption(question.id, option.id)}
                  >
                    <Checkbox
                      checked={userAnswers[question.id] === option.id}
                      icon={<RadioButtonUncheckedIcon sx={multipleChoiceStyles.uncheckIcon} />}
                      checkedIcon={
                        <Box sx={multipleChoiceStyles.checkedIconWrapper}>
                          <RadioButtonUncheckedIcon sx={multipleChoiceStyles.outerCircle} />
                          <CircleIcon sx={multipleChoiceStyles.innerCircle} />
                        </Box>
                      }
                      sx={multipleChoiceStyles.checkboxRoot}
                    />
                    <Typography sx={{ ...multipleChoiceStyles.optionLabel, flexShrink: 0 }}>
                      {option.option_label || option.label}.
                    </Typography>
                    <Typography sx={{ ...multipleChoiceStyles.optionLabel, fontWeight: 400 }}>
                      {option.answer_text || option.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
