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
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import AudioUploader from '../Upload/AudioUploader';
import { useState } from 'react';
import {
  sectionHeader,
  accentBar,
  emptyStateBox,
  numberIndicator,
  partHeader,
  rowContent,
} from '../../styles/Teacher/Listening/ListeningStyles';

export default function MatchingPart({ index, part = {}, onChange, onDelete }) {
  const questions = Array.isArray(part.questions) ? part.questions : [];
  const answers = Array.isArray(part.answers) ? part.answers : [];
  const [isCollapsed, setIsCollapsed] = useState(false);

  const updatePart = (newPart) => {
    if (onChange) onChange(newPart);
  };

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

  const addAnswer = () => {
    const newAnswer = {
      id: Date.now().toString(),
      text: '',
    };
    let newQuestions = questions;

    if (answers.length >= questions.length) {
      const newQuestion = {
        id: Date.now().toString() + '-q',
        text: '',
        selectedAnswerId: null,
      };
      newQuestions = [...questions, newQuestion];
    }
    const newPart = { ...part, answers: [...answers, newAnswer], questions: newQuestions };
    updatePart(newPart);
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
      <Box sx={partHeader}>
        <Box sx={sectionHeader}>
          <Box sx={accentBar} />
          <DragIndicatorIcon color="disabled" />
          <Box>
            <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
              Part {index + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Matching · {questions.length} questions
            </Typography>
          </Box>
        </Box>

        <Box>
          <IconButton onClick={onDelete}>
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
              <Typography variant="body2">
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
            />
          </Box>

          <Typography variant="body2">
            Audio File <span style={{ color: 'red' }}>*</span>
          </Typography>
          <AudioUploader
            value={part.audio}
            onChange={(audio) => updatePart({ ...part, audio })}
            accept="audio/mp3,audio/m4a"
          />

          <Box sx={{ mb: 3 }}>
            <Box sx={rowContent}>
              <Typography variant="body2">
                Description <span style={{ color: 'red' }}>*</span>
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="e.g., Match the items on the left with the correct answers on the right..."
              value={part.description ?? ''}
              onChange={(e) => updatePart({ ...part, description: e.target.value })}
            />
          </Box>

          <Box sx={rowContent}>
            <Typography variant="body2">
              Questions <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={addQuestion}>
              Add question
            </Button>
          </Box>

          {questions.length === 0 ? (
            <Box sx={{ ...emptyStateBox, mb: 3 }}>
              No questions yet
              <br />
              <Button startIcon={<AddIcon />} sx={{ mt: 1 }} onClick={addQuestion}>
                Add your first question
              </Button>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mb: 3 }}>
              {questions.map((question, qIdx) => (
                <Paper key={question.id} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={numberIndicator}>{qIdx + 1}</Box>

                    <TextField
                      size="small"
                      placeholder="Question text..."
                      value={question.text}
                      onChange={(e) => setQuestionText(qIdx, e.target.value)}
                      sx={{ flex: 1 }}
                    />

                    <FormControl size="small" sx={{ width: 70 }}>
                      <Select
                        value={question.selectedAnswerId || ''}
                        onChange={(e) => setQuestionAnswer(qIdx, e.target.value)}
                        displayEmpty
                      >
                        {answers.map((answer, aIdx) => (
                          <MenuItem key={answer.id} value={answer.id}>
                            {String.fromCharCode(65 + aIdx)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <IconButton color="error" onClick={() => removeQuestion(qIdx)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ ml: 5.5, mr: 7, mt: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter explanation"
                      value={question.explanation || ''}
                      onChange={(e) => {
                        const newQs = questions.map((question, i) =>
                          i === qIdx ? { ...question, explanation: e.target.value } : question,
                        );
                        updatePart({ ...part, questions: newQs });
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}

          <Box sx={rowContent}>
            <Typography variant="body2">
              Answers <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={addAnswer}>
              Add answer
            </Button>
          </Box>

          {answers.length === 0 ? (
            <Box sx={emptyStateBox}>
              No answers yet
              <br />
              <Button startIcon={<AddIcon />} sx={{ mt: 1 }} onClick={addAnswer}>
                Add your first answer
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {answers.map((answer, aIdx) => (
                <Paper key={answer.id} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={numberIndicator}>{String.fromCharCode(65 + aIdx)}</Box>

                    <TextField
                      size="small"
                      placeholder="Answer text"
                      value={answer.text}
                      onChange={(e) => setAnswerText(aIdx, e.target.value)}
                      sx={{ flex: 1 }}
                    />

                    <IconButton color="error" onClick={() => removeAnswer(aIdx)}>
                      <DeleteOutlineIcon />
                    </IconButton>
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
