/* global DOMParser */
'use client';

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AudioUploader from '../Upload/AudioUploader';
import ClientSideCustomEditor from '../Editor/ClientSideCustomEditor';
import { useState } from 'react';

export default function FillInTheBlankPart({ index, part = {}, onChange, onDelete }) {
  const answers = Array.isArray(part.answers) ? part.answers : [];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [content, setContent] = useState(part.content || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const updatePart = (newPart) => {
    if (onChange) onChange(newPart);
  };

  const countBlanks = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.querySelectorAll('.blank-element').length;
  };

  const syncAnswersWithBlanks = (newContent) => {
    const blankCount = countBlanks(newContent);
    const currentAnswerCount = answers.length;

    let newAnswers = [...answers];

    if (blankCount > currentAnswerCount) {
      // Add answers
      for (let i = currentAnswerCount; i < blankCount; i++) {
        newAnswers.push({
          id: `${Date.now()}-${i}`,
          text: '',
        });
      }
    } else if (blankCount < currentAnswerCount) {
      // Remove answers from the end
      newAnswers = newAnswers.slice(0, blankCount);
    }

    updatePart({ ...part, content: newContent, answers: newAnswers });
  };

  const setAnswerText = (aIdx, text) => {
    const newAnswers = answers.map((ans, i) => (i === aIdx ? { ...ans, text } : ans));
    updatePart({ ...part, answers: newAnswers });
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSnackbar({ ...snackbar, open: false })}>
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

          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" mb={1}>
                Content <span style={{ color: 'red' }}>*</span>
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
                  syncAnswersWithBlanks(newContent);
                }}
                onError={(message) => setSnackbar({ open: true, message })}
                startingBlankId={1}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="body2">
              Answers <span style={{ color: 'red' }}>*</span>
            </Typography>
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
              No blanks inserted yet. Use the editor toolbar to insert blanks.
            </Box>
          ) : (
            <Stack spacing={2}>
              {answers.map((answer, aIdx) => (
                <Paper key={answer.id} variant="outlined" sx={{ p: 2 }}>
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
                      {aIdx + 1}
                    </Box>

                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter answer text"
                      value={answer.text}
                      onChange={(e) => setAnswerText(aIdx, e.target.value)}
                    />
                  </Box>

                  <Box sx={{ ml: 5, mr: 7 }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter explanation"
                      value={answer.explanation || ''}
                      onChange={(e) => {
                        const newAnswers = answers.map((ans, i) =>
                          i === aIdx ? { ...ans, explanation: e.target.value } : ans,
                        );
                        updatePart({ ...part, answers: newAnswers });
                      }}
                    />
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
