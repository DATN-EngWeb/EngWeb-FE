'use client';

import { Box, Typography, TextField, IconButton, Button, Grid, Paper, Stack } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import AudioUploader from '../Upload/AudioUploader';
import ImageUploader from '../Upload/ImageUploader';

export default function MultiChoiceImagePart({ index, part = {}, onChange, onDelete }) {
  const Questions = Array.isArray(part.questions) ? part.questions : [];

  const updatePart = (newPart) => {
    if (onChange) onChange(newPart);
  };

  const addQuestion = () => {
    const newQ = {
      id: Date.now().toString(),
      text: '',
      answers: [
        { id: 'a-' + Date.now() + '-0', label: 'A', image: null },
        { id: 'b-' + Date.now() + '-1', label: 'B', image: null },
        { id: 'c-' + Date.now() + '-2', label: 'C', image: null },
      ],
      correctIndex: null,
    };
    const newPart = { ...part, questions: [...Questions, newQ] };
    updatePart(newPart);
  };

  const removeQuestion = (qIdx) => {
    const newQs = Questions.filter((_, i) => i !== qIdx);
    updatePart({ ...part, questions: newQs });
  };

  const setQuestionText = (qIdx, text) => {
    const newQs = Questions.map((q, i) => (i === qIdx ? { ...q, text } : q));
    updatePart({ ...part, questions: newQs });
  };

  const addAnswer = (qIdx) => {
    const q = Questions[qIdx];
    const nextLabel = String.fromCharCode(65 + q.answers.length); // A,B,C...
    const newAnswer = { id: `${q.id}-ans-${Date.now()}`, label: nextLabel, image: null };
    const newQs = Questions.map((qq, i) =>
      i === qIdx ? { ...qq, answers: [...qq.answers, newAnswer] } : qq,
    );
    updatePart({ ...part, questions: newQs });
  };

  const removeAnswer = (qIdx, aIdx) => {
    const q = Questions[qIdx];
    const newAnswers = q.answers.filter((_, i) => i !== aIdx);
    // re-label answers A,B,C...
    const relabeled = newAnswers.map((ans, i) => ({ ...ans, label: String.fromCharCode(65 + i) }));
    const newQs = Questions.map((qq, i) =>
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
    const newQs = Questions.map((q, i) => (i === qIdx ? { ...q, correctIndex: aIdx } : q));
    updatePart({ ...part, questions: newQs });
  };

  const handleImageChange = (qIdx, aIdx, image) => {
    const newQs = Questions.map((q, qi) => {
      if (qi !== qIdx) return q;

      const newAnswers = q.answers.map((ans, ai) => (ai === aIdx ? { ...ans, image } : ans));

      return { ...q, answers: newAnswers };
    });

    updatePart({ ...part, questions: newQs });
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
          <DragIndicatorIcon color="disabled" />
          <Box>
            <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
              Part {index + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Multiple choice images · {Questions.length} questions
            </Typography>
          </Box>
        </Box>

        <Box>
          <IconButton onClick={onDelete}>
            <DeleteOutlineIcon />
          </IconButton>
          <IconButton>
            <KeyboardArrowUpIcon />
          </IconButton>
        </Box>
      </Box>

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
          placeholder="e.g., Listen to the audio between Alice and Sam and choose the correct picture..."
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

      {Questions.length === 0 ? (
        <Box
          sx={{
            border: '1px solid #ddd',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          No questions yet
          <br />
          <Button startIcon={<AddIcon />} sx={{ mt: 1 }} onClick={addQuestion}>
            Add your first question
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {Questions.map((q, qIdx) => (
            <Paper key={q.id} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                  fullWidth
                  placeholder="Enter question text..."
                  value={q.text}
                  onChange={(e) => setQuestionText(qIdx, e.target.value)}
                />

                <IconButton color="error" onClick={() => removeQuestion(qIdx)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={1}>
                Image answers (click to set correct):
              </Typography>

              <Grid container spacing={2}>
                {q.answers.map((ans, aIdx) => {
                  const isCorrect = q.correctIndex === aIdx;

                  return (
                    <Grid
                      item
                      xs={4}
                      key={ans.id}
                      sx={{
                        maxWidth: '31%',
                        minWidth: '31%',
                        width: '31%',
                        flex: '0 0 31%',
                      }}
                    >
                      <Box
                        onClick={() => setCorrect(qIdx, aIdx)}
                        sx={{
                          border: '2px solid #ddd',
                          borderRadius: 1,
                          p: 2,
                          minHeight: 200,
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            width: '100%',
                            height: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1,
                            overflow: 'hidden',
                          }}
                        >
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
                            mt: 0.5,
                            minWidth: 40,
                            alignSelf: 'center',
                            bgcolor: isCorrect ? 'warning.main' : 'transparent',
                            color: isCorrect ? 'common.white' : 'text.primary',
                            border: '1px solid',
                            borderColor: isCorrect ? 'warning.main' : 'divider',
                          }}
                        >
                          {ans.label}
                        </Button>

                        <IconButton
                          size="small"
                          color="error"
                          sx={{ mt: 0.5, alignSelf: 'center' }}
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
                <Button startIcon={<AddIcon />} size="small" onClick={() => addAnswer(qIdx)}>
                  Add Answer
                </Button>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  );
}
