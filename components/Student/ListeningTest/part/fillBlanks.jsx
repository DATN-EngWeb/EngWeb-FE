'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Typography, TextField } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { listeningPartStyles } from '../../../../styles/Student/Listening/listeningTestStyles';
import { loadAudioSource, fetchHtmlContent } from '../../../../api/teacher/upload-reading';

export default function FillBlankPart({ dataPart, isActive }) {
  const [audioSrc, setAudioSrc] = useState(null);
  const [passageSrc, setPassageSrc] = useState(null);

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
      sx={{ ...listeningPartStyles.container55, display: isActive ? 'grid' : 'none' }}
    >
      {/* -------- Audio and Passage Section --------- */}
      <Box sx={listeningPartStyles.basicFlexColCenStart}>
        <Box sx={{ width: '100%', height: 'auto' }}>
          {audioSrc ? (
            <CustomAudioPlayer src={audioSrc} isActive={isActive} />
          ) : (
            <Typography variant="caption">Loading audio...</Typography>
          )}
        </Box>
        <Box
          sx={listeningPartStyles.passageContainer}
          dangerouslySetInnerHTML={{ __html: passageSrc }}
        />
      </Box>
      {/* -------- Question and Instruction Section --------- */}
      <Box sx={listeningPartStyles.basicFlexColCenStart}>
        {/* -------- Instruction --------- */}
        <Box sx={listeningPartStyles.instructionContainer}>
          <InstructionIcon />
          <Box sx={listeningPartStyles.instructionWrapper}>
            <Typography sx={{ color: 'red.text', fontSize: '1rem', fontWeight: 600 }}>
              Instruction
            </Typography>
            <Typography sx={{ color: 'dark.main', fontSize: '0.8rem' }}>
              Listen to the audio. For each question, write the correct answer in the gap. Write one
              or two words or a number or a date or a time.
            </Typography>
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
          <Box sx={listeningPartStyles.listQuestionContainerGrid}>
            {dataPart?.receptive_questions?.map((question, index) => (
              <Box key={question.id} sx={listeningPartStyles.questionContainerRow}>
                {/* -------- Question Name Section --------- */}
                <Typography sx={listeningPartStyles.questionLabelCircle}>{index + 1}</Typography>
                <TextField
                  variant="standard"
                  multiline
                  placeholder="Type answer ..."
                  sx={listeningPartStyles.inputQuestion}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
