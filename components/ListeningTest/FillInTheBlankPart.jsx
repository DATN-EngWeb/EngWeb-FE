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
  Collapse,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AudioUploader from '../Upload/AudioUploader';
import ClientSideCustomEditor from '../Editor/ClientSideCustomEditor';
import { useState } from 'react';
import {
  sectionHeader,
  accentBar,
  scrollEditorBox,
  emptyStateBox,
  numberIndicator,
  partHeader,
  rowContent,
  labelText,
  textInput,
  outlinedCard,
  trashIconButton,
} from '../../styles/Teacher/Listening/ListeningStyles';

export default function FillInTheBlankPart({ index, part = {}, onChange, onDelete }) {
  const answers = Array.isArray(part.answers) ? part.answers : [];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedQuestions, setCollapsedQuestions] = useState({});

  const toggleQuestionCollapse = (questionId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };
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
      <Box sx={partHeader}>
        <Box sx={sectionHeader}>
          <Box sx={accentBar} />
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
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mt: 1,
          }}
        >
          {/* -------------- Left Column: Config & Content -------------- */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
                  const newAnswers = answers.map((a) => ({
                    ...a,
                    score: scoreValue,
                  }));
                  updatePart({ ...part, score: scoreValue, answers: newAnswers });
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
          </Box>

          {/* -------------- Right Column: Answers -------------- */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={rowContent}>
                <Typography sx={labelText}>
                  Content <span style={{ color: 'red' }}>*</span>
                </Typography>
              </Box>
              <Box sx={scrollEditorBox}>
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

            <Box sx={rowContent}>
              <Typography sx={labelText}>
                Answers <span style={{ color: 'red' }}>*</span>
              </Typography>
            </Box>

            {answers.length === 0 ? (
              <Box sx={emptyStateBox}>
                No blanks inserted yet. Use the editor toolbar to insert blanks.
              </Box>
            ) : (
              <Stack spacing={2}>
                {answers.map((answer, aIdx) => (
                  <Paper key={answer.id} variant="outlined" sx={outlinedCard}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: 1 }}>
                      <Box sx={numberIndicator}>{aIdx + 1}</Box>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton onClick={() => toggleQuestionCollapse(answer.id)}>
                        <ExpandLessRoundedIcon
                          sx={{
                            fontSize: '1.4rem',
                            transition: 'transform 0.3s ease',
                            transform: collapsedQuestions[answer.id]
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                          }}
                        />
                      </IconButton>
                    </Box>

                    <Collapse in={!collapsedQuestions[answer.id]} sx={{ width: '100%' }}>
                      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Enter answer text"
                          value={answer.text}
                          onChange={(e) => setAnswerText(aIdx, e.target.value)}
                          sx={textInput}
                        />

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
                          sx={textInput}
                        />
                      </Box>
                    </Collapse>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
