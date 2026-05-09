'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Select, MenuItem, FormControl } from '@mui/material';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '@/styles/Teacher/Reading/QuesitonTypeStyles';
import SumaryPartTab from '../../Student/ListeningTest/part/sumaryPartTab';

import {
  containerStyles,
  passageTitleStyles,
  rightPaneStyles,
} from '@/styles/Reading/MatchingStyles';

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
  const [leftWidth, setLeftWidth] = useState(55); // percentage width for passage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);
  const [passageContent, setPassageContent] = useState(passage);
  const [processedSentences, setProcessedSentences] = useState(sentences);

  const [targetQuestionId, setTargetQuestionId] = useState(null);

  // Fetch passage content if it's a URL
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

  // Fetch sentence content if it's a URL
  useEffect(() => {
    setProcessedSentences(sentences);
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
              return { ...s, text };
            } catch (error) {
              console.error('Failed to fetch sentence content:', error);
              return s;
            }
          }
          return s;
        }),
      );
      setProcessedSentences(newSentences);
    };
    fetchSentences();
  }, [sentences]);

  // Handle drag to resize panes on desktop
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

  const handleAnswerChangeLocal = (gapNumber, value) => {
    if (showResults) return;

    const question = questions.find((q) => q.question_number === gapNumber);
    if (!question) return;

    onAnswerChange({
      ...answers,
      [question.id]: value,
    });
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
        let userAnsRaw =
          answers[q?.id] !== undefined && answers[q?.id] !== null
            ? String(answers[q?.id]).trim()
            : '';
        let userAns = userAnsRaw;

        // Map ID sang chữ cái nếu cần thiết như logic render
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

  const renderPassageWithGaps = () => {
    if (!passageContent) return null;

    const processedPassage = passageContent.replace(/\[(\d+)\]/g, (match, number) => {
      return `<span style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; margin: 0 4px; vertical-align: middle; background-color: #FFF3E0; color: #E65100; border: 1px solid #FFB74D; border-radius: 6px; font-weight: 700; font-size: 0.9rem; cursor: default; user-select: none;">${number}</span>`;
    });

    return <div dangerouslySetInnerHTML={{ __html: processedPassage }} />;
  };

  // Tách riêng nội dung chính thành một biến để dễ bọc Layout với SumaryPartTab
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
          {/* TRÁI: PASSAGE (BÀI ĐỌC) */}
          <Box
            sx={{
              ...listeningPartStyles.basicFlexColCenStart,
              width: { xs: '100%', md: `${leftWidth}%` },
              mb: { xs: 2, md: 0 }, // Thêm margin bottom trên mobile cho thoáng
              height: '100%',
              overflowY: 'auto',
              minHeight: 0,
              // Giữ lại custom scrollbar cho Reading
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
            {passageTitle && <Typography sx={passageTitleStyles}>{passageTitle}</Typography>}
            <Box sx={listeningPartStyles.passageContainer}>{renderPassageWithGaps()}</Box>
          </Box>
          {/* GIỮA: DRAG DIVIDER (THANH KÉO) */}
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
          {/* PHẢI: QUESTIONS (CÂU HỎI MATCHING) */}
          <Box
            sx={{
              ...rightPaneStyles,
              flex: '0 0 auto',
              width: { xs: '100%', md: `calc(${100 - leftWidth}% - 32px)` },
              height: '100%',
              maxHeight: '100%',
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
              {/* Instruction Section */}
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
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-word',
                    }}
                  >
                    Read the passage on the left and match the correct sentences or headings to each
                    person or category.
                  </Typography>
                </Box>
              </Box>
              {/* Content Section */}
              <Box sx={listeningPartStyles.questionSection}>
                <Box sx={listeningPartStyles.innerInstruction}>
                  <Typography sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
                    Match the questions with the correct options.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    ...listeningPartStyles.matchingQuestionAnswerContainerGrid,
                    gridTemplateColumns: '5fr 5fr',
                    '@container rightPanel (max-width: 500px)': {
                      display: 'grid',
                      gridTemplateColumns: '1fr !important',
                    },
                  }}
                >
                  {/* CỘT TRÁI: DANH SÁCH CÂU HỎI (CÁC GAPS VÀ Ô CHỌN ĐÁP ÁN) */}
                  <Box sx={listeningPartStyles.questionContainerCol}>
                    {gaps.map((gapNumber) => {
                      const q = questions.find((qu) => qu.question_number === gapNumber);

                      // 1. Lấy answer gốc từ props
                      let userAnsRaw =
                        answers[q?.id] !== undefined && answers[q?.id] !== null
                          ? String(answers[q?.id]).trim()
                          : '';
                      let userAns = userAnsRaw;

                      // 2. Nếu answer là một ID (chuỗi số), map nó sang nhãn A, B, C... dựa vào processedSentences
                      if (/^\d+$/.test(userAnsRaw)) {
                        const sentenceIndex = processedSentences.findIndex(
                          (s) => s.id === parseInt(userAnsRaw, 10),
                        );
                        if (sentenceIndex !== -1) {
                          userAns = String.fromCharCode(65 + sentenceIndex);
                        } else {
                          userAns = ''; // fallback nếu không tìm thấy ID
                        }
                      }

                      // 3. Sử dụng userAns đã được map cho UI
                      const isAnswered = userAns.trim().length > 0;
                      const isCorrect = showResults ? userAns === q?.correctLabel : null;

                      return (
                        <Box
                          key={gapNumber}
                          id={`question-${q?.id}`}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            mb: showResults ? 2 : 0,
                          }}
                        >
                          <Box
                            sx={{
                              ...listeningPartStyles.questionContainerRow,
                              mb: showResults ? 1 : 0,
                              justifyContent: 'space-between', // Đẩy vòng tròn và Select ra 2 mép
                              gap: 2,
                            }}
                          >
                            {/* Vòng tròn số */}
                            <Typography
                              sx={{
                                ...listeningPartStyles.questionLabelCircle,
                                ...(showResults &&
                                  isAnswered && {
                                    backgroundColor: isCorrect ? 'success.main' : 'error.main',
                                    color: '#fff',
                                    border: 'none',
                                  }),
                              }}
                            >
                              {gapNumber}
                            </Typography>

                            {/* Ô Select chọn đáp án A, B, C... */}
                            <FormControl
                              sx={{
                                width: '100%',
                                maxWidth: '150px', // Đặt max width để không bị giãn quá to
                              }}
                            >
                              <Select
                                value={userAns}
                                onChange={(e) => handleAnswerChangeLocal(gapNumber, e.target.value)}
                                displayEmpty
                                disabled={showResults}
                                sx={{
                                  height: 44,
                                  width: '100%',
                                  borderRadius: '1rem',
                                  fontSize: { xs: '0.7rem', md: '0.9rem' },
                                  backgroundColor: '#fff',
                                  '& .MuiSelect-select': {
                                    py: 1,
                                    px: 2,
                                  },
                                  ...(showResults &&
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

                          {/* HIỂN THỊ ĐÁP ÁN ĐÚNG VÀ GIẢI THÍCH KHI CÓ KẾT QUẢ */}
                          {showResults && (
                            <Box sx={listeningPartStyles.explanationContainer}>
                              <Typography sx={listeningPartStyles.correctText}>
                                Correct Answer: {q?.correctLabel || 'N/A'}
                              </Typography>
                              {q?.explanation && (
                                <Typography sx={listeningPartStyles.explanationText}>
                                  <strong>Explanation:</strong> {q.explanation}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                  {/* CỘT PHẢI: DANH SÁCH CÁC LỰA CHỌN ĐỂ MATCH (A. Text, B. Text...) */}
                  <Box sx={{ ...listeningPartStyles.questionContainerCol, gap: 0 }}>
                    {processedSentences.map((sentence, index) => (
                      <Box
                        key={`${sentence.id}-${index}`}
                        sx={{
                          ...listeningPartStyles.questionContainerRow,
                          border: 'none',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Typography
                          sx={{
                            ...multipleChoiceStyles.optionLabel,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {String.fromCharCode(65 + index)}.
                        </Typography>
                        <Typography
                          sx={{
                            ...multipleChoiceStyles.optionLabel,
                            fontWeight: 400,
                            wordBreak: 'break-word',
                          }}
                          dangerouslySetInnerHTML={{ __html: sentence.text }}
                        />
                      </Box>
                    ))}
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

export default MatchingContent;
