'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Radio, RadioGroup, Chip } from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import {
  containerStyles,
  passageTitleStyles,
  passageTextStyles,
} from '@/styles/Reading/MultiChoiceReadingStyles';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '@/styles/Teacher/Reading/QuesitonTypeStyles';
import SumaryPartTab from '../../Student/ListeningTest/part/sumaryPartTab';

const MultiChoiceContent = ({
  passage = '',
  passageTitle = '',
  questions = [],
  answers = {},
  showResults = false,
  onAnswerChange = () => {},
}) => {
  const [leftWidth, setLeftWidth] = useState(55);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);
  const [passageContent, setPassageContent] = useState(passage);

  // Thêm state để lưu câu hỏi mục tiêu khi click từ SumaryPartTab
  const [targetQuestionId, setTargetQuestionId] = useState(null);

  // Lấy nội dung passage nếu nó là link từ storage
  useEffect(() => {
    setPassageContent(passage);
    const fetchContent = async () => {
      if (
        passage &&
        typeof passage === 'string' &&
        passage.startsWith('http') &&
        passage.includes('storage.googleapis.com')
      ) {
        try {
          const response = await fetch(passage);
          const text = await response.text();
          setPassageContent(text);
        } catch (error) {
          console.error('Failed to fetch passage content:', error);
        }
      }
    };
    fetchContent();
  }, [passage]);

  // Logic kéo thả chia độ rộng màn hình
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (event) => {
      event.preventDefault();
      const clientX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
      const container = containerRef.current;
      if (!container) {
        const totalWidth = window.innerWidth || document.body.clientWidth;
        if (!totalWidth) return;
        const newLeftWidth = (clientX / totalWidth) * 100;
        setLeftWidth(Math.min(75, Math.max(25, newLeftWidth)));
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const relativeX = clientX - containerRect.left;
      const newLeftWidth = (relativeX / containerRect.width) * 100;
      setLeftWidth(Math.min(75, Math.max(25, newLeftWidth)));
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      if (isDragging) {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
  }, [isDragging]);

  const handleAnswerSelection = (questionId, value) => {
    if (showResults) return;
    onAnswerChange({ ...answers, [questionId]: value });
  };

  // Logic cuộn trang và nảy Container Question khi click từ SumaryPartTab
  useEffect(() => {
    if (targetQuestionId && showResults) {
      let retryCount = 0;
      const maxRetries = 15;

      const attemptScroll = () => {
        const element = document.getElementById(`question-${targetQuestionId}`);

        if (element && element.getBoundingClientRect().height > 0) {
          window.requestAnimationFrame(() => {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });

            if (!document.getElementById('safe-bounce-style')) {
              const style = document.createElement('style');
              style.id = 'safe-bounce-style';
              style.innerHTML = `
                @keyframes slightBounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-2px); }
                }
                .safe-element-bounce {
                  animation: slightBounce 0.3s ease-in-out 2;
                }
              `;
              document.head.appendChild(style);
            }

            setTimeout(() => {
              element.classList.add('safe-element-bounce');

              setTimeout(() => {
                element.classList.remove('safe-element-bounce');
              }, 600);
            }, 300);
          });

          setTargetQuestionId(null);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptScroll, 100);
        }
      };

      const timer = setTimeout(attemptScroll, 200);
      return () => clearTimeout(timer);
    }
  }, [targetQuestionId, showResults]);

  // Chuẩn bị dữ liệu trạng thái cho SumaryPartTab
  const partQuestions = showResults
    ? questions.map((q) => {
        const selectedValue = answers[q.id];
        const isAnswered =
          selectedValue !== undefined && selectedValue !== null && selectedValue !== '';

        // Tìm option người dùng đã chọn để xác định tính đúng sai
        const selectedOption = q.options?.find((o) => o.value === selectedValue);
        const isCorrect = selectedOption?.isCorrect || false;

        return {
          id: q.id,
          isAnswered,
          isCorrect,
        };
      })
    : [];

  const handleNavigateToQuestion = (questionId) => {
    setTargetQuestionId(questionId);
  };

  // Tách riêng nội dung chính thành một biến để dễ bọc Layout
  const mainContent = (
    <Box sx={{ ...containerStyles, flex: 1, width: '100%', overflow: 'hidden' }}>
      <Container maxWidth={false} disableGutters sx={{ height: '100%', px: 0 }}>
        <Box
          ref={containerRef}
          sx={{
            ...listeningPartStyles.containerColRow,
            height: { xs: 'auto', md: '100vh' },
            maxHeight: { xs: 'none', md: '100vh' },
            overflow: { xs: 'visible', md: 'hidden' },
            width: '100%',
            py: 2,
          }}
        >
          {/* TRÁI: ĐOẠN VĂN (PASSAGE) */}
          <Box
            sx={{
              ...listeningPartStyles.basicFlexColCenStart,
              width: { xs: '100%', md: `${leftWidth}%` },
              mb: { xs: 2, md: 0 },
              height: '100%',
              overflowY: 'auto',
              minHeight: 0,
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
            <Box sx={listeningPartStyles.passageContainer}>
              {passageTitle && (
                <Typography sx={{ ...passageTitleStyles, mb: 2 }}>{passageTitle}</Typography>
              )}
              <Typography
                component="div"
                sx={passageTextStyles}
                dangerouslySetInnerHTML={{ __html: passageContent }}
              />
            </Box>
          </Box>

          {/* GIỮA: THANH KÉO (DRAG DIVIDER) */}
          <Box
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onDragStart={(e) => e.preventDefault()}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              cursor: 'col-resize',
              flexShrink: 0,
              zIndex: 10,
              position: 'relative',
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            <Box
              sx={{ width: 2, height: '100%', bgcolor: isDragging ? 'warning.main' : 'divider' }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid',
                borderColor: isDragging ? 'warning.main' : 'divider',
                backgroundColor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              ⇔
            </Box>
          </Box>

          {/* PHẢI: CÂU HỎI TRẮC NGHIỆM */}
          <Box
            sx={{
              ...listeningPartStyles.questionSection,
              width: { xs: '100%', md: `calc(${100 - leftWidth}% - 32px)` },
              minWidth: { md: '400px' },
              height: '100%',
              overflowY: 'auto',
              minHeight: 0,
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
            <Box sx={listeningPartStyles.innerInstruction}>
              <LightbulbOutlinedIcon />
              <Typography sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
                Read the passage on the left and choose the correct answer for each question.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {questions.map((question, index) => {
                const selectedValue = answers[question.id] || '';
                const correctOption = question.options?.find((o) => o.isCorrect);
                const correctAnswerText = correctOption ? correctOption.label : '';

                return (
                  <Box
                    key={question.id || index}
                    id={`question-${question.id}`}
                    sx={listeningPartStyles.questionContainerCol}
                  >
                    <Box sx={listeningPartStyles.questionTextContainer}>
                      <Typography sx={listeningPartStyles.questionLabelRectangle}>
                        {question.question_number || index + 1}
                      </Typography>
                      <Typography
                        sx={listeningPartStyles.questionText}
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />
                    </Box>
                    <Box
                      sx={{ ...listeningPartStyles.audioAndOptionsContainer, pl: { xs: 0, md: 4 } }}
                    >
                      <Box sx={listeningPartStyles.optionsGridRow}>
                        <RadioGroup
                          value={selectedValue}
                          onChange={(e) => handleAnswerSelection(question.id, e.target.value)}
                          sx={{ gap: 1 }}
                        >
                          {question.options?.map((option, optIndex) => {
                            const isSelected = selectedValue === option.value;
                            const isCorrect = option.isCorrect;

                            return (
                              <Box
                                key={optIndex}
                                onClick={() => {
                                  if (!showResults)
                                    handleAnswerSelection(question.id, option.value);
                                }}
                                sx={{
                                  ...multipleChoiceStyles.optionContainer,
                                  cursor: showResults ? 'default' : 'pointer',
                                  ...(showResults &&
                                    isSelected && {
                                      border: `1px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
                                      backgroundColor: isCorrect
                                        ? 'rgba(76, 175, 80, 0.05)'
                                        : 'rgba(244, 67, 54, 0.05)',
                                    }),
                                }}
                              >
                                <Radio
                                  disabled={showResults}
                                  checked={isSelected}
                                  value={option.value}
                                  icon={
                                    <RadioButtonUncheckedIcon
                                      sx={multipleChoiceStyles.uncheckIcon}
                                    />
                                  }
                                  checkedIcon={
                                    <Box sx={multipleChoiceStyles.checkedIconWrapper}>
                                      <RadioButtonUncheckedIcon
                                        sx={{
                                          ...multipleChoiceStyles.outerCircle,
                                          ...(showResults &&
                                            isSelected && {
                                              color: isCorrect ? 'success.main' : 'error.main',
                                            }),
                                        }}
                                      />
                                      <CircleIcon
                                        sx={{
                                          ...multipleChoiceStyles.innerCircle,
                                          ...(showResults &&
                                            isSelected && {
                                              color: isCorrect ? 'success.main' : 'error.main',
                                            }),
                                        }}
                                      />
                                    </Box>
                                  }
                                  sx={{
                                    ...multipleChoiceStyles.checkboxRoot,
                                    ...(showResults &&
                                      isSelected && {
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
                                    ...(showResults &&
                                      isSelected && {
                                        color: isCorrect ? '#4caf50' : '#f44336',
                                        fontWeight: 600,
                                      }),
                                  }}
                                >
                                  {option.option_label || option.value}.
                                </Typography>
                                <Typography
                                  sx={{
                                    ...multipleChoiceStyles.optionLabel,
                                    fontWeight: 400,
                                    flex: 1,
                                    ...(showResults &&
                                      isSelected && {
                                        color: isCorrect ? '#4caf50' : '#f44336',
                                        fontWeight: 500,
                                      }),
                                  }}
                                >
                                  {option.answer_text || option.text || option.label}
                                </Typography>
                                {showResults && isCorrect && (
                                  <Chip
                                    label="Correct"
                                    size="small"
                                    color="success"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      ml: 1,
                                      display: { xs: 'none', md: 'block' },
                                    }}
                                  />
                                )}
                              </Box>
                            );
                          })}
                        </RadioGroup>
                      </Box>
                    </Box>

                    {showResults && correctOption && (
                      <Box sx={{ pr: { xs: 0, md: 4 }, pl: { xs: 0, md: 4 }, width: '100%' }}>
                        <Box sx={{ ...listeningPartStyles.explanationContainer }}>
                          <Typography sx={listeningPartStyles.correctText}>
                            Correct Answer: {correctOption.option_label}. {correctAnswerText}
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
          </Box>
        </Box>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ display: 'block', width: '100%', height: '100%' }}>
      {showResults ? (
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', md: 'row' },
            alignItems: 'flex-start',
            pr: { xs: 0, md: 2 },
            bgcolor: 'background.gray',
          }}
        >
          <Box sx={{ flex: { xs: 1, md: 4 }, width: '100%', height: '100%' }}>{mainContent}</Box>
          <SumaryPartTab
            questions={partQuestions}
            onNavigateToQuestion={handleNavigateToQuestion}
          />
        </Container>
      ) : (
        mainContent
      )}
    </Box>
  );
};

export default MultiChoiceContent;
