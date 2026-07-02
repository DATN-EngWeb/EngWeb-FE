'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Container, Typography, Radio, RadioGroup, Chip } from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import {
  containerStyles,
  passageTitleStyles,
  passageTextStyles,
  rightPaneStyles,
} from '@/styles/Reading/MultiChoiceReadingStyles';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '@/styles/Teacher/Reading/QuesitonTypeStyles';
import SumaryPartTab from '../../Student/ListeningTest/part/sumaryPartTab';
import { fetchHtmlContent } from '@/api/test';
import { cleanBase64Images } from '@/utils/stringFormat';
import 'ckeditor5/ckeditor5.css';

const textWrapStyles = {
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
};

/**
 * Dọn dẹp các thẻ p, div rỗng hoặc chỉ chứa khoảng trắng/ngắt dòng
 * Không đụng chạm đến cấu trúc của ảnh hay các thẻ khác.
 */
function cleanEmptyTags(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/<div>(?:\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, '')
    .trim();
}

function computeShortTextSplits(questions, questionBodyByKey) {
  const splits = {};
  let hasMedia = false;

  questions.forEach((q, i) => {
    const qKey = q?.id ?? `__idx_${i}`;
    const raw = q?.question;
    let html =
      typeof raw === 'string' && raw.startsWith('http')
        ? (questionBodyByKey[qKey] ?? '')
        : (raw ?? '');

    if (typeof html !== 'string' || html.startsWith('http')) {
      splits[qKey] = { cleanedHtml: '', pendingFetch: true };
      return;
    }

    // Kiểm tra nhanh xem câu hỏi có chứa thẻ media không để xử lý UI flex
    if (
      /(?:<picture\b[\s\S]*?<\/picture>|<img\b[^>]*(?:\/)?>|<svg\b[\s\S]*?<\/svg>)/gi.test(html)
    ) {
      hasMedia = true;
    }

    splits[qKey] = {
      cleanedHtml: cleanEmptyTags(html), // Trả về HTML đã dọn dẹp
      fullHtml: html,
      pendingFetch: false,
    };
  });

  return { splits, hasMedia };
}

const MultiChoiceContent = ({
  passage = '',
  passageTitle = '',
  questions = [],
  answers = {},
  showResults = false,
  onAnswerChange = () => {},
  hidePassage = false,
  stimulusPageUrls = null,
}) => {
  const pathname = usePathname();
  const isTeacherView =
    pathname?.includes('/teacher/view-test/') ||
    pathname?.includes('/teacher/upload-test/') ||
    pathname?.includes('/teacher/update-test/') ||
    pathname?.includes('/teacher/review-test/');

  const showSummary = showResults && !isTeacherView;

  const sortedQuestions = React.useMemo(() => {
    if (!questions) return [];
    return [...questions].sort((a, b) => {
      const numA = a.question_number ?? a.questionNumber ?? 0;
      const numB = b.question_number ?? b.questionNumber ?? 0;
      return numA - numB;
    });
  }, [questions]);

  const [leftWidth, setLeftWidth] = useState(55);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);
  const [passageContent, setPassageContent] = useState(passage);

  const [targetQuestionId, setTargetQuestionId] = useState(null);
  const [questionBodyByKey, setQuestionBodyByKey] = useState({});
  const [stimulusHtmlByIndex, setStimulusHtmlByIndex] = useState({});

  const stimulusFetchKey = React.useMemo(
    () => (Array.isArray(stimulusPageUrls) ? stimulusPageUrls.join('\0') : ''),
    [stimulusPageUrls],
  );

  const questionUrlFetchKey = React.useMemo(
    () =>
      sortedQuestions
        .map((q, i) => {
          const id = q?.id ?? `__idx_${i}`;
          const text = q?.question;
          return `${id}|${typeof text === 'string' ? text : ''}`;
        })
        .join(';;'),
    [sortedQuestions],
  );

  const shortTextLayout = React.useMemo(
    () => (hidePassage ? computeShortTextSplits(sortedQuestions, questionBodyByKey) : null),
    [hidePassage, sortedQuestions, questionBodyByKey],
  );

  const usePassageColumn =
    !hidePassage || questions.length > 0 || Boolean(stimulusPageUrls?.length);

  useEffect(() => {
    let cancelled = false;

    const loadStimulusPages = async () => {
      if (!stimulusPageUrls?.length) return;
      const next = {};
      await Promise.all(
        stimulusPageUrls.map(async (url, i) => {
          if (typeof url !== 'string' || !url.startsWith('http')) return;
          const html = await fetchHtmlContent(url);
          if (!cancelled) next[i] = html || url;
        }),
      );
      if (!cancelled) setStimulusHtmlByIndex(next);
    };

    loadStimulusPages();
    return () => {
      cancelled = true;
    };
  }, [stimulusFetchKey, stimulusPageUrls]);

  useEffect(() => {
    if (!hidePassage) return;

    let cancelled = false;

    const loadQuestionBodies = async () => {
      const next = {};
      await Promise.all(
        sortedQuestions.map(async (q, i) => {
          const key = q?.id ?? `__idx_${i}`;
          const raw = q?.question;
          if (typeof raw !== 'string' || !raw.startsWith('http')) return;
          const html = await fetchHtmlContent(raw);
          if (!cancelled) next[key] = html || raw;
        }),
      );
      if (!cancelled && Object.keys(next).length > 0) {
        setQuestionBodyByKey((prev) => ({ ...prev, ...next }));
      }
    };

    loadQuestionBodies();
    return () => {
      cancelled = true;
    };
  }, [questionUrlFetchKey, sortedQuestions, hidePassage]);

  useEffect(() => {
    if (hidePassage) return;
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
        } catch {
          // Catch error
        }
      }
    };
    fetchContent();
  }, [passage, hidePassage]);

  useEffect(() => {
    if (!usePassageColumn || !isDragging) return;
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
  }, [isDragging, usePassageColumn]);

  const handleAnswerSelection = (questionId, value) => {
    if (showResults) return;
    onAnswerChange({ ...answers, [questionId]: value });
  };

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

  const partQuestions = showSummary
    ? sortedQuestions.map((q) => {
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

  const handleNavigateToQuestion = (questionId) => {
    setTargetQuestionId(questionId);
  };

  const mainContent = (
    <Box sx={{ ...containerStyles, flex: 1, width: '100%', overflow: 'hidden' }}>
      <Container maxWidth={false} disableGutters sx={{ height: '100%', px: 0 }}>
        <Box
          ref={usePassageColumn ? containerRef : undefined}
          sx={{
            ...listeningPartStyles.containerColRow,
            ...(hidePassage &&
              !questions.length &&
              !stimulusPageUrls?.length && {
                flexDirection: { xs: 'column', md: 'column' },
              }),
            maxHeight: { xs: 'none', md: '100vh' },
            overflow: { xs: 'visible', md: 'hidden' },
            width: '100%',
            py: 2,
          }}
        >
          {usePassageColumn && (
            <>
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
                {!hidePassage ? (
                  <Box sx={listeningPartStyles.passageContainer}>
                    {passageTitle && (
                      <Typography sx={{ ...passageTitleStyles, mb: 2, ...textWrapStyles }}>
                        {passageTitle}
                      </Typography>
                    )}
                    <Box
                      className="ck-content"
                      component="div"
                      sx={{
                        ...passageTextStyles,
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
                          '&:hover': {
                            color: '#000099',
                            cursor: 'pointer',
                          },
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: passageContent }}
                    />
                  </Box>
                ) : stimulusPageUrls?.length ? (
                  <Box sx={listeningPartStyles.passageContainer}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                      {stimulusPageUrls.map((url, i) => (
                        <Box
                          key={`${i}-${url}`}
                          sx={{
                            ...listeningPartStyles.questionTextContainer,
                            alignItems: 'flex-start',
                          }}
                        >
                          <Typography sx={listeningPartStyles.questionLabelRectangle}>
                            {i + 1}
                          </Typography>
                          <Box
                            className="ck-content"
                            component="div"
                            sx={{
                              ...passageTextStyles,
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
                            dangerouslySetInnerHTML={{
                              __html:
                                stimulusHtmlByIndex[i] ??
                                (typeof url === 'string' && url.startsWith('http') ? '' : url),
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={listeningPartStyles.passageContainer}>
                    {passage && (
                      <Box sx={{ mb: questions.length > 0 ? 3 : 0 }}>
                        {passageTitle && (
                          <Typography sx={{ ...passageTitleStyles, mb: 2, ...textWrapStyles }}>
                            {passageTitle}
                          </Typography>
                        )}
                        <Box
                          className="ck-content"
                          component="div"
                          sx={{
                            ...passageTextStyles,
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
                          dangerouslySetInnerHTML={{ __html: passage }}
                        />
                      </Box>
                    )}
                    {sortedQuestions.map((q, i) => {
                      const qKey = q.id ?? `__idx_${i}`;
                      const split = shortTextLayout?.splits?.[qKey];
                      const contentHtml = split
                        ? split.cleanedHtml
                        : typeof q.question === 'string' && q.question.startsWith('http')
                          ? cleanEmptyTags(questionBodyByKey[qKey] ?? '')
                          : cleanEmptyTags(q.question ?? '');

                      if (!contentHtml) return null;
                      const labelN = q.question_number ?? q.questionNumber ?? i + 1;
                      return (
                        <Box
                          key={qKey}
                          sx={{
                            ...listeningPartStyles.questionTextContainer,
                            alignItems: 'flex-start',
                            mb: sortedQuestions.length > 1 ? 2 : 0,
                          }}
                        >
                          <Typography sx={listeningPartStyles.questionLabelRectangle}>
                            {labelN}
                          </Typography>
                          <Box
                            className="ck-content"
                            component="div"
                            sx={{
                              ...passageTextStyles,
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
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
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
                  sx={{
                    width: 2,
                    height: '100%',
                    bgcolor: isDragging ? 'warning.main' : 'divider',
                  }}
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
            </>
          )}

          <Box
            sx={{
              ...rightPaneStyles,
              flex:
                hidePassage && !shortTextLayout?.hasMedia && !stimulusPageUrls?.length
                  ? 1
                  : '0 0 auto',
              width: {
                xs: '100%',
                md: usePassageColumn ? `calc(${100 - leftWidth}% - 32px)` : '100%',
              },
              minWidth: usePassageColumn ? { md: '400px' } : 0,
              maxWidth: !usePassageColumn ? '100%' : undefined,
              maxHeight: { xs: 'none', md: 'calc(100vh - 32px)' },
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
                    {hidePassage
                      ? 'Look at the content on the left and choose the correct answer for each question.'
                      : 'Read the passage on the left and choose the correct answer for each question.'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ ...listeningPartStyles.questionSection, mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                  {sortedQuestions.map((question, index) => {
                    const qKey = question.id ?? `__idx_${index}`;
                    const rawQuestion = question.question;
                    const questionHtml =
                      typeof rawQuestion === 'string' && rawQuestion.startsWith('http')
                        ? (questionBodyByKey[qKey] ?? rawQuestion)
                        : (rawQuestion ?? '');
                    const displayHtml = hidePassage ? '' : questionHtml;

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
                            {question.question_number ?? question.questionNumber ?? index + 1}
                          </Typography>
                          <Typography
                            sx={{
                              ...listeningPartStyles.questionText,
                              ...textWrapStyles,
                              '& a': {
                                color: '#0000EE',
                                textDecoration: 'underline',
                                ['&:hover']: {
                                  color: '#000099',
                                  cursor: 'pointer',
                                },
                              },
                            }}
                            dangerouslySetInnerHTML={{ __html: displayHtml }}
                          />
                        </Box>
                        <Box
                          sx={{
                            ...listeningPartStyles.audioAndOptionsContainer,
                            pl: { xs: 0, md: 4 },
                          }}
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
                                          border: `1px solid`,
                                          borderColor: isCorrect ? 'success.main' : 'error.main',
                                          backgroundColor: isCorrect
                                            ? 'success.pastel'
                                            : 'error.pastel',
                                        }),
                                      ...(showSummary &&
                                        isCorrect && {
                                          border: `1px solid`,
                                          borderColor: 'success.main',
                                          backgroundColor: 'success.pastel',
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
                                        ...textWrapStyles, // Cập nhật ngắt dòng
                                        ...(showSummary &&
                                          isSelected && {
                                            color: isCorrect ? '#4caf50' : '#f44336',
                                            fontWeight: 500,
                                          }),
                                      }}
                                    >
                                      {option.answer_text || option.text || option.label}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </RadioGroup>
                          </Box>
                        </Box>

                        {showSummary && correctOption && (
                          <Box sx={{ pr: { xs: 0, md: 4 }, pl: { xs: 0, md: 4 }, width: '100%' }}>
                            <Box sx={{ ...listeningPartStyles.explanationContainer }}>
                              <Typography
                                sx={{ ...listeningPartStyles.correctText, ...textWrapStyles }}
                              >
                                Correct Answer: {correctOption.option_label}. {correctAnswerText}
                              </Typography>
                              {question.explanation && (
                                <Typography
                                  sx={{ ...listeningPartStyles.explanationText, ...textWrapStyles }}
                                >
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
