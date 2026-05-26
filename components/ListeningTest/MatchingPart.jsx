/* global IntersectionObserver */
'use client';

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Paper,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Collapse,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AudioUploader from '../Upload/AudioUploader';
import { useEffect, useRef, useState } from 'react';
import {
  sectionHeader,
  accentBar,
  emptyStateBox,
  numberIndicator,
  partHeader,
  rowContent,
  labelText,
  textInput,
  answerTextInput,
  actionTextButton,
  outlinedCard,
  matchingAnswerLabel,
  trashIconButton,
  addQuestionBox,
} from '../../styles/Teacher/Listening/ListeningStyles';

export default function MatchingPart({ index, part = {}, onChange, onDelete }) {
  const questions = Array.isArray(part.questions) ? part.questions : [];
  const answers = Array.isArray(part.answers) ? part.answers : [];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedQuestions, setCollapsedQuestions] = useState({});
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const layoutRef = useRef(null);

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

  const partId = part.id || `part-${index}`;

  const toggleQuestionCollapse = (questionId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handlePartTour = (e) => {
    e.stopPropagation();
    const { driver } = require('driver.js');
    const steps = [];

    if (document.querySelector(`#tour-part-header-${partId}`)) {
      steps.push({
        element: `#tour-part-header-${partId}`,
        popover: {
          title: 'Matching Part',
          description: `Part ${index + 1} (Matching). Students listen to audio and match each question item to the correct answer label.`,
          side: 'bottom',
          align: 'start',
        },
      });
    }
    if (document.querySelector(`#tour-score-${partId}`)) {
      steps.push({
        element: `#tour-score-${partId}`,
        popover: {
          title: 'Score per Question',
          description: 'Set the points awarded for each correctly matched pair.',
          side: 'right',
          align: 'start',
        },
      });
    }
    if (document.querySelector(`#tour-audio-${partId}`)) {
      steps.push({
        element: `#tour-audio-${partId}`,
        popover: {
          title: 'Audio File',
          description:
            'Upload the audio clip students will listen to before matching. Supports MP3 and M4A.',
          side: 'top',
          align: 'start',
        },
      });
    }
    if (document.querySelector(`#tour-instruction-${partId}`)) {
      steps.push({
        element: `#tour-instruction-${partId}`,
        popover: {
          title: 'Instruction Text',
          description:
            'Write the task instruction. Example: "Listen and match each item on the left with the correct answer on the right."',
          side: 'top',
          align: 'start',
        },
      });
    }
    if (document.querySelector(`#tour-questions-${partId}`)) {
      steps.push({
        element: `#tour-questions-${partId}`,
        popover: {
          title: 'Questions (Left Column)',
          description:
            'Each card is a question item students must match. Enter the question/statement text and select the correct answer label from the dropdown.',
          side: 'top',
          align: 'start',
        },
      });
      if (document.querySelector(`#tour-questions-${partId} .tour-question-input`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-question-input`,
          popover: {
            title: 'Question / Statement',
            description:
              'Enter the prompt text that students must match to an answer. Example: "The capital city of France".',
            side: 'top',
            align: 'start',
          },
        });
      }
      if (document.querySelector(`#tour-questions-${partId} .tour-answer-select`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-answer-select`,
          popover: {
            title: 'Correct Answer Dropdown',
            description:
              'Select the correct letter label (A, B, C...) that this question maps to. The labels correspond to answer items in the Answers panel below.',
            side: 'left',
            align: 'start',
          },
        });
      }
      if (document.querySelector(`#tour-questions-${partId} .tour-explanation-input`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-explanation-input`,
          popover: {
            title: 'Explanation',
            description:
              'Provide an optional explanation for why this question maps to that answer. Shown to students during result review.',
            side: 'top',
            align: 'start',
          },
        });
      }
      if (document.querySelector(`#tour-questions-${partId} .tour-add-question-btn`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-add-question-btn`,
          popover: {
            title: 'Add New Question',
            description: 'Click "+ Add question" to add another matching question item.',
            side: 'top',
            align: 'center',
          },
        });
      }
    }
    if (document.querySelector(`#tour-answers-${partId}`)) {
      steps.push({
        element: `#tour-answers-${partId}`,
        popover: {
          title: 'Answers (Right Column)',
          description:
            'These are the answer options (A, B, C...) students will match to the questions. A new answer label is added automatically when you add a question.',
          side: 'top',
          align: 'start',
        },
      });
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      doneBtnText: 'Finish',
      closeBtnText: 'Close',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      steps,
    });
    driverObj.drive();
  };

  const updatePart = (newPart) => {
    if (onChange) onChange(newPart);
  };

  const clampWidth = (value) => Math.min(65, Math.max(35, value));

  const updateSplitterWidth = (clientX) => {
    const layout = layoutRef.current;
    if (!layout) return;

    const rect = layout.getBoundingClientRect();
    const nextWidth = ((clientX - rect.left) / rect.width) * 100;
    setLeftPaneWidth(clampWidth(nextWidth));
  };

  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handleMouseMove = (event) => {
      updateSplitterWidth(event.clientX);
      event.preventDefault();
    };

    const handleMouseUp = () => {
      setIsDraggingSplitter(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplitter]);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: '',
      score: part.score || 0,
      selectedAnswerId: null,
    };
    let newAnswers = answers;

    if (questions.length >= answers.length) {
      const newAnswer = {
        id: Date.now().toString() + '-ans',
        text: '',
      };
      newAnswers = [...answers, newAnswer];
    }
    const newPart = { ...part, questions: [...questions, newQuestion], answers: newAnswers };
    updatePart(newPart);
  };

  const removeQuestion = (qIdx) => {
    const newQuestions = questions.filter((_, i) => i !== qIdx);
    let newAnswers = answers;

    if (newQuestions.length < answers.length) {
      newAnswers = answers.slice(0, answers.length - 1);
    }
    updatePart({ ...part, questions: newQuestions, answers: newAnswers });
  };

  const setQuestionText = (qIdx, text) => {
    const newQuestions = questions.map((q, i) => (i === qIdx ? { ...q, text } : q));
    updatePart({ ...part, questions: newQuestions });
  };

  const setQuestionAnswer = (qIdx, answerId) => {
    const newQuestions = questions.map((q, i) =>
      i === qIdx ? { ...q, selectedAnswerId: answerId } : q,
    );
    updatePart({ ...part, questions: newQuestions });
  };

  const removeAnswer = (aIdx) => {
    const removedAnswer = answers[aIdx];
    const newAnswers = answers.filter((_, i) => i !== aIdx);
    let newQuestions = questions.map((q) =>
      q.selectedAnswerId === removedAnswer.id ? { ...q, selectedAnswerId: null } : q,
    );

    if (newAnswers.length < questions.length) {
      newQuestions = newQuestions.slice(0, newQuestions.length - 1);
    }
    updatePart({ ...part, answers: newAnswers, questions: newQuestions });
  };

  const setAnswerText = (aIdx, text) => {
    const newAnswers = answers.map((ans, i) => (i === aIdx ? { ...ans, text } : ans));
    updatePart({ ...part, answers: newAnswers });
  };

  return (
    <>
      <Box id={`tour-part-header-${partId}`} sx={partHeader}>
        <Box sx={sectionHeader}>
          <Box sx={accentBar} />
          <Box>
            <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
              Part {index + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Matching · {questions.length} questions
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePartTour}
            startIcon={<HelpOutlineIcon sx={{ fontSize: '0.9rem !important' }} />}
            sx={{
              color: '#FF9E45',
              borderColor: '#FF9E45',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'none',
              borderRadius: '16px',
              py: 0.25,
              px: 1.5,
              mr: 1,
              '&:hover': { backgroundColor: '#FFEAD4', borderColor: '#FF9E45' },
            }}
          >
            Guide
          </Button>
          <IconButton onClick={onDelete} sx={trashIconButton}>
            <DeleteRoundedIcon sx={{ fontSize: '1.4rem' }} />
          </IconButton>
          <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? (
              <ExpandMoreRoundedIcon sx={{ fontSize: '1.6rem' }} />
            ) : (
              <ExpandLessRoundedIcon sx={{ fontSize: '1.6rem' }} />
            )}
          </IconButton>
        </Box>
      </Box>

      {!isCollapsed && (
        <Box
          ref={layoutRef}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mt: 1,
          }}
        >
          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
            }}
          >
            <Box id={`tour-score-${partId}`} sx={{ mb: 3 }}>
              <Box sx={rowContent}>
                <Typography sx={labelText}>
                  The score for each question <span style={{ color: 'red' }}>*</span>
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={part.score ?? ''}
                onChange={(e) => {
                  const scoreValue = parseFloat(e.target.value) || 0;
                  const newQuestions = questions.map((q) => ({
                    ...q,
                    score: scoreValue,
                  }));
                  updatePart({ ...part, score: scoreValue, questions: newQuestions });
                }}
                sx={textInput}
              />
            </Box>

            <Box id={`tour-audio-${partId}`} sx={{ mb: 3 }}>
              <Typography sx={labelText}>
                Audio File <span style={{ color: 'red' }}>*</span>
              </Typography>
              <AudioUploader
                value={part.audio}
                onChange={(audio) => updatePart({ ...part, audio })}
                accept="audio/mp3,audio/m4a"
              />
            </Box>

            <Box id={`tour-instruction-${partId}`} sx={{ mb: 3 }}>
              <Box sx={rowContent}>
                <Typography sx={labelText}>
                  Instruction <span style={{ color: 'red' }}>*</span>
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder="e.g., Match the items on the left with the correct answers on the right..."
                value={part.description ?? ''}
                onChange={(e) => updatePart({ ...part, description: e.target.value })}
                sx={textInput}
              />
            </Box>

            {/* -------------- Questions Section -------------- */}
            <Box id={`tour-questions-${partId}`}>
              <Box sx={rowContent}>
                <Typography sx={labelText}>
                  Questions <span style={{ color: 'red' }}>*</span>
                </Typography>
              </Box>

              {questions.length === 0 ? (
                <Box sx={{ ...emptyStateBox, mb: 3 }}>
                  No questions yet
                  <br />
                  <Button
                    startIcon={<AddRoundedIcon />}
                    sx={{ mt: 1, ...actionTextButton, textTransform: 'none' }}
                    onClick={addQuestion}
                  >
                    Add your first question
                  </Button>
                </Box>
              ) : (
                <Stack spacing={2} sx={{ mb: 2 }}>
                  {' '}
                  {questions.map((question, qIdx) => (
                    <Paper key={question.id} variant="outlined" sx={outlinedCard}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Box sx={numberIndicator}>{qIdx + 1}</Box>
                        {collapsedQuestions[question.id] && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              ml: 0.5,
                            }}
                          >
                            {question.text || ''}
                          </Typography>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={() => removeQuestion(qIdx)} sx={trashIconButton}>
                          <DeleteRoundedIcon sx={{ fontSize: '1.2rem' }} />
                        </IconButton>
                        <IconButton onClick={() => toggleQuestionCollapse(question.id)}>
                          <ExpandLessRoundedIcon
                            sx={{
                              fontSize: '1.4rem',
                              transition: 'transform 0.3s ease',
                              transform: collapsedQuestions[question.id]
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            }}
                          />
                        </IconButton>
                      </Box>

                      <Collapse in={!collapsedQuestions[question.id]} sx={{ width: '100%' }}>
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField
                              size="small"
                              className="tour-question-input"
                              placeholder="Question text..."
                              value={question.text}
                              onChange={(e) => setQuestionText(qIdx, e.target.value)}
                              multiline
                              sx={{ ...textInput, flex: 1 }}
                            />

                            <FormControl
                              id={`select-${question.id}`}
                              size="small"
                              className="tour-answer-select"
                              sx={{
                                width: 110,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '1rem',
                                },
                              }}
                            >
                              <Select
                                value={question.selectedAnswerId || ''}
                                onChange={(e) => setQuestionAnswer(qIdx, e.target.value)}
                                open={openSelectId === question.id}
                                onOpen={() => setOpenSelectId(question.id)}
                                onClose={() => setOpenSelectId(null)}
                                displayEmpty
                                MenuProps={{ disableScrollLock: true }}
                              >
                                <MenuItem value="" disabled>
                                  <em>Select...</em>
                                </MenuItem>
                                {answers.map((answer, aIdx) => (
                                  <MenuItem key={answer.id} value={answer.id}>
                                    {String.fromCharCode(65 + aIdx)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>

                          <TextField
                            size="small"
                            fullWidth
                            className="tour-explanation-input"
                            placeholder="Enter explanation"
                            value={question.explanation || ''}
                            onChange={(e) => {
                              const newQs = questions.map((question, i) =>
                                i === qIdx
                                  ? { ...question, explanation: e.target.value }
                                  : question,
                              );
                              updatePart({ ...part, questions: newQs });
                            }}
                            multiline
                            sx={textInput}
                          />
                        </Box>
                      </Collapse>
                    </Paper>
                  ))}
                  <Box onClick={addQuestion} className="tour-add-question-btn" sx={addQuestionBox}>
                    <AddRoundedIcon sx={{ fontSize: '1.2rem' }} />
                    Add question
                  </Box>
                </Stack>
              )}
            </Box>

            {/* -------------- Answers Section -------------- */}
            <Box id={`tour-answers-${partId}`}>
              <Box sx={rowContent}>
                <Typography sx={labelText}>
                  Answers <span style={{ color: 'red' }}>*</span>
                </Typography>
              </Box>

              {answers.length === 0 ? (
                <Box sx={emptyStateBox}>Answers are generated automatically from questions.</Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  {answers.map((answer, aIdx) => (
                    <Paper
                      key={answer.id}
                      variant="outlined"
                      sx={{
                        ...outlinedCard,
                        p: 1,
                        py: 0.75,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={matchingAnswerLabel}>{String.fromCharCode(65 + aIdx)}</Box>

                        <TextField
                          size="small"
                          className="tour-answer-text"
                          placeholder="Answer text"
                          value={answer.text}
                          onChange={(e) => setAnswerText(aIdx, e.target.value)}
                          multiline
                          sx={{
                            ...answerTextInput,
                            flex: 1,
                            '& .MuiOutlinedInput-input': {
                              py: 0.25,
                              lineHeight: 1.2,
                            },
                          }}
                        />

                        <IconButton onClick={() => removeAnswer(aIdx)} sx={trashIconButton}>
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
