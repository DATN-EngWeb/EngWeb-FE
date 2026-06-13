'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Container, Typography, TextField, Radio, RadioGroup, Chip } from '@mui/material';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import 'ckeditor5/ckeditor5.css';
import {
  containerStyles,
  passageTitleStyles,
  rightPaneStyles,
} from '@/styles/Reading/FillBlanksStyles';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '@/styles/Teacher/Reading/QuesitonTypeStyles';
import SumaryPartTab from '../../Student/ListeningTest/part/sumaryPartTab';

const textWrapStyles = {
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
};

const FillBlanksContent = ({
  passage = '',
  passageTitle = '',
  blanks = [],
  questions = [],
  answers = {},
  showResults = false,
  onAnswerChange = () => {},
}) => {
  const pathname = usePathname();
  const isTeacherView =
    pathname?.includes('/teacher/view-test/') ||
    pathname?.includes('/teacher/upload-test/') ||
    pathname?.includes('/teacher/update-test/') ||
    pathname?.includes('/teacher/review-test/');

  const showSummary = showResults && !isTeacherView;

  const [leftWidth, setLeftWidth] = useState(55);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);
  const [passageContent, setPassageContent] = useState(passage);

  const [targetQuestionId, setTargetQuestionId] = useState(null);

  // Lấy nội dung bài đọc từ URL nếu passage là một link lưu trữ (Google Cloud Storage)
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
          // eslint-disable-next-line no-console
          console.error('Failed to fetch passage content:', error);
        }
      }
    };
    fetchContent();
  }, [passage]);

  // Xử lý logic kéo thả chuột hoặc cảm ứng để thay đổi tỷ lệ chiều rộng 2 cột trái/phải
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

  // Cập nhật state đáp án cục bộ và truyền dữ liệu lên component cha qua onAnswerChange
  const handleAnswerChangeLocal = (questionOrBlankId, value) => {
    if (showResults) return;
    onAnswerChange({ ...answers, [questionOrBlankId]: value });
  };

  const isMultiChoiceFormat =
    questions &&
    questions.length > 0 &&
    questions.some(
      (q) => q.options && q.options.length > 1 && q.options.some((opt) => !!opt.option_label),
    );

  // Tự động cuộn mượt và tạo hiệu ứng nhún (bounce) tới câu hỏi được click từ bảng tóm tắt
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

  // Đánh giá trạng thái đã trả lời và đúng/sai cho từng ô trống để render trên SumaryPartTab
  const partQuestions = showSummary
    ? isMultiChoiceFormat
      ? questions.map((q) => {
          const selectedValue = answers[q.id];
          const isAnswered =
            selectedValue !== undefined && selectedValue !== null && selectedValue !== '';
          const selectedOption = q.options?.find((o) => o.value === selectedValue);
          const isCorrect = selectedOption?.isCorrect || false;

          return { id: q.id, isAnswered, isCorrect };
        })
      : blanks.map((num) => {
          const qInfo = questions.find((qu) => qu.question_number === num);
          const questionId = qInfo?.id || num;
          const userAns = answers[questionId] || '';
          const isAnswered = userAns.trim().length > 0;

          const correctOptions = qInfo?.options?.filter((o) => o.isCorrect) || [];
          const correctTexts = correctOptions
            .map((o) => o.answer_text || o.label || '')
            .filter((t) => t.trim() !== '');
          const allCorrectTexts =
            correctTexts.length > 0 ? correctTexts : [qInfo?.correctText || ''];

          const isCorrect = allCorrectTexts.some(
            (text) => userAns.toLowerCase().trim() === text.toLowerCase().trim(),
          );

          return { id: questionId, isAnswered, isCorrect };
        })
    : [];

  // Kích hoạt cuộn màn hình đến vị trí câu hỏi mục tiêu khi click trên bảng tóm tắt
  const handleNavigateToQuestion = (questionId) => {
    setTargetQuestionId(questionId);
  };

  const mainContent = (
    <Box sx={{ ...containerStyles, flex: 1, width: '100%', overflow: 'hidden' }}>
      <Container maxWidth={false} disableGutters sx={{ height: '100%', px: 0 }}>
        {/* Box chính chứa cả bài đọc (cột trái) và danh sách câu hỏi/ô điền (cột phải) */}
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
            {passageTitle && (
              <Typography sx={{ ...passageTitleStyles, ...textWrapStyles }}>
                {passageTitle}
              </Typography>
            )}
            <Box
              className="ck-content"
              sx={{
                ...listeningPartStyles.passageContainer,
                ...textWrapStyles,
                '& p > img': {
                  display: 'inline-block',
                  verticalAlign: 'bottom',
                  margin: '0 8px',
                  maxWidth: '100%',
                },
                '& a': {
                  color: '#0000EE',
                  textDecoration: 'underline',
                  ['&:hover']: {
                    color: '#000099',
                    cursor: 'pointer',
                  },
                },
              }}
              dangerouslySetInnerHTML={{ __html: passageContent }}
            />
          </Box>
          {/* Thanh điều khiển (divider) cho phép người dùng kéo qua lại để đổi chiều rộng cột */}
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
          {/* Khu vực bên phải: Hiển thị hướng dẫn và danh sách các câu hỏi/ô điền từ */}
          <Box
            sx={{
              ...rightPaneStyles,
              flex: '0 0 auto',
              width: { xs: '100%', md: `calc(${100 - leftWidth}% - 32px)` },
              minWidth: { md: '400px' },
              height: '100%',
              maxHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              containerType: 'inline-size',
              containerName: 'rightPanel',
              p: 0,
            }}
          >
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
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
              <Box sx={listeningPartStyles.instructionContainer}>
                <ErrorRoundedIcon sx={{ color: 'red.text', fontSize: '1.5rem', mt: 0.2 }} />
                <Box sx={listeningPartStyles.instructionWrapper}>
                  <Typography
                    sx={{ color: 'red.text', fontSize: '1rem', fontWeight: 600, mb: 0.5 }}
                  >
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
                    Read the passage on the left and fill in the blanks with the correct words.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ ...listeningPartStyles.questionSection, mt: 2 }}>
                <Box
                  sx={{
                    ...listeningPartStyles.listQuestionContainerGrid,
                    gridTemplateColumns: isMultiChoiceFormat ? '1fr' : 'repeat(2, 1fr)',
                    gap: isMultiChoiceFormat ? 3 : 1,
                    '@container rightPanel (max-width: 400px)': {
                      display: 'grid',
                      gridTemplateColumns: '1fr !important',
                    },
                  }}
                >
                  {/* Tùy thuộc vào định dạng dữ liệu, render dạng trắc nghiệm hoặc ô nhập liệu (TextField) */}
                  {isMultiChoiceFormat
                    ? questions.map((q, idx) => {
                        const selectedVal = answers[q.id] || '';
                        const qInfo = questions.find((qu) => qu.id === q.id);

                        const correctOption = qInfo?.options?.find((o) => o.isCorrect);
                        const correctAnswerText = correctOption ? correctOption.label : '';

                        return (
                          <Box
                            key={q.id || idx}
                            id={`question-${q.id}`}
                            sx={listeningPartStyles.questionContainerCol}
                          >
                            <Box sx={listeningPartStyles.questionTextContainer}>
                              <Typography sx={listeningPartStyles.questionLabelRectangle}>
                                {q.question_number || idx + 1}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                ...listeningPartStyles.audioAndOptionsContainer,
                                pl: { xs: 0, md: 4 },
                              }}
                            >
                              <Box sx={listeningPartStyles.optionsGridRow}>
                                <RadioGroup
                                  value={selectedVal}
                                  onChange={(e) => handleAnswerChangeLocal(q.id, e.target.value)}
                                  sx={{ gap: 1 }}
                                >
                                  {q.options?.map((option, optIndex) => {
                                    const isSelected = selectedVal === option.value;
                                    const isCorrect = option.isCorrect;

                                    return (
                                      <Box
                                        key={optIndex}
                                        onClick={() => {
                                          if (!showResults)
                                            handleAnswerChangeLocal(q.id, option.value);
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
                                                      color: isCorrect
                                                        ? 'success.main'
                                                        : 'error.main',
                                                    }),
                                                }}
                                              />
                                              <CircleIcon
                                                sx={{
                                                  ...multipleChoiceStyles.innerCircle,
                                                  ...(showSummary &&
                                                    isSelected && {
                                                      color: isCorrect
                                                        ? 'success.main'
                                                        : 'error.main',
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
                                            ...textWrapStyles,
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
                                              display: { xs: 'none', md: 'inline-flex' },
                                            }}
                                          />
                                        )}
                                      </Box>
                                    );
                                  })}
                                </RadioGroup>
                              </Box>
                            </Box>

                            {showSummary && (
                              <Box
                                sx={{ pr: { xs: 0, md: 4 }, pl: { xs: 0, md: 4 }, width: '100%' }}
                              >
                                <Box sx={{ ...listeningPartStyles.explanationContainer }}>
                                  <Typography
                                    sx={{ ...listeningPartStyles.correctText, ...textWrapStyles }}
                                  >
                                    Correct Answer: {correctOption?.option_label}.{' '}
                                    {correctAnswerText}
                                  </Typography>
                                  {qInfo?.explanation && (
                                    <Typography
                                      sx={{
                                        ...listeningPartStyles.explanationText,
                                        ...textWrapStyles,
                                      }}
                                    >
                                      <strong>Explanation:</strong> {qInfo.explanation}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        );
                      })
                    : blanks.map((num) => {
                        const qInfo = questions.find((qu) => qu.question_number === num);
                        const questionId = qInfo?.id || num;
                        const userAns = answers[questionId] || '';
                        const isAnswered = userAns.trim().length > 0;

                        const correctOptions = qInfo?.options?.filter((o) => o.isCorrect) || [];
                        const correctTexts = correctOptions
                          .map((o) => o.answer_text || o.label || '')
                          .filter((t) => t.trim() !== '');
                        const allCorrectTexts =
                          correctTexts.length > 0 ? correctTexts : [qInfo?.correctText || ''];

                        const isCorrect = allCorrectTexts.some(
                          (text) => userAns.toLowerCase().trim() === text.toLowerCase().trim(),
                        );

                        const displayCorrectText = allCorrectTexts.join(' / ');

                        return (
                          <Box
                            key={questionId}
                            id={`question-${questionId}`}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              width: '100%',
                              mb: showSummary ? 3 : 1,
                            }}
                          >
                            <Box
                              sx={{
                                ...listeningPartStyles.questionContainerRow,
                                mb: showSummary ? 1 : 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  ...listeningPartStyles.questionLabelCircle,
                                  ...(showSummary &&
                                    isAnswered && {
                                      backgroundColor: isCorrect ? 'success.main' : 'error.main',
                                      color: '#fff',
                                      border: 'none',
                                    }),
                                }}
                              >
                                {num}
                              </Typography>
                              <TextField
                                fullWidth
                                disabled={showResults}
                                variant="standard"
                                placeholder="Type answer ..."
                                value={userAns}
                                onChange={(e) =>
                                  handleAnswerChangeLocal(questionId, e.target.value)
                                }
                                autoComplete="off"
                                sx={{
                                  ...listeningPartStyles.inputQuestion,
                                  ...(showSummary &&
                                    isAnswered && {
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
                              />
                            </Box>

                            {/* Hiển thị đáp án đúng và lời giải chi tiết khi xem lại kết quả bài làm */}
                            {showSummary && (
                              <Box sx={listeningPartStyles.explanationContainer}>
                                <Typography
                                  sx={{ ...listeningPartStyles.correctText, ...textWrapStyles }}
                                >
                                  Correct Answer: {displayCorrectText}
                                </Typography>
                                {qInfo?.explanation && (
                                  <Typography
                                    sx={{
                                      ...listeningPartStyles.explanationText,
                                      ...textWrapStyles,
                                    }}
                                  >
                                    <strong>Explanation:</strong> {qInfo.explanation}
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

export default FillBlanksContent;
