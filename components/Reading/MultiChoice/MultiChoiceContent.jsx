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
  richTextStyles,
} from '@/styles/Reading/MultiChoiceReadingStyles';
import { listeningPartStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { multipleChoiceStyles } from '@/styles/Teacher/Reading/QuesitonTypeStyles';
import SumaryPartTab from '../../Student/ListeningTest/part/sumaryPartTab';
import { fetchHtmlContent } from '@/api/test';

const textWrapStyles = {
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
};

/**
 * Tách khối hình ảnh / media khỏi phần chữ trong HTML stem (short text).
 * Dùng regex để kết quả giống nhau giữa SSR và client, tránh lệch hydrate.
 */
function splitHtmlImagesAndRest(html) {
  if (!html || typeof html !== 'string') return { imagesHtml: '', restHtml: '' };

  const blockRe = /(?:<picture\b[\s\S]*?<\/picture>|<img\b[^>]*(?:\/)?>|<svg\b[\s\S]*?<\/svg>)/gi;
  const fragments = [];
  let m;
  blockRe.lastIndex = 0;
  while ((m = blockRe.exec(html)) !== null) {
    fragments.push(m[0]);
  }
  if (fragments.length === 0) return { imagesHtml: '', restHtml: html };

  let rest = html;
  fragments.forEach((frag) => {
    rest = rest.replace(frag, '');
  });
  rest = rest
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '')
    .trim();

  return {
    imagesHtml: fragments.join(''),
    restHtml: rest,
  };
}

const passageResponsiveMediaSx = {
  '& img, & svg': { maxWidth: '100%', height: 'auto', display: 'block' },
  '& picture': { display: 'block', maxWidth: '100%' },
};

const stimulusFigureMediaSx = {
  flex: 1,
  minWidth: 0,
  ...passageResponsiveMediaSx,
};

/** Tách từng khối ảnh/SVG trong passage để render badge số giống cột choice. */
function extractNumberedMediaParts(html) {
  if (!html || typeof html !== 'string') {
    return { items: [], restHtml: '', hasMedia: false };
  }
  const blockRe = /(?:<picture\b[\s\S]*?<\/picture>|<img\b[^>]*(?:\/)?>|<svg\b[\s\S]*?<\/svg>)/gi;
  const frags = [];
  let m;
  blockRe.lastIndex = 0;
  while ((m = blockRe.exec(html)) !== null) {
    frags.push(m[0]);
  }
  if (frags.length === 0) return { items: [], restHtml: html, hasMedia: false };

  let rest = html;
  frags.forEach((frag) => {
    rest = rest.replace(frag, '');
  });
  rest = rest
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '')
    .trim();

  const items = frags.map((frag, i) => ({ n: i + 1, html: frag }));
  return { items, restHtml: rest, hasMedia: true };
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
      splits[qKey] = { imagesHtml: '', restHtml: '', pendingFetch: true };
      return;
    }

    const s = splitHtmlImagesAndRest(html);
    splits[qKey] = { ...s, fullHtml: html, pendingFetch: false };
    if (s.imagesHtml) hasMedia = true;
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
    pathname?.includes('/teacher/update-test/');
  const showSummary = showResults && !isTeacherView;

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
      questions
        .map((q, i) => {
          const id = q?.id ?? `__idx_${i}`;
          const text = q?.question;
          return `${id}|${typeof text === 'string' ? text : ''}`;
        })
        .join(';;'),
    [questions],
  );

  const shortTextLayout = React.useMemo(
    () => (hidePassage ? computeShortTextSplits(questions, questionBodyByKey) : null),
    [hidePassage, questions, questionBodyByKey],
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
    let cancelled = false;

    const loadQuestionBodies = async () => {
      const next = {};
      await Promise.all(
        questions.map(async (q, i) => {
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
  }, [questionUrlFetchKey, questions]);

  useEffect(() => {
    if (hidePassage) return;
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
            height: { xs: 'auto', md: '100vh' },
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
                {!hidePassage ? (
                  <Box sx={listeningPartStyles.passageContainer}>
                    {passageTitle && (
                      <Typography sx={{ ...passageTitleStyles, mb: 2, ...textWrapStyles }}>
                        {passageTitle}
                      </Typography>
                    )}
                    {(() => {
                      const { items, restHtml, hasMedia } =
                        extractNumberedMediaParts(passageContent);
                      if (!hasMedia) {
                        return (
                          <Box
                            component="div"
                            sx={{
                              ...passageTextStyles,
                              ...passageResponsiveMediaSx,
                              ...textWrapStyles, // Cập nhật ngắt dòng
                              ...richTextStyles,
                            }}
                            dangerouslySetInnerHTML={{ __html: passageContent }}
                          />
                        );
                      }
                      return (
                        <>
                          <Box
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
                          >
                            {items.map(({ n, html }) => (
                              <Box
                                key={n}
                                sx={{
                                  ...listeningPartStyles.questionTextContainer,
                                  alignItems: 'flex-start',
                                }}
                              >
                                <Typography sx={listeningPartStyles.questionLabelRectangle}>
                                  {n}
                                </Typography>
                                <Box
                                  component="div"
                                  sx={{
                                    ...passageTextStyles,
                                    ...stimulusFigureMediaSx,
                                    ...textWrapStyles,
                                    ...richTextStyles,
                                  }} // Cập nhật ngắt dòng
                                  dangerouslySetInnerHTML={{ __html: html }}
                                />
                              </Box>
                            ))}
                          </Box>
                          {restHtml ? (
                            <Box
                              component="div"
                              sx={{
                                ...passageTextStyles,
                                mt: 2,
                                ...passageResponsiveMediaSx,
                                ...textWrapStyles,
                                ...richTextStyles,
                              }} // Cập nhật ngắt dòng
                              dangerouslySetInnerHTML={{ __html: restHtml }}
                            />
                          ) : null}
                        </>
                      );
                    })()}
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
                            component="div"
                            sx={{
                              ...passageTextStyles,
                              ...stimulusFigureMediaSx,
                              ...textWrapStyles,
                              ...richTextStyles,
                            }} // Cập nhật ngắt dòng
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
                          component="div"
                          sx={{
                            ...passageTextStyles,
                            ...passageResponsiveMediaSx,
                            ...textWrapStyles,
                            ...richTextStyles,
                          }}
                          dangerouslySetInnerHTML={{ __html: passage }}
                        />
                      </Box>
                    )}
                    {questions.map((q, i) => {
                      const qKey = q.id ?? `__idx_${i}`;
                      const split = shortTextLayout?.splits?.[qKey];
                      const contentHtml = split
                        ? split.fullHtml
                        : typeof q.question === 'string' && q.question.startsWith('http')
                          ? (questionBodyByKey[qKey] ?? '')
                          : (q.question ?? '');

                      if (!contentHtml) return null;
                      const labelN = q.question_number ?? q.questionNumber ?? i + 1;
                      return (
                        <Box
                          key={qKey}
                          sx={{
                            ...listeningPartStyles.questionTextContainer,
                            alignItems: 'flex-start',
                            mb: questions.length > 1 ? 2 : 0,
                          }}
                        >
                          <Typography sx={listeningPartStyles.questionLabelRectangle}>
                            {labelN}
                          </Typography>
                          <Box
                            component="div"
                            sx={{
                              ...passageTextStyles,
                              ...stimulusFigureMediaSx,
                              ...textWrapStyles,
                              ...richTextStyles,
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
              ...listeningPartStyles.questionSection,
              flex:
                hidePassage && !shortTextLayout?.hasMedia && !stimulusPageUrls?.length
                  ? 1
                  : undefined,
              width: {
                xs: '100%',
                md: usePassageColumn ? `calc(${100 - leftWidth}% - 32px)` : '100%',
              },
              minWidth: usePassageColumn ? { md: '400px' } : 0,
              maxWidth: !usePassageColumn ? '100%' : undefined,
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
                {hidePassage
                  ? 'Look at the content on the left and choose the correct answer for each question.'
                  : 'Read the passage on the left and choose the correct answer for each question.'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
              {questions.map((question, index) => {
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
                        sx={{ ...listeningPartStyles.questionText, ...textWrapStyles }} // Cập nhật ngắt dòng
                        dangerouslySetInnerHTML={{ __html: displayHtml }}
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
