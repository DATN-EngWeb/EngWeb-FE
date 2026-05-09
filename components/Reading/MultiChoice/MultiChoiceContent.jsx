'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const isTeacherView = pathname?.includes('/teacher/view-test/');
  const showSummary = showResults && !isTeacherView;

  const [leftWidth, setLeftWidth] = useState(55);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);
  const [passageContent, setPassageContent] = useState(passage);

  const [targetQuestionId, setTargetQuestionId] = useState(null);

  // Lấy nội dung bài đọc từ URL nếu passage là một link lưu trữ (như Google Cloud Storage)
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

  // Xử lý sự kiện kéo thả chuột hoặc cảm ứng để thay đổi tỷ lệ chiều rộng 2 cột trái/phải
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

  // Lưu trữ đáp án người dùng chọn và truyền lên component cha thông qua onAnswerChange
  const handleAnswerSelection = (questionId, value) => {
    if (showResults) return;
    onAnswerChange({ ...answers, [questionId]: value });
  };

  // Tự động cuộn mượt và thêm hiệu ứng nhún (bounce) tới câu hỏi được chọn từ bảng tóm tắt
  useEffect(() => {
    if (targetQuestionId && showSummary) {
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
  }, [targetQuestionId, showSummary]);

  // Đánh giá trạng thái đúng/sai của từng câu hỏi để hiển thị bên trong SumaryPartTab
  const partQuestions = showSummary
    ? questions.map((q) => {
        const selectedValue = answers[q.id];
        const isAnswered =
          selectedValue !== undefined && selectedValue !== null && selectedValue !== '';

        const selectedOption = q.options?.find((o) => o.value === selectedValue);
        const isCorrect = selectedOption?.isCorrect || false;

        return {
          id: q.id,
          isAnswered,
          isCorrect,
        };
      })
    : [];

  // Đặt ID mục tiêu để kích hoạt trigger cuộn đến câu hỏi khi nhấn vào bảng tóm tắt
  const handleNavigateToQuestion = (questionId) => {
    setTargetQuestionId(questionId);
  };

  const mainContent = (
    <Box sx={{ ...containerStyles, flex: 1, width: '100%', overflow: 'hidden' }}>
      <Container maxWidth={false} disableGutters sx={{ height: '100%', px: 0 }}>
        {/* Layout chính chứa cột bài đọc (trái), thanh chia (giữa) và danh sách câu hỏi (phải) */}
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

          {/* Khu vực cột phải: Hiển thị hướng dẫn, danh sách các câu hỏi và tùy chọn */}
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

            {/* Vòng lặp render từng câu hỏi trắc nghiệm và danh sách các phương án A, B, C, D */}
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
                                  ...(showSummary &&
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
                                          ...(showSummary &&
                                            isSelected && {
                                              color: isCorrect ? 'success.main' : 'error.main',
                                            }),
                                        }}
                                      />
                                      <CircleIcon
                                        sx={{
                                          ...multipleChoiceStyles.innerCircle,
                                          ...(showSummary &&
                                            isSelected && {
                                              color: isCorrect ? 'success.main' : 'error.main',
                                            }),
                                        }}
                                      />
                                    </Box>
                                  }
                                  sx={{
                                    ...multipleChoiceStyles.checkboxRoot,
                                    ...(showSummary &&
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
                                    ...(showSummary &&
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
                                    ...(showSummary &&
                                      isSelected && {
                                        color: isCorrect ? '#4caf50' : '#f44336',
                                        fontWeight: 500,
                                      }),
                                  }}
                                >
                                  {option.answer_text || option.text || option.label}
                                </Typography>
                                {showSummary && isCorrect && (
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

                    {/* Hiển thị đáp án đúng và lời giải chi tiết (explanation) khi xem lại kết quả bài làm */}
                    {showSummary && correctOption && (
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
      {showSummary ? (
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
