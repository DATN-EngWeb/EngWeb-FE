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
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AudioUploader from '../Upload/AudioUploader';
import ImageUploader from '../Upload/ImageUploader';
import { useState } from 'react';
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
} from '../../styles/Teacher/Listening/ListeningStyles';

export default function MultiChoiceImagePart({ index, part = {}, onChange, onDelete }) {
  const questions = Array.isArray(part.questions) ? part.questions : [];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const updatePart = (newPart) => {
    if (onChange) onChange(newPart);
  };

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
          <DragIndicatorIcon color="disabled" />
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
            <DeleteOutlineIcon />
          </IconButton>
          <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </IconButton>
        </Box>
      </Box>

      {!isCollapsed && (
        <>
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
            Audio File <span style={{ color: 'red' }}>*</span>
          </Typography>
          <AudioUploader
            value={part.audio}
            onChange={(audio) => updatePart({ ...part, audio })}
            accept="audio/mp3,audio/m4a"
          />

          <Box sx={{ mb: 3 }}>
            <Box sx={rowContent}>
              <Typography sx={labelText}>
                Description <span style={{ color: 'red' }}>*</span>
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="e.g., Listen to the audio between Alice and Sam and choose the correct picture..."
              value={part.description ?? ''}
              onChange={(e) => updatePart({ ...part, description: e.target.value })}
              sx={textInput}
            />
          </Box>

          <Box sx={rowContent}>
            <Typography sx={labelText}>
              Questions <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Button
              startIcon={<AddIcon />}
              size="small"
              onClick={addQuestion}
              sx={{ ...actionTextButton, textTransform: 'none' }}
            >
              Add question
            </Button>
          </Box>

          {questions.length === 0 ? (
            <Box sx={emptyStateBox}>
              No questions yet
              <br />
              <Button
                startIcon={<AddIcon />}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={numberIndicator}>{qIdx + 1}</Box>

                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter question text"
                      value={q.text}
                      onChange={(e) => setQuestionText(qIdx, e.target.value)}
                      sx={textInput}
                    />

                    <IconButton onClick={() => removeQuestion(qIdx)} sx={trashIconButton}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ width: 28 }} />
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
                      sx={textInput}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Image answers (click to set correct):
                  </Typography>

                  <Grid container spacing={2} sx={{ display: 'flex' }}>
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
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Box mt={1}>
                    <Button
                      startIcon={<AddCircleOutlineIcon />}
                      size="small"
                      onClick={() => addAnswer(qIdx)}
                      sx={{ ...actionTextButton, textTransform: 'none' }}
                    >
                      Add Answer
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </>
      )}
    </>
  );
}
