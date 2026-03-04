'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Typography, Checkbox } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import InstructionIcon from '../../../Test/instructionIcon';
import { listeningPartStyles } from '../../../../styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '../../../../styles/Teacher/Reading/QuesitonTypeStyles';
import { loadAudioSource } from '../../../../api/teacher/upload-reading';

export default function MultipleChoiceSingleAudio({ dataPart, isActive }) {
  const [audioSrcs, setAudioSrcs] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  useEffect(() => {
    const getAllAudios = async () => {
      const newAudioSrcs = {};

      const promises =
        dataPart?.receptive_questions?.map(async (question) => {
          const audioUrl = question.resources?.audio;

          if (audioUrl) {
            const blobUrl = await loadAudioSource(audioUrl);
            newAudioSrcs[question.id] = blobUrl;
          }
        }) || [];

      await Promise.all(promises);

      setAudioSrcs(newAudioSrcs);
    };

    getAllAudios();

    return () => {
      Object.values(audioSrcs).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [dataPart?.receptive_questions]);

  const handleSetCorrectOption = (questionId, optionLabel) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
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
          <Typography sx={{ color: 'dark.main', fontSize: '0.8rem' }}>
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
              <Typography sx={listeningPartStyles.questionText}>{question.content}</Typography>
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
                    onClick={() => handleSetCorrectOption(question.id, option.option_label)}
                  >
                    <Checkbox
                      checked={userAnswers[question.id] === option.option_label}
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
                      {option.option_label}.
                    </Typography>
                    <Typography sx={{ ...multipleChoiceStyles.optionLabel, fontWeight: 400 }}>
                      {option.answer_text}
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
