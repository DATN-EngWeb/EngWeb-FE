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
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import AudioUploader from '../Upload/AudioUploader';
import { useState } from 'react';

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
      selectedAnswerId: null,
    };
    const newPart = { ...part, questions: [...questions, newQuestion] };
    updatePart(newPart);
  };

  const removeQuestion = (qIdx) => {
    const newQuestions = questions.filter((_, i) => i !== qIdx);
    updatePart({ ...part, questions: newQuestions });
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
    const newPart = { ...part, answers: [...answers, newAnswer] };
    updatePart(newPart);
  };

  const removeAnswer = (aIdx) => {
    const removedAnswer = answers[aIdx];
    const newAnswers = answers.filter((_, i) => i !== aIdx);
    const newQuestions = questions.map((q) =>
      q.selectedAnswerId === removedAnswer.id ? { ...q, selectedAnswerId: null } : q,
    );
    updatePart({ ...part, answers: newAnswers, questions: newQuestions });
  };

  const setAnswerText = (aIdx, text) => {
    const newAnswers = answers.map((ans, i) => (i === aIdx ? { ...ans, text } : ans));
    updatePart({ ...part, answers: newAnswers });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: '4px',
              height: '36px',
              backgroundColor: 'yellow.main',
              borderRadius: '1rem',
            }}
          />
          <DragIndicatorIcon color="disabled" />
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
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" mb={1}>
                Total score
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={part.totalScore ?? ''}
                onChange={(e) => updatePart({ ...part, totalScore: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" mb={1}>
                Time (HH:MM)
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  value={part.time ? dayjs(part.time, 'HH:mm') : dayjs('00:05', 'HH:mm')}
                  onChange={(newValue) => {
                    const timeString = newValue ? newValue.format('HH:mm') : '00:05';
                    updatePart({ ...part, time: timeString });
                  }}
                  ampm={false}
                  views={['hours', 'minutes']}
                  minutesStep={1}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          <Typography variant="body2" mb={1}>
            Audio File
          </Typography>
          <AudioUploader
            value={part.audio}
            onChange={(audio) => updatePart({ ...part, audio })}
            accept="audio/mp3,audio/m4a"
          />

          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" mb={1}>
                Description
              </Typography>
              <Button startIcon={<AddIcon />} size="small">
                Edit in editor
              </Button>
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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="body2">Questions</Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={addQuestion}>
              Add question
            </Button>
          </Box>

          {questions.length === 0 ? (
            <Box
              sx={{
                border: '1px solid #ddd',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                color: 'text.secondary',
                mb: 3,
              }}
            >
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
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'black',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {qIdx + 1}
                    </Box>

                    <TextField
                      size="small"
                      placeholder="Question text..."
                      value={question.text}
                      onChange={(e) => setQuestionText(qIdx, e.target.value)}
                      sx={{ flex: 1 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={question.selectedAnswerId || ''}
                        onChange={(e) => setQuestionAnswer(qIdx, e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Select answer</em>
                        </MenuItem>
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
                </Paper>
              ))}
            </Stack>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="body2">Answers</Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={addAnswer}>
              Add answer
            </Button>
          </Box>

          {answers.length === 0 ? (
            <Box
              sx={{
                border: '1px solid #ddd',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
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
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'black',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {String.fromCharCode(65 + aIdx)}
                    </Box>

                    <TextField
                      size="small"
                      placeholder="Answer text..."
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
