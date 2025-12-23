'use client';

import { Box, Typography, TextField, IconButton, Button, Grid, Paper, Stack } from '@mui/material';
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

export default function FillInTheBlankPart({ index, part = {}, onChange, onDelete }) {
  const answers = Array.isArray(part.answers) ? part.answers : [];
  const [isCollapsed, setIsCollapsed] = useState(false);

  const updatePart = (newPart) => {
    if (onChange) onChange(newPart);
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
    const newAnswers = answers.filter((_, i) => i !== aIdx);
    updatePart({ ...part, answers: newAnswers });
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
              Fill in the blanks · {answers.length} questions
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
                Add your answer
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {answers.map((answer, aIdx) => (
                <Paper key={answer.id} variant="outlined" sx={{ p: 2 }}>
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
                      {aIdx + 1}
                    </Box>

                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter answer text..."
                      value={answer.text}
                      onChange={(e) => setAnswerText(aIdx, e.target.value)}
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
