/* global IntersectionObserver */
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Container, Typography, Select, MenuItem, FormControl } from '@mui/material';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import SumaryPartTab from '../../Student/ListeningTest/part/sumaryPartTab';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '@/styles/Teacher/Reading/QuesitonTypeStyles';
import {
  containerStyles,
  passageTitleStyles,
  rightPaneStyles,
} from '@/styles/Reading/MatchingStyles';
import { cleanBase64Images } from '@/utils/stringFormat';
import 'ckeditor5/ckeditor5.css';

const textWrapStyles = {
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
};

const MatchingContent = ({
  passage = '',
  passageTitle = '',
  sentences = [],
  gaps = [],
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

  const [processedSentences, setProcessedSentences] = useState(sentences);

  const [targetQuestionId, setTargetQuestionId] = useState(null);

  const [openSelectId, setOpenSelectId] = useState(null);

  useEffect(() => {
    if (openSelectId === null) return;

    const element = document.getElementById(`select-${openSelectId}`);
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            setOpenSelectId(null);
          }
        });
      },
      { root: null, threshold: 0 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [openSelectId]);

  // Lấy nội dung bài đọc từ URL nếu passage là một link lưu trữ (Google Cloud Storage)
  useEffect(() => {
    setPassageContent(cleanBase64Images(passage));
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
          setPassageContent(cleanBase64Images(text));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch passage content:', error);
        }
      }
    };
    fetchContent();
  }, [passage]);

  // Tải nội dung cho từng câu/đoạn văn cần nối nếu dữ liệu trả về là dạng link (URL)
  useEffect(() => {
    setProcessedSentences(sentences.map((s) => ({ ...s, text: cleanBase64Images(s.text) })));
    const fetchSentences = async () => {
      const newSentences = await Promise.all(
        sentences.map(async (s) => {
          if (
            s.text &&
            typeof s.text === 'string' &&
            s.text.startsWith('http') &&
            s.text.includes('storage.googleapis.com')
          ) {
            try {
              const response = await fetch(s.text);
              const text = await response.text();
              return { ...s, text: cleanBase64Images(text) };
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Failed to fetch sentence content:', error);
              return { ...s, text: cleanBase64Images(s.text) };
            }
          }
          return { ...s, text: cleanBase64Images(s.text) };
        }),
      );
      setProcessedSentences(newSentences);
    };
    fetchSentences();
  }, [sentences]);

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
        const clamped = Math.min(75, Math.max(25, newLeftWidth));
        setLeftWidth(clamped);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerLeft = containerRect.left;
      const containerWidth = containerRect.width;

      if (!containerWidth) return;

      const relativeX = clientX - containerLeft;
      const newLeftWidth = (relativeX / containerWidth) * 100;
      const clamped = Math.min(75, Math.max(25, newLeftWidth));
      setLeftWidth(clamped);
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

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  // Lưu đáp án nối cục bộ của người dùng và truyền lên component cha qua hàm onAnswerChange
  const handleAnswerChangeLocal = (gapNumber, value) => {
    if (showResults) return;

    const question = questions.find((q) => q.question_number === gapNumber);
    if (!question) return;

    const newAnswers = { ...answers };

    if (value !== '') {
      // Chỉ kiểm tra duplicate trong phạm vi các câu hỏi của Matching part này,
      // tránh vô tình xóa đáp án của các format khác (MultiChoice, FillBlanks)
      // đang dùng chung cùng một flat answers object.
      const matchingQuestionIds = new Set(questions.map((q) => String(q.id)));

      Object.keys(newAnswers).forEach((key) => {
        if (!matchingQuestionIds.has(key)) return; // Bỏ qua key của format khác

        let existingValue = String(newAnswers[key]).trim();
        if (/^\d+$/.test(existingValue)) {
          const sentenceIndex = processedSentences.findIndex(
            (s) => s.id === parseInt(existingValue, 10),
          );
          if (sentenceIndex !== -1) {
            existingValue = String.fromCharCode(65 + sentenceIndex);
          }
        }
        if (existingValue === value) {
          delete newAnswers[key];
        }
      });
    }

    newAnswers[question.id] = value;

    onAnswerChange(newAnswers);
  };

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

  // Chuyển đổi đáp án nối của người dùng thành định dạng chuẩn để chấm điểm trong SumaryPartTab
  const partQuestions = showSummary
    ? questions.map((q) => {
        let userAnsRaw =
          answers[q?.id] !== undefined && answers[q?.id] !== null
            ? String(answers[q?.id]).trim()
            : '';
        let userAns = userAnsRaw;

        if (/^\d+$/.test(userAnsRaw)) {
          const sentenceIndex = processedSentences.findIndex(
            (s) => s.id === parseInt(userAnsRaw, 10),
          );
          if (sentenceIndex !== -1) {
            userAns = String.fromCharCode(65 + sentenceIndex);
          } else {
            userAns = '';
          }
        }

        const isAnswered = userAns.trim().length > 0;
        const isCorrect = userAns === q?.correctLabel;

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

  const mainContent = (
    <Box sx={{ ...containerStyles, flex: 1, width: '100%', overflow: 'hidden' }}>
      <Container maxWidth={false} disableGutters sx={{ height: '100%', px: 0 }}>
        {/* Box chính chứa cả bài đọc (cột trái) và phần câu hỏi/câu trả lời nối (cột phải) */}
        <Box
          ref={containerRef}
          sx={{
            ...listeningPartStyles.containerColRow,
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
              maxHeight: { xs: 'none', md: 'calc(100vh - 32px)' },
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
          {/* Thanh điều khiển (divider) cho phép người dùng kéo qua lại để đổi chiều rộng 2 cột */}
          <Box
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onDragStart={(e) => e.preventDefault()}
            sx={{
              position: 'relative',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              cursor: 'col-resize',
              flexShrink: 0,
              zIndex: 10,
              userSelect: 'none',
              touchAction: 'none',
            }}
            role="separator"
          >
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
          {/* Khu vực bên phải: Hiển thị hướng dẫn và phần tương tác chọn đáp án nối (Matching) */}
          <Box
            sx={{
              ...rightPaneStyles,
              flex: '0 0 auto',
              width: { xs: '100%', md: `calc(${100 - leftWidth}% - 32px)` },
              maxHeight: { xs: 'none', md: 'calc(100vh - 32px)' },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              p: 0,
              containerType: 'inline-size',
              containerName: 'rightPanel',
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
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
                    Read the passage on the left and match the correct sentences or headings to each
                    person or category.
                  </Typography>
                </Box>
              </Box>
              <Box sx={listeningPartStyles.questionSection}>
                <Box
                  sx={{
                    ...listeningPartStyles.matchingQuestionAnswerContainerGrid,
                    gridTemplateColumns: '1fr',
                    '@container rightPanel (max-width: 500px)': {
                      display: 'grid',
                      gridTemplateColumns: '1fr !important',
                    },
                  }}
                >
                  <Box sx={{ ...listeningPartStyles.questionContainerCol, gap: 2 }}>
                    {gaps.map((gapNumber, index) => {
                      const q = questions.find((qu) => qu.question_number === gapNumber);

                      let userAnsRaw =
                        answers[q?.id] !== undefined && answers[q?.id] !== null
                          ? String(answers[q?.id]).trim()
                          : '';
                      let userAns = userAnsRaw;

                      if (/^\d+$/.test(userAnsRaw)) {
                        const sentenceIndex = processedSentences.findIndex(
                          (s) => s.id === parseInt(userAnsRaw, 10),
                        );
                        if (sentenceIndex !== -1) {
                          userAns = String.fromCharCode(65 + sentenceIndex);
                        } else {
                          userAns = '';
                        }
                      }

                      const isAnswered = userAns.trim().length > 0;
                      const isCorrect = showSummary ? userAns === q?.correctLabel : null;

                      const sentenceText =
                        processedSentences[index]?.text || q?.text || q?.question_content || '';

                      return (
                        <Box
                          key={gapNumber}
                          id={`question-${q?.id}`}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            mb: showSummary ? 2 : 0,
                          }}
                        >
                          <Box
                            sx={{
                              ...listeningPartStyles.questionContainerRow,
                              mb: showSummary ? 1 : 0,
                              justifyContent: 'flex-start',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            {/* 1. Label: Số thứ tự */}
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
                              {gapNumber}
                            </Typography>

                            {/* 2. Text: Nội dung câu */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  ...multipleChoiceStyles.optionLabel,
                                  ...textWrapStyles,
                                  fontWeight: 400,
                                }}
                                dangerouslySetInnerHTML={{ __html: sentenceText }}
                              />
                            </Box>

                            {/* 3. Select: Cho phép chọn A, B, C, D */}
                            <FormControl
                              id={`select-${gapNumber}`}
                              sx={{
                                minWidth: '90px',
                                flexShrink: 0,
                              }}
                            >
                              <Select
                                value={userAns}
                                onChange={(e) => handleAnswerChangeLocal(gapNumber, e.target.value)}
                                open={openSelectId === gapNumber}
                                onOpen={() => setOpenSelectId(gapNumber)}
                                onClose={() => setOpenSelectId(null)}
                                displayEmpty
                                disabled={showResults}
                                MenuProps={{ disableScrollLock: true }}
                                sx={{
                                  height: 44,
                                  width: '100%',
                                  borderRadius: '1rem',
                                  fontSize: { xs: '0.85rem', md: '1rem' },
                                  backgroundColor: '#fff',
                                  '& .MuiSelect-select': {
                                    py: 1,
                                    px: 2,
                                  },
                                  ...(showSummary &&
                                    isAnswered && {
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
                                {processedSentences
                                  .map((_, idx) => String.fromCharCode(65 + idx))
                                  .map((label) => (
                                    <MenuItem key={label} value={label}>
                                      {label}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </Box>

                          {showSummary && (
                            <Box sx={listeningPartStyles.explanationContainer}>
                              <Typography
                                sx={{ ...listeningPartStyles.correctText, ...textWrapStyles }}
                              >
                                Correct Answer: {q?.correctLabel || 'N/A'}
                              </Typography>
                              {q?.explanation && (
                                <Typography
                                  sx={{
                                    ...listeningPartStyles.explanationText,
                                    ...textWrapStyles,
                                    whiteSpace: 'pre-line',
                                  }}
                                >
                                  <strong>Explanation:</strong> {q.explanation}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>{' '}
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

export default MatchingContent;
