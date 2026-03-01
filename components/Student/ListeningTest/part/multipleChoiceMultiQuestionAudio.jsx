'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Typography, Checkbox } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import { listeningPartStyles } from '../../../../styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '../../../../styles/Teacher/Reading/QuesitonTypeStyles';
import { loadAudioSource, fetchHtmlContent } from '../../../../api/teacher/upload-reading';

export default function MultipleChoiceQuestionAudio({ dataPart, isActive }) {
  const [audioSrc, setAudioSrc] = useState(null);
  const [passageSrc, setPassageSrc] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});

  const handleSetCorrectOption = (questionId, optionLabel) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
  };

  useEffect(() => {
    const getAudio = async () => {
      const url = await loadAudioSource(dataPart?.resources?.audio);
      setAudioSrc(url);
    };

    if (dataPart?.resources?.audio) {
      getAudio();
    }

    return () => {
      if (audioSrc) URL.revokeObjectURL(audioSrc);
    };
  }, [dataPart?.resources?.audio]);

  useEffect(() => {
    if (!isActive) {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((audio) => {
        audio.pause();
        // audio.currentTime = 0;
      });
    }
  }, [isActive]);

  useEffect(() => {
    const loadData = async () => {
      if (dataPart?.content) {
        const result = await fetchHtmlContent(dataPart.content);
        setPassageSrc(result);
      }
    };

    loadData();
  }, [dataPart?.content]);

  return (
    <Container
      maxWidth="lg"
      sx={{ ...listeningPartStyles.container46, display: isActive ? 'grid' : 'none' }}
    >
      {/* -------- Audio and Instruction Section --------- */}
      <Box sx={listeningPartStyles.basicFlexColCenStart}>
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
            <Typography sx={{ color: 'dark.main', fontSize: '0.8rem' }}>
              Listen to the audio and choose the best answer for each question.
            </Typography>
          </Box>
        </Box>
        {/* -------- Passage (Optional) --------- */}
        <Box
          sx={listeningPartStyles.passageContainer}
          dangerouslySetInnerHTML={{ __html: passageSrc }}
        />
      </Box>
      {/* -------- Question and Inner Instruction Section --------- */}
      <Box sx={listeningPartStyles.questionSection}>
        {/* -------- Inner Instruction --------- */}
        <Box sx={listeningPartStyles.innerInstruction}>
          <LightbulbOutlinedIcon />
          <Typography sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
            {dataPart.description}
          </Typography>
        </Box>
        {dataPart?.receptive_questions?.map((question, index) => (
          <Box key={question.id} sx={listeningPartStyles.questionContainerCol}>
            {/* -------- Question Name Section --------- */}
            <Box sx={listeningPartStyles.questionTextContainer}>
              <Typography sx={listeningPartStyles.questionLabelRectangle}>{index + 1}</Typography>
              <Typography sx={listeningPartStyles.questionText}>{question.content}</Typography>
            </Box>
            <Box sx={listeningPartStyles.audioAndOptionsContainer}>
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
                    <Typography sx={multipleChoiceStyles.optionLabel}>
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
