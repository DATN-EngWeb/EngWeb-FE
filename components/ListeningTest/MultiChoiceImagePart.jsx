'use client';

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Grid,
  Paper,
  Stack,
  Snackbar,
  Alert,
  Collapse,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AudioUploader from '../Upload/AudioUploader';
import ImageUploader from '../Upload/ImageUploader';
import { useEffect, useRef, useState } from 'react';
import {
  sectionHeader,
  accentBar,
  emptyStateBox,
  numberIndicator,
  partHeader,
  rowContent,
  answerImageBox,
  imageContainer,
  answerLabelButton,
  labelText,
  textInput,
  actionTextButton,
  outlinedCard,
  trashIconButton,
  addQuestionBox,
  addOptionButton,
} from '../../styles/Teacher/Listening/ListeningStyles';

export default function MultiChoiceImagePart({ index, part = {}, onChange, onDelete }) {
  const questions = Array.isArray(part.questions) ? part.questions : [];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedQuestions, setCollapsedQuestions] = useState({});
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const layoutRef = useRef(null);

  const toggleQuestionCollapse = (questionId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

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
    const newQ = {
      id: Date.now().toString(),
      text: '',
      score: part.score || 0,
      answers: [
        { id: 'a-' + Date.now() + '-0', label: 'A', image: null },
        { id: 'b-' + Date.now() + '-1', label: 'B', image: null },
        { id: 'c-' + Date.now() + '-2', label: 'C', image: null },
      ],
      correctIndex: null,
    };
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

  const addAnswer = (qIdx) => {
    const q = questions[qIdx];
    const nextLabel = String.fromCharCode(65 + q.answers.length); // A,B,C...
    const newAnswer = { id: `${q.id}-ans-${Date.now()}`, label: nextLabel, image: null };
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

  const handleImageChange = (qIdx, aIdx, image) => {
    const newQs = questions.map((q, qi) => {
      if (qi !== qIdx) return q;

      const newAnswers = q.answers.map((ans, ai) => (ai === aIdx ? { ...ans, image } : ans));

      return { ...q, answers: newAnswers };
    });

    updatePart({ ...part, questions: newQs });
  };

  return (
    <>
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
              Multiple choice images · {questions.length} questions
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
        <Box
          ref={layoutRef}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 3, lg: 0 },
            mt: 1,
          }}
        >
          {/* -------------- Left Column: Config & Audio -------------- */}
          <Box
            sx={{
              flex: { xs: '1 1 auto', lg: `0 0 ${leftPaneWidth}%` },
              minWidth: 0,
              pr: { lg: 1.5 },
            }}
          >
            <Box sx={{ mb: 2 }}>
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

            <Box sx={{ mb: 3 }}>
              <Typography sx={labelText}>
                Audio File <span style={{ color: 'red' }}>*</span>
              </Typography>
              <AudioUploader
                value={part.audio}
                onChange={(audio) => updatePart({ ...part, audio })}
                accept="audio/mp3,audio/m4a"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
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
          </Box>

          <Box
            onMouseDown={() => setIsDraggingSplitter(true)}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              flexShrink: 0,
              cursor: 'col-resize',
              userSelect: 'none',
              position: 'relative',
              zIndex: 2,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: '2px',
                transform: 'translateX(-50%)',
                backgroundColor: '#D9D9D9',
              },
            }}
          >
            <Box
              sx={{
                width: '34px',
                height: '34px',
                borderRadius: '999px',
                bgcolor: '#fff',
                border: '1px solid #E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                color: 'text.secondary',
                fontSize: '1.2rem',
              }}
            >
              ↔
            </Box>
          </Box>

          {/* -------------- Right Column: Questions -------------- */}
          <Box
            sx={{
              flex: { xs: '1 1 auto', lg: '1 1 0' },
              minWidth: 0,
              pl: { lg: 1.5 },
            }}
          >
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
                        <Typography variant="body2" color="text.secondary">
                          Image answers (click to set correct):
                        </Typography>

                        <Grid container spacing={2} sx={{ display: 'flex', mt: 1 }}>
                          {q.answers.map((ans, aIdx) => {
                            const isCorrect = q.correctIndex === aIdx;

                            return (
                              <Grid item xs={4} key={ans.id} sx={{ flex: 1, minWidth: 0 }}>
                                <Box onClick={() => setCorrect(qIdx, aIdx)} sx={answerImageBox}>
                                  <Box sx={imageContainer}>
                                    <Box sx={{ width: '100%', height: '100%' }}>
                                      <ImageUploader
                                        value={ans.image}
                                        onChange={(img) => handleImageChange(qIdx, aIdx, img)}
                                        height={120}
                                      />
                                    </Box>
                                  </Box>

                                  <Button
                                    size="small"
                                    sx={{
                                      ...answerLabelButton,
                                      bgcolor: isCorrect ? 'yellow.main' : 'transparent',
                                      color: isCorrect ? 'common.white' : 'text.primary',
                                      borderColor: isCorrect ? 'yellow.main' : 'divider',
                                    }}
                                  >
                                    {ans.label}
                                  </Button>

                                  <IconButton
                                    size="small"
                                    sx={{
                                      ...trashIconButton,
                                      mt: 0.5,
                                      alignSelf: 'center',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeAnswer(qIdx, aIdx);
                                    }}
                                  >
                                    <DeleteRoundedIcon />
                                  </IconButton>
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>

                        <Button
                          startIcon={<AddRoundedIcon sx={{ fontSize: '1.4rem' }} />}
                          onClick={() => addAnswer(qIdx)}
                          sx={addOptionButton}
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
    </>
  );
}
