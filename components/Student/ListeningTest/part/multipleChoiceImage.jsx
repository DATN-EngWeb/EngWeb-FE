'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import { listeningPartStyles } from '../../../../styles/Student/Listening/listeningTestStyles';
import { loadAudioSource, loadImageSource } from '../../../../api/teacher/upload-reading';

export default function MultipleChoiceImagePart({ dataPart, isActive }) {
  const [audioSrc, setAudioSrc] = useState(null);
  const [imageSrcs, setImageSrcs] = useState({});
  const [userAnswers, setUserAnswers] = useState({});

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
    const getAllImages = async () => {
      const newImageSrcs = {};

      const promises =
        dataPart?.receptive_questions?.flatMap((question) =>
          question.receptive_answers.map(async (option) => {
            const imageUrl = option.resources?.image;
            if (imageUrl) {
              const blobUrl = await loadImageSource(imageUrl);
              newImageSrcs[option.id] = blobUrl;
            }
          }),
        ) || [];

      await Promise.all(promises);
      setImageSrcs(newImageSrcs);
    };

    getAllImages();

    return () => {
      Object.values(imageSrcs).forEach((url) => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [dataPart?.receptive_questions]);

  useEffect(() => {
    if (!isActive) {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((audio) => {
        audio.pause();
        // audio.currentTime = 0;
      });
    }
  }, [isActive]);

  const handleSetCorrectOption = (questionId, optionLabel) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
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
            <Typography sx={{ color: 'dark.main', fontSize: '0.8rem' }}>
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
              <Typography sx={listeningPartStyles.questionText}>{question.content}</Typography>
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
                      ...(userAnswers[question.id] === option.option_label && {
                        backgroundColor: 'primary.main',
                        boxShadow: 'none',
                        color: 'yellow.main',
                        '&:hover': {},
                      }),
                    }}
                    onClick={() => handleSetCorrectOption(question.id, option.option_label)}
                  >
                    {option.option_label}
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
