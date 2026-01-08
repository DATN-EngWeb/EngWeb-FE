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
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AudioUploader from '../Upload/AudioUploader';
import ClientSideCustomEditor from '../Editor/ClientSideCustomEditor';
import { useState } from 'react';

const options = [
  {
    id: 'onetoone',
    title: '1 audio - 1 question',
    description: 'Each question has each audio',
    icon: <HeadsetMicIcon sx={{ fontSize: 40, color: '#000' }} />,
  },
  {
    id: 'onetomany',
    title: '1 audio - many question',
    description: 'One audio for all questions',
    icon: <MusicNoteIcon sx={{ fontSize: 40, color: '#000' }} />,
  },
];

export default function MultiChoiceTextPart({ index, part = {}, onChange, onDelete }) {
  const questions = Array.isArray(part.questions) ? part.questions : [];
  const [audioFormat, setAudioFormat] = useState(part.audioFormat || 'onetoone');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [content, setContent] = useState(part.content || '');

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
    const newQs = questions.map((q, i) => (i === qIdx ? { ...q, correctIndex: aIdx } : q));
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
                The score for each question <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={part.totalScore ?? ''}
                onChange={(e) => updatePart({ ...part, totalScore: e.target.value })}
              />
            </Box>
          </Box>

          <Typography variant="body2" mb={1}>
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
                        sx={{ color: '#9E9E9E', fontSize: '14px', mt: 0.5 }}
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" mb={1}>
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
            />
          </Box>

          {audioFormat === 'onetomany' && (
            <>
              <Typography variant="body2" mb={1}>
                Audio File <span style={{ color: 'red' }}>*</span>
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
                    Content
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: '300px',
                    overflowY: 'auto',
                    border: '1px solid #d0d0d0',
                    borderRadius: '8px',
                    position: 'relative',
                    zIndex: 1,
                    overflow: 'visible',
                  }}
                >
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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="body2">
              Questions <span style={{ color: 'red' }}>*</span>
            </Typography>
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
              {questions.map((q, qIdx) => (
                <Paper key={q.id} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
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
                      placeholder="Enter question text"
                      value={q.text}
                      onChange={(e) => setQuestionText(qIdx, e.target.value)}
                    />

                    <IconButton color="error" onClick={() => removeQuestion(qIdx)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ ml: 5, mr: 7, mb: 2 }}>
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
                    />
                  </Box>

                  {audioFormat === 'onetoone' && (
                    <>
                      <Typography variant="body2" mb={1}>
                        Audio File <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <AudioUploader
                        value={q.audio}
                        onChange={(audio) => handleAudioChange(qIdx, audio)}
                        accept="audio/mp3,audio/m4a"
                      />
                    </>
                  )}

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Text answers (click to set correct):
                  </Typography>

                  <Stack spacing={1}>
                    {q.answers.map((ans, aIdx) => {
                      const isCorrect = q.correctIndex === aIdx;

                      return (
                        <Box
                          key={ans.id || aIdx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: '8px 16px',
                            border: '1.5px solid #E0E0E0',
                            borderRadius: '12px',
                            width: '100%',
                            mb: 2,
                          }}
                        >
                          <Radio
                            checked={isCorrect}
                            onChange={() => setCorrect(qIdx, aIdx)}
                            sx={{
                              color: '#757575',
                              '&.Mui-checked': { color: '#4A2B20' },
                              p: 1,
                              mr: 1,
                            }}
                          />

                          <Typography
                            sx={{
                              fontWeight: 'bold',
                              mr: 2,
                              minWidth: '20px',
                              color: '#000',
                            }}
                          >
                            {String.fromCharCode(65 + aIdx)}.
                          </Typography>

                          <TextField
                            size="small"
                            placeholder={`Answer ${String.fromCharCode(65 + aIdx)}...`}
                            value={ans.text || ''}
                            onChange={(e) => setAnswerText(qIdx, aIdx, e.target.value)}
                            sx={{ flex: 1, minWidth: 0 }}
                          />

                          <IconButton
                            size="small"
                            onClick={() => removeAnswer(qIdx, aIdx)}
                            sx={{
                              ml: 1,
                              color: '#BDBDBD',
                              '&:hover': { color: '#d32f2f' },
                            }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Stack>

                  <Button
                    startIcon={<AddCircleOutlineIcon />}
                    size="small"
                    onClick={() => addAnswer(qIdx)}
                    sx={{ mt: 1 }}
                  >
                    Add Answer
                  </Button>
                </Paper>
              ))}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}
