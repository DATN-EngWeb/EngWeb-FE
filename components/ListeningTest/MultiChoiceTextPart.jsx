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
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import HeadsetMicRoundedIcon from '@mui/icons-material/HeadsetMicRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import AudioUploader from '../Upload/AudioUploader';
import ClientSideCustomEditor from '../Editor/ClientSideCustomEditor';
import { useState, useEffect } from 'react';
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
    title: '1 audio - many question',
    description: 'One audio for all questions',
    icon: <MusicNoteRoundedIcon sx={{ fontSize: 40, color: '#000' }} />,
  },
];

export default function MultiChoiceTextPart({ index, part = {}, onChange, onDelete }) {
  const questions = Array.isArray(part.questions) ? part.questions : [];
  const [audioFormat, setAudioFormat] = useState(part.audioFormat || 'onetoone');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedQuestions, setCollapsedQuestions] = useState({});

  const toggleQuestionCollapse = (questionId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
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
    <Box>
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
      <Box sx={partHeader}>
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
        <Box>
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, mt: 2 }}>
          {/* -------------- Left Column: Config & Audio -------------- */}
          <Box sx={{ flex: 1.2, minWidth: 0 }}>
            <Box sx={{ mb: 3 }}>
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
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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

            <Box sx={{ mb: 3 }}>
              <Box sx={rowContent}>
                <Typography sx={labelText}>
                  Description <span style={{ color: 'red' }}>*</span>
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
                <AudioUploader
                  value={part.audio}
                  onChange={(audio) => updatePart({ ...part, audio })}
                  accept="audio/mp3,audio/m4a"
                />

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
          </Box>

          {/* -------------- Right Column: Questions -------------- */}
          <Box sx={{ flex: 1.5, minWidth: 0 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: 1 }}>
                      <Box sx={numberIndicator}>{qIdx + 1}</Box>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton onClick={() => removeQuestion(qIdx)} sx={trashIconButton}>
                        <DeleteRoundedIcon sx={{ fontSize: '1.2rem' }} />
                      </IconButton>
                      <IconButton onClick={() => toggleQuestionCollapse(q.id)}>
                        <ExpandLessRoundedIcon
                          sx={{
                            fontSize: '1.4rem',
                            transition: 'transform 0.3s ease',
                            transform: collapsedQuestions[q.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </IconButton>
                    </Box>

                    <Collapse in={!collapsedQuestions[q.id]} sx={{ width: '100%' }}>
                      <Box sx={{ mt: 1 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Enter question text"
                          value={q.text}
                          onChange={(e) => setQuestionText(qIdx, e.target.value)}
                          sx={{ ...textInput, mb: 2 }}
                        />

                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Enter explanation"
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const newQs = questions.map((question, i) =>
                              i === qIdx ? { ...question, explanation: e.target.value } : question,
                            );
                            updatePart({ ...part, questions: newQs });
                          }}
                          sx={{ ...textInput, mb: 2 }}
                        />

                        {audioFormat === 'onetoone' && (
                          <Box sx={{ mb: 2 }}>
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
                              <Box key={ans.id || aIdx} sx={answerOptionRow}>
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
                          startIcon={<AddCircleRoundedIcon />}
                          size="small"
                          onClick={() => addAnswer(qIdx)}
                          sx={{ mt: 2, ...actionTextButton, textTransform: 'none' }}
                        >
                          Add option
                        </Button>
                      </Box>
                    </Collapse>
                  </Paper>
                ))}
                <Box onClick={addQuestion} sx={addQuestionBox}>
                  <AddRoundedIcon sx={{ fontSize: '1.2rem' }} />
                  Add question
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
