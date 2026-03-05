'use client';

import { useEffect, useState, useRef } from 'react';
import { Container, Box, Typography, TextField } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { listeningPartStyles } from '../../../../styles/Student/Listening/listeningTestStyles';
import { loadAudioSource, fetchHtmlContent } from '../../../../api/teacher/upload-reading';

export default function FillBlankPart({ dataPart, isActive, userAnswers, onUpdateAnswers }) {
  const [audioSrc, setAudioSrc] = useState(null);
  const [passageSrc, setPassageSrc] = useState(null);
  const [leftWidth, setLeftWidth] = useState(40); // percentage width
  const [isDragging, setIsDragging] = useState(false);

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

  const handleUpdateUserAnswers = (questionId, answerText) => {
    const newAnswers = {
      ...userAnswers,
      [questionId]: answerText,
    };

    onUpdateAnswers(newAnswers);
  };

  const containerRef = useRef(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event) => {
      event.preventDefault();

      // 3. Sử dụng ref thay vì querySelector
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerLeft = containerRect.left;
      const containerWidth = containerRect.width;

      if (!containerWidth || containerWidth === 0) return;

      // Tính toán vị trí chuột tương đối trong khung
      const relativeX = event.clientX - containerLeft;
      const newLeftWidth = (relativeX / containerWidth) * 100;

      // Giới hạn vùng kéo (25% - 75%)
      const clamped = Math.min(75, Math.max(25, newLeftWidth));
      setLeftWidth(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  return (
    <Container
      ref={containerRef}
      maxWidth="lg"
      sx={{
        ...listeningPartStyles.containerColRow,
        display: isActive ? 'flex' : 'none',
        height: { xs: 'auto', md: '100vh' },
        maxHeight: { xs: 'none', md: '100vh' },
        overflow: { xs: 'visible', md: 'hidden' },
      }}
    >
      {/* -------- Audio and Passage Section --------- */}
      <Box
        sx={{
          ...listeningPartStyles.basicFlexColCenStart,
          width: { xs: '100%', md: `${leftWidth}%` },
          mb: 2,
          height: '100%',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
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
      {/* -------- Drag Section --------- */}
      <Box
        onMouseDown={() => setIsDragging(true)}
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          cursor: 'col-resize',
          flexShrink: 0,
        }}
        role="separator"
      >
        {/* Vertical line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 2,
            transform: 'translateX(-50%)',
            backgroundColor: isDragging ? 'warning.main' : 'divider',
          }}
        />
        {/* Handle circle */}
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: isDragging ? 'warning.main' : 'divider',
            backgroundColor: 'background.paper',
            boxShadow: '0 0 4px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            color: 'text.secondary',
            userSelect: 'none',
          }}
        >
          ⇔
        </Box>
      </Box>
      {/* -------- Question and Instruction Section --------- */}
      <Box
        sx={{
          ...listeningPartStyles.basicFlexColCenStart,
          width: { xs: '100%', md: `calc(${100 - leftWidth}% - 32px)` },
          height: '100%',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
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
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
              }}
            >
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
                  defaultValue={userAnswers[question.id] || ''}
                  sx={listeningPartStyles.inputQuestion}
                  onBlur={(e) => handleUpdateUserAnswers(question.id, e.target.value)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
