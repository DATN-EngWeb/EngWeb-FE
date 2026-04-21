'use client';

import { useEffect, useState, useRef } from 'react';
import { Container, Box, Typography, TextField } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';

export default function FillBlankPart({
  dataPart,
  isActive,
  userAnswers,
  onUpdateAnswers,
  media = {},
  disabled,
  detailAnswers,
}) {
  const { audioSrc = '', passageSrc = '' } = media;
  const [leftWidth, setLeftWidth] = useState(40); // percentage width
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isActive) {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((audio) => {
        audio.pause();
        // audio.currentTime = 0;
      });
    }
  }, [isActive]);

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

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerLeft = containerRect.left;
      const containerWidth = containerRect.width;

      if (!containerWidth || containerWidth === 0) return;

      const relativeX = event.clientX - containerLeft;
      const newLeftWidth = (relativeX / containerWidth) * 100;

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
          dangerouslySetInnerHTML={{ __html: passageSrc || '' }}
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
          containerType: 'inline-size',
          containerName: 'rightPanel',
        }}
      >
        {/* -------- Instruction --------- */}
        <Box sx={listeningPartStyles.instructionContainer}>
          <InstructionIcon />
          <Box sx={listeningPartStyles.instructionWrapper}>
            <Typography
              sx={{ color: 'secondary.main', fontSize: '1rem', fontWeight: 600, mb: 0.5 }}
            >
              Instruction
            </Typography>
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: '0.9rem',
                lineHeight: 1.5,
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
          <Box
            sx={{
              ...listeningPartStyles.listQuestionContainerGrid,
              // Ở mức 460px trở lên sẽ dùng cols-2 mặc định, 459px trở xuống sẽ dùng grid-cols-1
              '@container rightPanel (max-width: 400px)': {
                display: 'grid',
                gridTemplateColumns: '1fr !important',
              },
            }}
          >
            {dataPart.type === 'fill_in_the_blanks'
              ? dataPart?.answers?.map((answer, index) => {
                  const questionResult = Array.isArray(detailAnswers)
                    ? detailAnswers.find((ans) => ans.question_id === answer.id)
                    : null;
                  const isCorrect = questionResult?.is_correct;

                  return (
                    <Box
                      key={answer.id}
                      sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 1 }}
                    >
                      <Box
                        sx={{
                          ...listeningPartStyles.questionContainerRow,
                          mb: questionResult ? 1 : 0,
                        }}
                      >
                        <Typography
                          sx={{
                            ...listeningPartStyles.questionLabelCircle,
                            ...(questionResult && {
                              backgroundColor: isCorrect ? 'success.main' : 'error.main',
                              color: '#fff',
                              border: 'none',
                            }),
                          }}
                        >
                          {index + 1}
                        </Typography>
                        <TextField
                          disabled={disabled}
                          variant="standard"
                          multiline
                          placeholder="Type answer ..."
                          defaultValue={userAnswers[answer.id] || ''}
                          sx={{
                            ...listeningPartStyles.inputQuestion,
                            ...(questionResult && {
                              backgroundColor: isCorrect
                                ? 'rgba(76, 175, 80, 0.05)'
                                : 'rgba(244, 67, 54, 0.05)',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              '& .MuiInputBase-input': {
                                color: isCorrect ? '#4caf50' : '#f44336',
                                fontWeight: 600,
                                WebkitTextFillColor: isCorrect ? '#4caf50' : '#f44336',
                              },
                              '& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInputBase-root.Mui-disabled:before':
                                {
                                  borderBottomColor: isCorrect ? '#4caf50' : '#f44336',
                                  borderBottomStyle: 'solid',
                                },
                            }),
                          }}
                          onBlur={(e) => handleUpdateUserAnswers(answer.id, e.target.value)}
                        />
                      </Box>
                    </Box>
                  );
                })
              : dataPart?.receptive_questions?.map((question, index) => {
                  const questionResult = Array.isArray(detailAnswers)
                    ? detailAnswers.find((ans) => ans.question_id === question.id)
                    : null;
                  const isCorrect = questionResult?.is_correct;

                  const correctAnswerText = question.receptive_answers?.find(
                    (a) => a.is_correct,
                  )?.answer_text;

                  return (
                    <Box
                      key={question.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        mb: questionResult ? 3 : 1,
                      }}
                    >
                      <Box
                        sx={{
                          ...listeningPartStyles.questionContainerRow,
                          mb: questionResult ? 1 : 0,
                        }}
                      >
                        {/* -------- Question Name Section --------- */}
                        <Typography
                          sx={{
                            ...listeningPartStyles.questionLabelCircle,
                            ...(questionResult && {
                              backgroundColor: isCorrect ? 'success.main' : 'error.main',
                              color: '#fff',
                              border: 'none',
                            }),
                          }}
                        >
                          {index + 1}
                        </Typography>
                        <TextField
                          disabled={disabled}
                          variant="standard"
                          multiline
                          placeholder="Type answer ..."
                          defaultValue={userAnswers[question.id] || ''}
                          sx={{
                            ...listeningPartStyles.inputQuestion,
                            ...(questionResult && {
                              borderRadius: '4px',
                              padding: '2px 8px',
                              '& .MuiInputBase-input': {
                                color: isCorrect ? '#4caf50' : '#f44336',
                                fontWeight: 600,
                                WebkitTextFillColor: isCorrect ? '#4caf50' : '#f44336',
                              },
                              '& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInputBase-root.Mui-disabled:before':
                                {
                                  borderBottomColor: isCorrect ? '#4caf50' : '#f44336',
                                  borderBottomStyle: 'solid',
                                },
                            }),
                          }}
                          onBlur={(e) => handleUpdateUserAnswers(question.id, e.target.value)}
                        />
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
        </Box>
      </Box>
    </Container>
  );
}
