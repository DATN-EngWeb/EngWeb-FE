'use client';

import { useState } from 'react';
import { Container, Box, Typography, Checkbox, Chip } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import InstructionIcon from '../../../Test/instructionIcon';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '@/styles/Teacher/Reading/QuesitonTypeStyles';
import SumaryPartTab from './sumaryPartTab';
import { usePathname } from 'next/navigation';

export default function MultipleChoiceSingleAudio({
  dataPart,
  isActive,
  userAnswers,
  onUpdateAnswers,
  media,
  disabled,
  detailAnswers,
  onNavigateToQuestion,
}) {
  const pathname = usePathname();
  const isTeacherView =
    pathname?.includes('/teacher/view-test/') || pathname?.includes('/teacher/upload-test/');

  const showSummary = disabled && !isTeacherView;

  const { audioSrcs } = media;
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  const handleSetCorrectOption = (questionId, optionID) => {
    const newAnswers = {
      ...userAnswers,
      [questionId]: optionID,
    };

    onUpdateAnswers(newAnswers);
  };

  // Chuẩn bị dữ liệu trạng thái cho SumaryPartTab
  const partQuestions = isActive
    ? dataPart?.receptive_questions?.map((question) => {
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
    <Container maxWidth="md" sx={{ ...listeningPartStyles.containerCol }}>
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
              overflowWrap: 'anywhere',
            }}
          >
            {dataPart?.description}
          </Typography>
        </Box>
      </Box>
      {/* -------- Question Section --------- */}
      <Box sx={listeningPartStyles.questionSection}>
        {dataPart?.receptive_questions?.map((question, index) => {
          const questionResult =
            disabled && Array.isArray(detailAnswers)
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
                            flex: 1,
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
                        {correctAnswer.option_label === option.option_label && showSummary && (
                          <Chip
                            label="Correct"
                            size="small"
                            color="success"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              ml: 1,
                              display: { xs: 'none', md: 'inline-flex' },
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              {/* -------- Explanation Section --------- */}
              {disabled && !isTeacherView && (
                <Box sx={{ pr: { xs: 0, md: 4 }, width: '100%' }}>
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
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Container>
  );

  return (
    <Box sx={{ display: isActive ? 'block' : 'none', width: '100%' }}>
      {showSummary ? (
        <Container
          disableGutters
          maxWidth="lg"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', md: 'row' },
            alignItems: 'flex-start',
          }}
        >
          <Box maxWidth="md" sx={{ flex: { xs: 1, md: 3 }, width: '100%' }}>
            {mainContent}
          </Box>
          <SumaryPartTab questions={partQuestions} onNavigateToQuestion={onNavigateToQuestion} />
        </Container>
      ) : (
        mainContent
      )}
    </Box>
  );
}
