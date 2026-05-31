'use client';

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Paper,
  Stack,
  Radio,
  Snackbar,
  Alert,
  Collapse,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HeadsetMicRoundedIcon from '@mui/icons-material/HeadsetMicRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AudioUploader from '../Upload/AudioUploader';
import ClientSideCustomEditor from '../Editor/ClientSideCustomEditor';
import { useState, useEffect, useRef } from 'react';
import {
  sectionHeader,
  accentBar,
  emptyStateBox,
  scrollEditorBox,
  numberIndicator,
  partHeader,
  rowContent,
  labelText,
  textInput,
  answerTextInput,
  actionTextButton,
  outlinedCard,
  answerOptionRow,
  trashIconButton,
  addQuestionBox,
  addOptionButton,
} from '../../styles/Teacher/Listening/ListeningStyles';

const options = [
  {
    id: 'onetoone',
    title: '1 audio - 1 question',
    description: 'Each question has each audio',
    icon: <HeadsetMicRoundedIcon sx={{ fontSize: 40, color: '#000' }} />,
  },
  {
    id: 'onetomany',
    title: '1 audio - many questions',
    description: 'One audio for all questions',
    icon: <MusicNoteRoundedIcon sx={{ fontSize: 40, color: '#000' }} />,
  },
];

export default function MultiChoiceTextPart({ index, part = {}, onChange, onDelete }) {
  const questions = Array.isArray(part.questions) ? part.questions : [];
  const [audioFormat, setAudioFormat] = useState(part.audioFormat || 'onetoone');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedQuestions, setCollapsedQuestions] = useState({});
  const layoutRef = useRef(null);

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

    // Part header
    if (document.querySelector(`#tour-part-header-${partId}`)) {
      steps.push({
        element: `#tour-part-header-${partId}`,
        popover: {
          title: 'Multiple Choice Text Part',
          description: `This is Part ${index + 1} (Multiple Choice Text). Students will listen to audio and select the correct text answer.`,
          side: 'bottom',
          align: 'start',
        },
      });
    }

    // Score
    if (document.querySelector(`#tour-score-${partId}`)) {
      steps.push({
        element: `#tour-score-${partId}`,
        popover: {
          title: 'Score per Question',
          description:
            'Set the default point score awarded for each correctly answered question in this part.',
          side: 'right',
          align: 'start',
        },
      });
    }

    // Audio format
    if (document.querySelector(`#tour-audio-format-${partId}`)) {
      steps.push({
        element: `#tour-audio-format-${partId}`,
        popover: {
          title: 'Audio Format',
          description:
            'Choose "1 audio – 1 question" (each question has its own audio clip) or "1 audio – many questions" (all questions share one shared audio).',
          side: 'bottom',
          align: 'start',
        },
      });
    }

    // Instruction
    if (document.querySelector(`#tour-instruction-${partId}`)) {
      steps.push({
        element: `#tour-instruction-${partId}`,
        popover: {
          title: 'Instruction Text',
          description:
            'Write a task instruction for students. Example: "Listen to the conversation and choose the best answer for each question."',
          side: 'top',
          align: 'start',
        },
      });
    }

    // Shared audio (onetomany)
    if (document.querySelector(`#tour-shared-audio-${partId}`)) {
      steps.push({
        element: `#tour-shared-audio-${partId}`,
        popover: {
          title: 'Shared Audio File',
          description:
            'Upload the main audio clip that all questions in this part will use. Supports MP3 and M4A formats.',
          side: 'top',
          align: 'start',
        },
      });
    }

    // Questions section
    if (document.querySelector(`#tour-questions-${partId}`)) {
      steps.push({
        element: `#tour-questions-${partId}`,
        popover: {
          title: 'Questions Section',
          description:
            'Each card here is one question. You can add, delete, and configure each question including the question text, explanation, per-question audio, and answer choices.',
          side: 'top',
          align: 'start',
        },
      });

      if (document.querySelector(`#tour-questions-${partId} .tour-question-input`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-question-input`,
          popover: {
            title: 'Question Text',
            description:
              'Enter the question that students must answer after listening to the audio.',
            side: 'top',
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
              'Optionally explain why the correct answer is right. This is shown to students during result review.',
            side: 'top',
            align: 'start',
          },
        });
      }

      if (document.querySelector(`#tour-questions-${partId} .tour-per-question-audio`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-per-question-audio`,
          popover: {
            title: 'Per-Question Audio File',
            description:
              'Upload a unique audio clip for this specific question (only shown in "1 audio – 1 question" format).',
            side: 'top',
            align: 'start',
          },
        });
      }

      if (document.querySelector(`#tour-questions-${partId} .tour-option-item`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-option-item`,
          popover: {
            title: 'Answer Options',
            description:
              'Enter each answer choice text. Click the radio button to the left of an option to mark it as the correct answer.',
            side: 'top',
            align: 'start',
          },
        });
      }

      if (document.querySelector(`#tour-questions-${partId} .tour-add-option-btn`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-add-option-btn`,
          popover: {
            title: 'Add Option',
            description: 'Click "+ Add option" to add another answer choice for this question.',
            side: 'top',
            align: 'center',
          },
        });
      }

      if (document.querySelector(`#tour-questions-${partId} .tour-add-question-btn`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-add-question-btn`,
          popover: {
            title: 'Add New Question',
            description: 'Click "+ Add question" to append another question card to this part.',
            side: 'top',
            align: 'center',
          },
        });
      }
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [content, setContent] = useState(part.content || '');

  useEffect(() => {
    setAudioFormat(part.audioFormat || 'onetoone');
    setContent(part.content || '');
  }, [part.audioFormat, part.content]);

  const updatePart = (newPart) => {
    if (onChange) onChange(newPart);
  };

  const handleAudioFormatChange = (newFormat) => {
    setAudioFormat(newFormat);
    if (newFormat === 'onetoone') {
      updatePart({ ...part, audioFormat: newFormat, audio: null });
    } else {
      const newQs = questions.map((q) => ({
        ...q,
        audio: null,
      }));
      updatePart({ ...part, audioFormat: newFormat, questions: newQs });
    }
  };

  const addQuestion = (type) => {
    let newQ = {
      id: Date.now().toString(),
      text: '',
      score: part.score || 0,
      answers: [
        { id: 'a-' + Date.now() + '-0', label: 'A' },
        { id: 'b-' + Date.now() + '-1', label: 'B' },
        { id: 'c-' + Date.now() + '-2', label: 'C' },
      ],
      correctIndex: null,
    };
    if (type == 'onetoone') {
      newQ = { ...newQ, audio: null };
    }

    const newPart = { ...part, questions: [...questions, newQ] };
    updatePart(newPart);
  };

  const removeQuestion = (qIdx) => {
    const newQs = questions.filter((_, i) => i !== qIdx);
    updatePart({ ...part, questions: newQs });
  };

  const setQuestionText = (qIdx, text) => {
    const newQs = questions.map((q, i) => (i === qIdx ? { ...q, text } : q));
    updatePart({ ...part, questions: newQs });
  };

  const setAnswerText = (qIdx, aIdx, text) => {
    const newQs = questions.map((q, i) => {
      if (i !== qIdx) return q;
      const newAnswers = q.answers.map((ans, j) => (j === aIdx ? { ...ans, text } : ans));
      return { ...q, answers: newAnswers };
    });
    updatePart({ ...part, questions: newQs });
  };

  const addAnswer = (qIdx) => {
    const q = questions[qIdx];
    const nextLabel = String.fromCharCode(65 + q.answers.length); // A,B,C...
    const newAnswer = { id: `${q.id}-ans-${Date.now()}`, label: nextLabel };
    const newQs = questions.map((qq, i) =>
      i === qIdx ? { ...qq, answers: [...qq.answers, newAnswer] } : qq,
    );
    updatePart({ ...part, questions: newQs });
  };

  const removeAnswer = (qIdx, aIdx) => {
    const q = questions[qIdx];
    if (q.answers.length <= 2) {
      setSnackbar({ open: true, message: 'At least 2 answers are required' });
      return;
    }
    const newAnswers = q.answers.filter((_, i) => i !== aIdx);
    // re-label answers A,B,C...
    const relabeled = newAnswers.map((ans, i) => ({ ...ans, label: String.fromCharCode(65 + i) }));
    const newQs = questions.map((qq, i) =>
      i === qIdx
        ? {
            ...qq,
            answers: relabeled,
            correctIndex:
              qq.correctIndex === aIdx ? null : adjustCorrectIndex(qq.correctIndex, aIdx),
          }
        : qq,
    );
    updatePart({ ...part, questions: newQs });
  };

  const adjustCorrectIndex = (oldCorrect, removedIndex) => {
    if (oldCorrect == null) return null;
    if (oldCorrect === removedIndex) return null;
    if (oldCorrect > removedIndex) return oldCorrect - 1;
    return oldCorrect;
  };

  const setCorrect = (qIdx, aIdx) => {
    const newQs = questions.map((q, i) => {
      if (i !== qIdx) return q;

      const newAnswers = q.answers.map((ans, ai) => ({
        ...ans,
        is_correct: ai === aIdx,
      }));

      return { ...q, correctIndex: aIdx, answers: newAnswers };
    });
    updatePart({ ...part, questions: newQs });
  };

  const handleAudioChange = (qIdx, audio) => {
    if (audioFormat === 'onetoone') {
      const newQs = questions.map((q, qi) => {
        if (qi !== qIdx) return q;
        return { ...q, audio };
      });
      updatePart({ ...part, questions: newQs });
    } else {
      updatePart({ ...part, audio });
    }
  };

  return (
    <Box sx={{ width: '100%', alignSelf: 'stretch' }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box id={`tour-part-header-${partId}`} sx={{ ...partHeader, alignSelf: 'stretch' }}>
        <Box sx={sectionHeader}>
          <Box sx={accentBar} />
          <Box>
            <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
              Part {index + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Multiple choice texts · {questions.length} questions
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
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              width: '100%',
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

            <Typography sx={labelText}>
              Audio Format <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Box id={`tour-audio-format-${partId}`} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {options.map((option) => {
                const isActive = audioFormat === option.id;
                return (
                  <Paper
                    key={option.id}
                    onClick={() => handleAudioFormatChange(option.id)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderRadius: '16px',
                      border: '2px solid',
                      borderColor: isActive ? 'yellow.main' : '#E0E0E0',
                      backgroundColor: isActive ? 'natural.main' : 'background.paper',
                      flex: 1,
                      '&:hover': {
                        borderColor: 'yellow.main',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={3} alignItems="center">
                      {option.icon}
                      <Box>
                        <Typography
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '16px',
                          }}
                        >
                          {option.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.gray', fontSize: '14px', mt: 0.5 }}
                        >
                          {option.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
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
                placeholder="e.g., Listen to the audio between Alice and Sam and choose the correct picture..."
                value={part.description ?? ''}
                onChange={(e) => updatePart({ ...part, description: e.target.value })}
                sx={textInput}
              />
            </Box>

            {audioFormat === 'onetomany' && (
              <>
                <Typography sx={labelText}>
                  Audio File <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Box id={`tour-shared-audio-${partId}`}>
                  <AudioUploader
                    value={part.audio}
                    onChange={(audio) => updatePart({ ...part, audio })}
                    accept="audio/mp3,audio/m4a"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={rowContent}>
                    <Typography sx={labelText}>Content</Typography>
                  </Box>
                  <Box sx={scrollEditorBox}>
                    <ClientSideCustomEditor
                      data={content}
                      onChange={(newContent) => {
                        setContent(newContent);
                        updatePart({ ...part, content: newContent });
                      }}
                      onError={(message) => setSnackbar({ open: true, message })}
                      startingBlankId={1}
                    />
                  </Box>
                </Box>
              </>
            )}
            <Box id={`tour-questions-${partId}`}>
              <Box sx={rowContent}>
                <Typography sx={labelText}>
                  Questions <span style={{ color: 'red' }}>*</span>
                </Typography>
              </Box>

              {questions.length === 0 ? (
                <Box sx={emptyStateBox}>
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
                <Stack spacing={2}>
                  {questions.map((q, qIdx) => (
                    <Paper key={q.id} variant="outlined" sx={outlinedCard}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Box sx={numberIndicator}>{qIdx + 1}</Box>
                        {collapsedQuestions[q.id] && (
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
                            {q.text || ''}
                          </Typography>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={() => removeQuestion(qIdx)} sx={trashIconButton}>
                          <DeleteRoundedIcon sx={{ fontSize: '1.2rem' }} />
                        </IconButton>
                        <IconButton onClick={() => toggleQuestionCollapse(q.id)}>
                          <ExpandLessRoundedIcon
                            sx={{
                              fontSize: '1.4rem',
                              transition: 'transform 0.3s ease',
                              transform: collapsedQuestions[q.id]
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            }}
                          />
                        </IconButton>
                      </Box>

                      <Collapse in={!collapsedQuestions[q.id]} sx={{ width: '100%' }}>
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            className="tour-question-input"
                            placeholder="Enter question text"
                            value={q.text}
                            onChange={(e) => setQuestionText(qIdx, e.target.value)}
                            multiline
                            sx={{ ...textInput, mb: 2 }}
                          />

                          <TextField
                            size="small"
                            fullWidth
                            className="tour-explanation-input"
                            placeholder="Enter explanation"
                            value={q.explanation || ''}
                            onChange={(e) => {
                              const newQs = questions.map((question, i) =>
                                i === qIdx
                                  ? { ...question, explanation: e.target.value }
                                  : question,
                              );
                              updatePart({ ...part, questions: newQs });
                            }}
                            multiline
                            sx={{ ...textInput, mb: 2 }}
                          />

                          {audioFormat === 'onetoone' && (
                            <Box className="tour-per-question-audio" sx={{ mb: 2 }}>
                              <Typography sx={labelText}>
                                Audio File <span style={{ color: 'red' }}>*</span>
                              </Typography>
                              <AudioUploader
                                value={q.audio}
                                onChange={(audio) => handleAudioChange(qIdx, audio)}
                                accept="audio/mp3,audio/m4a"
                              />
                            </Box>
                          )}

                          <Typography sx={{ ...labelText, color: 'text.gray', mb: 1 }}>
                            Text answers (click to set correct):
                          </Typography>

                          <Stack spacing={1}>
                            {q.answers.map((ans, aIdx) => {
                              const isCorrect = q.correctIndex === aIdx;

                              return (
                                <Box
                                  key={ans.id || aIdx}
                                  className="tour-option-item"
                                  sx={answerOptionRow}
                                >
                                  <Radio
                                    checked={isCorrect}
                                    onChange={() => setCorrect(qIdx, aIdx)}
                                    sx={{
                                      color: 'text.gray',
                                      '&.Mui-checked': { color: 'primary.main' },
                                      p: 1,
                                      mr: 1,
                                    }}
                                  />

                                  <Typography
                                    sx={{
                                      fontWeight: 'bold',
                                      mr: 2,
                                      minWidth: '20px',
                                      color: 'text.primary',
                                    }}
                                  >
                                    {String.fromCharCode(65 + aIdx)}
                                  </Typography>

                                  <TextField
                                    size="small"
                                    multiline
                                    placeholder={`Answer ${String.fromCharCode(65 + aIdx)}...`}
                                    value={ans.text || ''}
                                    onChange={(e) => setAnswerText(qIdx, aIdx, e.target.value)}
                                    sx={{ ...answerTextInput, flex: 1, minWidth: 0 }}
                                  />

                                  <IconButton
                                    size="small"
                                    onClick={() => removeAnswer(qIdx, aIdx)}
                                    sx={{
                                      ...trashIconButton,
                                      ml: 1,
                                    }}
                                  >
                                    <DeleteRoundedIcon />
                                  </IconButton>
                                </Box>
                              );
                            })}
                          </Stack>

                          <Button
                            startIcon={<AddRoundedIcon sx={{ fontSize: '1.4rem' }} />}
                            onClick={() => addAnswer(qIdx)}
                            className="tour-add-option-btn"
                            sx={addOptionButton}
                          >
                            Add option
                          </Button>
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
          </Box>
        </Box>
      )}
    </Box>
  );
}
