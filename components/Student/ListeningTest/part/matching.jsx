'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { listeningPartStyles } from '../../../../styles/Student/Listening/listeningTestStyles';
import {
  multipleChoiceStyles,
  matchingStyles,
} from '../../../../styles/Teacher/Reading/QuesitonTypeStyles';
import { uploadReadingStyles } from '../../../../styles/Teacher/Reading/UploadReadingStyles';
import { loadAudioSource } from '../../../../api/teacher/upload-reading';

export default function Matching({ dataPart, isActive, userAnswers, onUpdateAnswers }) {
  const [audioSrc, setAudioSrc] = useState(null);
  const answers = dataPart.receptive_questions.map((question) => ({
    id: question.receptive_answers[0]?.id || null,
    option_label: question.receptive_answers[0]?.option_label || '',
    answer_text: question.receptive_answers[0]?.answer_text || '',
  }));

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

  const handleUpdateCorrectAnswer = (questionId, optionID) => {
    const newAnswers = {
      ...userAnswers,
    };

    Object.keys(newAnswers).forEach((key) => {
      if (newAnswers[key] === optionID) {
        newAnswers[key] = undefined;
      }
    });

    newAnswers[questionId] = optionID;

    onUpdateAnswers(newAnswers);
  };

  return (
    <Container
      maxWidth="md"
      sx={{ ...listeningPartStyles.containerCol, display: isActive ? 'grid' : 'none' }}
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
              Listen to the audio. For each question, choose the correct answer.
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* -------- Question Section --------- */}
      <Box sx={listeningPartStyles.questionSection}>
        <Box sx={listeningPartStyles.innerDecorQuestionSection} />
        <Box sx={listeningPartStyles.innerInstruction}>
          <LightbulbOutlinedIcon />
          <Typography sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
            {dataPart.description}
          </Typography>
        </Box>
        <Box sx={listeningPartStyles.matchingQuestionAnswerContainerGrid}>
          <Box sx={listeningPartStyles.questionContainerCol}>
            {dataPart?.receptive_questions?.map((question, index) => (
              <Box key={question.id} sx={listeningPartStyles.questionContainerRow}>
                {/* -------- Question Name Section --------- */}
                <Box
                  key={question.id}
                  sx={{
                    ...listeningPartStyles.questionContainerRow,
                    border: 'none',
                    p: '0',
                    gap: 2,
                  }}
                >
                  <Typography sx={listeningPartStyles.questionLabelCircle}>{index + 1}</Typography>
                  <Typography sx={{ ...multipleChoiceStyles.optionLabel, fontWeight: 400 }}>
                    {question.content}
                  </Typography>
                </Box>
                <FormControl
                  sx={{
                    ...uploadReadingStyles.formControl,
                    width: { xs: '150px', md: '180px' },
                  }}
                >
                  <Select
                    value={userAnswers[question.id] || ''}
                    onChange={(e) => handleUpdateCorrectAnswer(question.id, e.target.value)}
                    displayEmpty
                    sx={matchingStyles.selectAnswer}
                  >
                    <MenuItem value="" disabled>
                      <em>Select</em>
                    </MenuItem>
                    {/* Hiện đầy đủ danh sách, không cần vô hiệu hóa */}
                    {answers
                      ?.sort((a, b) => a.option_label.localeCompare(b.option_label))
                      .map((answer) => (
                        <MenuItem key={answer.option_label} value={answer.id}>
                          {answer.option_label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Box>
          <Box sx={listeningPartStyles.questionContainerCol}>
            {answers
              ?.sort((a, b) => a.option_label.localeCompare(b.option_label))
              .map((answer, index) => (
                <Box
                  key={answer.option_label}
                  sx={{
                    ...listeningPartStyles.questionContainerRow,
                    border: 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* -------- Question Name Section --------- */}
                  <Typography
                    sx={{ ...multipleChoiceStyles.optionLabel, fontWeight: 700, flexShrink: 0 }}
                  >
                    {answer.option_label}.
                  </Typography>
                  <Typography sx={{ ...multipleChoiceStyles.optionLabel, fontWeight: 400 }}>
                    {answer.answer_text}
                  </Typography>
                </Box>
              ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
