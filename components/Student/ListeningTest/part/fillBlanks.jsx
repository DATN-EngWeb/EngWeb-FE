'use client';

import { useEffect, useState, useRef } from 'react';
import { Container, Box, Typography, TextField } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import SumaryPartTab from './sumaryPartTab';
import { usePathname } from 'next/navigation';

export default function FillBlankPart({
  dataPart,
  isActive,
  userAnswers,
  onUpdateAnswers,
  media = {},
  disabled,
  detailAnswers,
  onNavigateToQuestion,
}) {
  const pathname = usePathname();
  const isTeacherView =
    pathname?.includes('/teacher/view-test/') ||
    pathname?.includes('/teacher/upload-test/') ||
    pathname?.includes('/teacher/update-test/') ||
    pathname?.includes('/teacher/review-test/');

  const showSummary = disabled && !isTeacherView;

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

  // Chuẩn bị dữ liệu trạng thái cho SumaryPartTab
  const questionsArray =
    dataPart?.type === 'fill_in_the_blanks' ? dataPart?.answers : dataPart?.receptive_questions;
  const partQuestions =
    isActive && questionsArray
      ? questionsArray.map((question) => {
          const questionResult = Array.isArray(detailAnswers)
            ? detailAnswers.find((ans) => ans.question_id === question.id)
            : null;
          return {
            id: question.id,
            isCorrect: questionResult?.is_correct || false,
            isAnswered: !!questionResult,
          };
        })
      : [];

  const mainContent = (
    <Box
      ref={containerRef}
      sx={{
        ...listeningPartStyles.containerColRow,
        maxHeight: { xs: 'none', md: '100vh' },
        overflow: { xs: 'visible', md: 'hidden' },
        width: '100%',
      }}
    >
      {/* -------- Audio and Passage Section --------- */}
      <Box
        sx={{
          ...listeningPartStyles.basicFlexColCenStart,
          width: { xs: '100%', md: `${leftWidth}%` },
          mb: 2,
          maxHeight: { xs: 'none', md: 'calc(100vh - 32px)' },
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
          sx={{
            ...listeningPartStyles.passageContainer,
            overflowY: 'auto',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: '#ccc',
              borderRadius: '4px',
              '&:hover': { background: '#999' },
            },
          }}
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
          minWidth: { md: '400px' },
          maxHeight: { xs: 'none', md: 'calc(100vh - 32px)' },
          overflowY: 'auto',
          minHeight: 0,
          containerType: 'inline-size',
          containerName: 'rightPanel',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: '#ccc',
            borderRadius: '4px',
            '&:hover': { background: '#999' },
          },
        }}
      >
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
              }}
            >
              {dataPart.description}{' '}
            </Typography>
          </Box>
        </Box>
        {/* -------- Question Section --------- */}
        <Box sx={listeningPartStyles.questionSection}>
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
                  const questionResult =
                    disabled && Array.isArray(detailAnswers)
                      ? detailAnswers.find((ans) => ans.question_id === answer.id)
                      : null;
                  const isCorrect = questionResult?.is_correct;

                  return (
                    <Box
                      key={answer.id}
                      id={`question-${answer.id}`}
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
                  const questionResult =
                    disabled && Array.isArray(detailAnswers)
                      ? detailAnswers.find((ans) => ans.question_id === question.id)
                      : null;
                  const isCorrect = questionResult?.is_correct;

                  const correctAnswers =
                    question.receptive_answers
                      ?.filter((a) => a.is_correct)
                      ?.map((a) => a.answer_text) || [];
                  const correctAnswerText = correctAnswers.join(' / ');

                  return (
                    <Box
                      key={question.id}
                      id={`question-${question.id}`}
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
                      {disabled && !isTeacherView && (
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
    </Box>
  );

  return (
    <Box sx={{ display: isActive ? 'block' : 'none', width: '100%' }}>
      {showSummary ? (
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', md: 'row' },
            alignItems: 'flex-start',
            pr: { xs: 0, md: 2 },
          }}
        >
          <Box maxWidth="lg" sx={{ flex: { xs: 1, md: 4 }, width: '100%' }}>
            {mainContent}
          </Box>
          <SumaryPartTab questions={partQuestions} onNavigateToQuestion={onNavigateToQuestion} />
        </Container>
      ) : (
        <Container maxWidth="lg">{mainContent}</Container>
      )}
    </Box>
  );
}
