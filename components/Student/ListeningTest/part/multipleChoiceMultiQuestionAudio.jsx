'use client';

import { useEffect, useState, useRef } from 'react';
import { Container, Box, Typography, Checkbox } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '@/styles/Teacher/Reading/QuesitonTypeStyles';

export default function MultipleChoiceQuestionAudio({
  dataPart,
  isActive,
  userAnswers,
  onUpdateAnswers,
  media,
  disabled,
  detailAnswers,
}) {
  const { audioSrc, passageSrc } = media;
  const [leftWidth, setLeftWidth] = useState(40); // percentage width
  const [isDragging, setIsDragging] = useState(false);

  const handleSetCorrectOption = (questionId, optionID) => {
    const newAnswers = {
      ...userAnswers,
      [questionId]: optionID,
    };

    onUpdateAnswers(newAnswers);
  };

  useEffect(() => {
    if (!isActive) {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((audio) => {
        audio.pause();
        // audio.currentTime = 0;
      });
    }
  }, [isActive]);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event) => {
      event.preventDefault();

      // Sử dụng ref thay vì querySelector
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
      {/* -------- Audio and Instruction Section --------- */}
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
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
              }}
            >
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
      {/* -------- Question and Inner Instruction Section --------- */}
      <Box
        sx={{
          ...listeningPartStyles.questionSection,
          width: { xs: '100%', md: `calc(${100 - leftWidth}% - 32px)` },
          height: '100%',
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {/* -------- Inner Instruction --------- */}
        <Box sx={listeningPartStyles.innerInstruction}>
          <LightbulbOutlinedIcon />
          <Typography sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
            {dataPart.description}
          </Typography>
        </Box>
        {dataPart?.receptive_questions?.map((question, index) => {
          const questionResult = Array.isArray(detailAnswers)
            ? detailAnswers.find((ans) => ans.question_id === question.id)
            : null;

          // Tìm đáp án đúng để hiển thị
          const correctAnswer = question.receptive_answers?.find((a) => a.is_correct);
          const correctAnswerText = correctAnswer
            ? `${correctAnswer.option_label || correctAnswer.label}. ${correctAnswer.answer_text || correctAnswer.text || ''}`
            : '';

          return (
            <Box
              key={question.id}
              id={`question-${question.id}`}
              sx={listeningPartStyles.questionContainerCol}
            >
              {/* -------- Question Name Section --------- */}
              <Box sx={listeningPartStyles.questionTextContainer}>
                <Typography sx={listeningPartStyles.questionLabelRectangle}>{index + 1}</Typography>
                <Typography sx={listeningPartStyles.questionText}>
                  {question.content || question.text}
                </Typography>
              </Box>
              <Box sx={listeningPartStyles.audioAndOptionsContainer}>
                {/* -------- Options Section --------- */}
                <Box sx={listeningPartStyles.optionsGridRow}>
                  {question.receptive_answers.map((option) => {
                    const isSelectedInTesting = userAnswers[question.id] === option.id;
                    const isSelectedInReview = questionResult?.selected_answer_id === option.id;
                    const isCorrect = questionResult?.is_correct;

                    return (
                      <Box
                        key={`${option.id}`}
                        onClick={() => !disabled && handleSetCorrectOption(question.id, option.id)}
                        sx={{
                          ...multipleChoiceStyles.optionContainer,
                          cursor: disabled ? 'default' : 'pointer',
                          ...(questionResult &&
                            isSelectedInReview && {
                              border: `1px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
                              backgroundColor: isCorrect
                                ? 'rgba(76, 175, 80, 0.05)'
                                : 'rgba(244, 67, 54, 0.05)',
                            }),
                        }}
                      >
                        <Checkbox
                          disabled={disabled}
                          checked={isSelectedInTesting || isSelectedInReview}
                          icon={<RadioButtonUncheckedIcon sx={multipleChoiceStyles.uncheckIcon} />}
                          checkedIcon={
                            <Box sx={multipleChoiceStyles.checkedIconWrapper}>
                              <RadioButtonUncheckedIcon
                                sx={{
                                  ...multipleChoiceStyles.outerCircle,
                                  ...(questionResult &&
                                    isSelectedInReview && {
                                      color: isCorrect ? 'success.main' : 'error.main',
                                    }),
                                }}
                              />
                              <CircleIcon
                                sx={{
                                  ...multipleChoiceStyles.innerCircle,
                                  ...(questionResult &&
                                    isSelectedInReview && {
                                      color: isCorrect ? 'success.main' : 'error.main',
                                    }),
                                }}
                              />
                            </Box>
                          }
                          sx={{
                            ...multipleChoiceStyles.checkboxRoot,
                            ...(questionResult &&
                              isSelectedInReview && {
                                color: isCorrect ? 'success.main' : 'error.main',
                                '&.Mui-checked': {
                                  color: isCorrect ? 'success.main' : 'error.main',
                                },
                              }),
                          }}
                        />
                        <Typography
                          sx={{
                            ...multipleChoiceStyles.optionLabel,
                            flexShrink: 0,
                            ...(questionResult &&
                              isSelectedInReview && {
                                color: isCorrect ? '#4caf50' : '#f44336',
                                fontWeight: 600,
                              }),
                          }}
                        >
                          {option.option_label || option.label}.
                        </Typography>
                        <Typography
                          sx={{
                            ...multipleChoiceStyles.optionLabel,
                            fontWeight: 400,
                            ...(questionResult &&
                              isSelectedInReview && {
                                color: isCorrect ? '#4caf50' : '#f44336',
                                fontWeight: 500,
                              }),
                          }}
                        >
                          {option.answer_text || option.text}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              {/* -------- Explanation Section --------- */}
              {questionResult && (
                <Box sx={{ pr: { xs: 0, md: 4 }, width: '100%' }}>
                  <Box sx={{ ...listeningPartStyles.explanationContainer }}>
                    <Typography sx={listeningPartStyles.correctText}>
                      Correct Answer: {correctAnswerText}
                    </Typography>
                    {question.explanation && (
                      <Typography sx={listeningPartStyles.explanationText}>
                        <strong>Explanation:</strong> {question.explanation}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}
