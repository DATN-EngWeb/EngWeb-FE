'use client';

import { useEffect } from 'react';
import { Container, Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import CustomAudioPlayer from '../../../Test/customAudioPlayer';
import InstructionIcon from '../../../Test/instructionIcon';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles, matchingStyles } from '@/styles/Teacher/Reading/QuesitonTypeStyles';
import { uploadReadingStyles } from '@/styles/Teacher/Reading/UploadReadingStyles';
import SumaryPartTab from './sumaryPartTab';
import { usePathname } from 'next/navigation';

export default function Matching({
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

  const { audioSrc } = media;
  const answers = dataPart.receptive_questions.map((question) => ({
    id: question.receptive_answers[0]?.id || null,
    option_label: question.receptive_answers[0]?.option_label || '',
    answer_text: question.receptive_answers[0]?.answer_text || '',
  }));

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
    <Box sx={{ ...listeningPartStyles.containerCol, width: '100%' }}>
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
            <Typography sx={{ color: 'red.text', fontSize: '1rem', fontWeight: 600, mb: 0.5 }}>
              Instruction
            </Typography>
            <Typography sx={{ color: 'text.primary', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Listen to the audio. For each question, choose the correct answer.
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* -------- Question Section --------- */}
      <Box sx={listeningPartStyles.questionSection}>
        <Box sx={listeningPartStyles.innerInstruction}>
          <LightbulbOutlinedIcon />
          <Typography sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
            {dataPart.description}
          </Typography>
        </Box>
        <Box sx={listeningPartStyles.matchingQuestionAnswerContainerGrid}>
          <Box sx={listeningPartStyles.questionContainerCol}>
            {dataPart?.receptive_questions?.map((question, index) => {
              const questionResult =
                disabled && Array.isArray(detailAnswers)
                  ? detailAnswers.find((ans) => ans.question_id === question.id)
                  : null;
              const isCorrect = questionResult?.is_correct;

              // Tìm đáp án đúng để hiển thị
              const correctAnswer = question.receptive_answers?.find((a) => a.is_correct);
              const correctAnswerText = correctAnswer
                ? `${correctAnswer.option_label || correctAnswer.label}. ${correctAnswer.answer_text || correctAnswer.text || ''}`
                : '';

              return (
                <Box
                  key={question.id}
                  id={`question-${question.id}`}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    mb: questionResult ? 2 : 0,
                  }}
                >
                  <Box
                    sx={{
                      ...listeningPartStyles.questionContainerRow,
                      mb: questionResult ? 1 : 0,
                    }}
                  >
                    {/* -------- Question Name Section --------- */}
                    <Box
                      sx={{
                        ...listeningPartStyles.questionContainerRow,
                        border: 'none',
                        p: '0',
                        gap: 2,
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
                      <Typography
                        sx={{
                          ...multipleChoiceStyles.optionLabel,
                          fontWeight: 400,
                          wordBreak: 'break-word',
                        }}
                      >
                        {question.content || question.text}
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
                        onChange={(e) =>
                          !disabled && handleUpdateCorrectAnswer(question.id, e.target.value)
                        }
                        displayEmpty
                        disabled={disabled}
                        sx={{
                          ...matchingStyles.selectAnswer,
                          ...(questionResult && {
                            color: isCorrect ? '#4caf50' : '#f44336',
                            fontWeight: 600,
                            backgroundColor: isCorrect
                              ? 'rgba(76, 175, 80, 0.05)'
                              : 'rgba(244, 67, 54, 0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: isCorrect ? '#4caf50' : '#f44336',
                            },
                            '&.Mui-disabled': {
                              color: isCorrect ? '#4caf50' : '#f44336',
                              WebkitTextFillColor: isCorrect ? '#4caf50' : '#f44336',
                            },
                          }),
                        }}
                      >
                        <MenuItem value="">
                          <em>Select</em>
                        </MenuItem>
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
          <Box sx={listeningPartStyles.questionContainerCol}>
            {dataPart.type === 'matching'
              ? dataPart.answers.map((answer, index) => (
                  <Box
                    key={answer.id}
                    sx={{
                      ...listeningPartStyles.questionContainerRow,
                      border: 'none',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Typography
                      sx={{ ...multipleChoiceStyles.optionLabel, fontWeight: 700, flexShrink: 0 }}
                    >
                      {String.fromCharCode(65 + index)}.
                    </Typography>
                    <Typography
                      sx={{
                        ...multipleChoiceStyles.optionLabel,
                        fontWeight: 400,
                        wordBreak: 'break-word',
                      }}
                    >
                      {answer.text}
                    </Typography>
                  </Box>
                ))
              : answers
                  ?.sort((a, b) => a.option_label.localeCompare(b.option_label))
                  .map((answer) => (
                    <Box
                      key={answer.option_label}
                      sx={{
                        ...listeningPartStyles.questionContainerRow,
                        border: 'none',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography
                        sx={{ ...multipleChoiceStyles.optionLabel, fontWeight: 700, flexShrink: 0 }}
                      >
                        {answer.option_label}.
                      </Typography>
                      <Typography
                        sx={{
                          ...multipleChoiceStyles.optionLabel,
                          fontWeight: 400,
                          wordBreak: 'break-word',
                        }}
                      >
                        {answer.answer_text}
                      </Typography>
                    </Box>
                  ))}
          </Box>
        </Box>
      </Box>
    </Box>
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
        /* Ở chế độ Testing, ta dùng lại Container md để căn giữa bài làm như cũ */
        <Container maxWidth="md">{mainContent}</Container>
      )}
    </Box>
  );
}
