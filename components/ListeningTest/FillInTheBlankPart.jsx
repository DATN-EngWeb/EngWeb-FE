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
  Button,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AudioUploader from '../Upload/AudioUploader';
import ClientSideCustomEditor from '../Editor/ClientSideCustomEditor';
import { useRef, useState } from 'react';
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
  const layoutRef = useRef(null);

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

  const normalizeAnswer = (ans) => {
    if (ans.acceptedAnswers && Array.isArray(ans.acceptedAnswers)) {
      return ans;
    }
    return {
      ...ans,
      acceptedAnswers: ans.text
        ? [{ id: ans.id + '-v0', text: ans.text }]
        : [{ id: ans.id + '-v0', text: '' }],
    };
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
          acceptedAnswers: [
            {
              id: `${Date.now()}-${i}-0`,
              text: '',
            },
          ],
        });
      }
    } else if (blankCount < currentAnswerCount) {
      // Remove answers from the end
      newAnswers = newAnswers.slice(0, blankCount);
    }

    newAnswers = newAnswers.map(normalizeAnswer);

    updatePart({ ...part, content: newContent, answers: newAnswers });
  };

  const setVariantText = (aIdx, vIdx, text) => {
    const newAnswers = answers.map((ans, i) => {
      if (i === aIdx) {
        const normalizedAns = normalizeAnswer(ans);
        const newAcceptedAnswers = normalizedAns.acceptedAnswers.map((v, j) =>
          j === vIdx ? { ...v, text } : v,
        );
        return { ...normalizedAns, acceptedAnswers: newAcceptedAnswers };
      }
      return ans;
    });
    updatePart({ ...part, answers: newAnswers });
  };

  const addVariant = (aIdx) => {
    const newAnswers = answers.map((ans, i) => {
      if (i === aIdx) {
        const normalizedAns = normalizeAnswer(ans);
        const acceptedAnswers = normalizedAns.acceptedAnswers || [];
        return {
          ...normalizedAns,
          acceptedAnswers: [
            ...acceptedAnswers,
            {
              id: `${Date.now()}-${aIdx}-${acceptedAnswers.length}`,
              text: '',
            },
          ],
        };
      }
      return ans;
    });
    updatePart({ ...part, answers: newAnswers });
  };

  const removeVariant = (aIdx, vIdx) => {
    const newAnswers = answers.map((ans, i) => {
      if (i === aIdx) {
        const normalizedAns = normalizeAnswer(ans);
        const acceptedAnswers = normalizedAns.acceptedAnswers || [];
        // Keep at least 1 answer
        if (acceptedAnswers.length === 1) return normalizedAns;
        const newAcceptedAnswers = acceptedAnswers.filter((_, j) => j !== vIdx);
        return { ...normalizedAns, acceptedAnswers: newAcceptedAnswers };
      }
      return ans;
    });
    updatePart({ ...part, answers: newAnswers });
  };

  const setAnswerExplanation = (aIdx, explanation) => {
    const newAnswers = answers.map((ans, i) => {
      if (i === aIdx) {
        const normalizedAns = normalizeAnswer(ans);
        return { ...normalizedAns, explanation };
      }
      return ans;
    });
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
          ref={layoutRef}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mt: 1,
          }}
        >
          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
            }}
          >
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
                  const newAnswers = answers.map((a) => {
                    const normalizedAns = normalizeAnswer(a);
                    return {
                      ...normalizedAns,
                      score: scoreValue,
                    };
                  });
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
                  Instruction <span style={{ color: 'red' }}>*</span>
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

            <Box sx={{ mb: -4 }}>
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
                {answers.map((answer, aIdx) => {
                  const normalizedAnswer = normalizeAnswer(answer);
                  const acceptedAnswers = normalizedAnswer.acceptedAnswers || [];
                  return (
                    <Paper key={normalizedAnswer.id} variant="outlined" sx={outlinedCard}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Box sx={numberIndicator}>{aIdx + 1}</Box>
                        {collapsedQuestions[normalizedAnswer.id] && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              ml: 0.5,
                            }}
                          >
                            {acceptedAnswers[0]?.text || ''}
                          </Typography>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={() => toggleQuestionCollapse(normalizedAnswer.id)}>
                          <ExpandLessRoundedIcon
                            sx={{
                              fontSize: '1.4rem',
                              transition: 'transform 0.3s ease',
                              transform: collapsedQuestions[normalizedAnswer.id]
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            }}
                          />
                        </IconButton>
                      </Box>

                      <Collapse
                        in={!collapsedQuestions[normalizedAnswer.id]}
                        sx={{ width: '100%' }}
                      >
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* Correct Answers Section */}
                          <Box>
                            <Typography
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                mb: 1.5,
                                color: 'text.secondary',
                              }}
                            >
                              Correct Answer(s)
                            </Typography>
                            <Stack spacing={1}>
                              {acceptedAnswers.map((answer, vIdx) => (
                                <Box
                                  key={answer.id}
                                  sx={{
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  <TextField
                                    size="small"
                                    fullWidth
                                    placeholder={`Option ${vIdx + 1}`}
                                    value={answer.text}
                                    onChange={(e) => setVariantText(aIdx, vIdx, e.target.value)}
                                    multiline
                                    sx={textInput}
                                  />
                                  {acceptedAnswers.length > 1 && (
                                    <IconButton
                                      size="small"
                                      onClick={() => removeVariant(aIdx, vIdx)}
                                      sx={{
                                        mt: 0.5,
                                      }}
                                    >
                                      <DeleteRoundedIcon sx={{ fontSize: '1.2rem' }} />
                                    </IconButton>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                            <Button
                              size="small"
                              startIcon={<AddRoundedIcon sx={{ fontSize: '1.4rem' }} />}
                              onClick={() => addVariant(aIdx)}
                              sx={{
                                mt: 1,
                                textTransform: 'none',
                                color: 'primary.main',
                              }}
                            >
                              Add option
                            </Button>
                          </Box>

                          {/* Explanation Section */}
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Enter explanation"
                            value={normalizedAnswer.explanation || ''}
                            onChange={(e) => setAnswerExplanation(aIdx, e.target.value)}
                            multiline
                            sx={textInput}
                          />
                        </Box>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
