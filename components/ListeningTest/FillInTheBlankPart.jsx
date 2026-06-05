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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AudioUploader from '../Upload/AudioUploader';
import ClientSideCustomEditor from '../Editor/ClientSideCustomEditor';
import { createDriver } from '../../utils/createDriver';
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

  const handlePartTour = (e) => {
    e.stopPropagation();
    const steps = [];
    const partId = part.id;

    if (document.querySelector(`#tour-part-header-${partId}`)) {
      steps.push({
        element: `#tour-part-header-${partId}`,
        popover: {
          title: 'Fill in the Blanks Part',
          description: `This is Part ${index + 1}. Students will listen to audio and fill in the missing words in the transcript.`,
          side: 'bottom',
          align: 'start',
        },
      });
    }

    if (document.querySelector(`#tour-score-${partId}`)) {
      steps.push({
        element: `#tour-score-${partId}`,
        popover: {
          title: 'Score per Question',
          description: 'Set the default score awarded for each correctly filled blank.',
          side: 'right',
          align: 'start',
        },
      });
    }

    if (document.querySelector(`#tour-audio-${partId}`)) {
      steps.push({
        element: `#tour-audio-${partId}`,
        popover: {
          title: 'Audio File',
          description: 'Upload the listening audio file (MP3/M4A) for this part.',
          side: 'bottom',
          align: 'start',
        },
      });
    }

    if (document.querySelector(`#tour-instruction-${partId}`)) {
      steps.push({
        element: `#tour-instruction-${partId}`,
        popover: {
          title: 'Instruction',
          description: 'Provide instructions for the students on how to complete this part.',
          side: 'bottom',
          align: 'start',
        },
      });
    }

    if (document.querySelector(`#tour-content-${partId}`)) {
      steps.push({
        element: `#tour-content-${partId}`,
        popover: {
          title: 'Content Editor',
          description:
            'Write the transcript here. Use the "(1)_" icon in the toolbar to insert blank placeholders where students need to fill in words.',
          side: 'top',
          align: 'start',
        },
      });
    }

    const insertBlankSel = `#tour-content-${partId} .ck-toolbar [data-cke-tooltip-text="Insert Blank"]`;
    if (document.querySelector(insertBlankSel)) {
      steps.push({
        element: insertBlankSel,
        popover: {
          title: 'Insert Blank (1)_',
          description:
            'CRITICAL: Click this button to insert a numbered blank placeholder. Note: There must be text either before or after the blank for it to register properly and create an answer card below.',
          side: 'bottom',
          align: 'start',
        },
      });
    }

    if (document.querySelector(`#tour-answers-${partId}`)) {
      steps.push({
        element: `#tour-answers-${partId}`,
        popover: {
          title: 'Answers Section',
          description:
            'Provide the correct answers for each blank here. You can add multiple acceptable variations for a single blank.',
          side: 'top',
          align: 'start',
        },
      });

      if (document.querySelector(`#tour-answers-${partId} .tour-option-input`)) {
        steps.push({
          element: `#tour-answers-${partId} .tour-option-input`,
          popover: {
            title: 'Correct Answer Options',
            description:
              'Enter an acceptable word or phrase for this blank. Students must match this text exactly (case-insensitive).',
            side: 'top',
            align: 'start',
          },
        });
      }

      if (document.querySelector(`#tour-answers-${partId} .tour-add-option-btn`)) {
        steps.push({
          element: `#tour-answers-${partId} .tour-add-option-btn`,
          popover: {
            title: 'Add Acceptable Variations',
            description:
              'If there are multiple correct spellings or phrasing for this blank, click here to add them.',
            side: 'top',
            align: 'start',
          },
        });
      }

      if (document.querySelector(`#tour-answers-${partId} .tour-explanation-input`)) {
        steps.push({
          element: `#tour-answers-${partId} .tour-explanation-input`,
          popover: {
            title: 'Answer Explanation',
            description:
              'Provide an explanation for the correct answer to help students understand their mistakes.',
            side: 'top',
            align: 'start',
          },
        });
      }
    }

    const driverObj = createDriver({ steps });
    driverObj.drive();
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
      <Box id={`tour-part-header-${part.id}`} sx={partHeader}>
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePartTour}
            startIcon={<HelpOutlineIcon sx={{ fontSize: '0.9rem !important' }} />}
            sx={{
              color: '#FF9E45',
              borderColor: '#FF9E45',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'none',
              borderRadius: '16px',
              py: 0.25,
              px: 1.5,
              mr: 1,
              '&:hover': {
                borderColor: '#FF9E45',
                backgroundColor: 'rgba(255, 158, 69, 0.08)',
              },
            }}
          >
            Guide
          </Button>
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
            <Box id={`tour-score-${part.id}`} sx={{ mb: 3 }}>
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

            <Box id={`tour-audio-${part.id}`} sx={{ mb: 3 }}>
              <Typography sx={labelText}>
                Audio File <span style={{ color: 'red' }}>*</span>
              </Typography>
              <AudioUploader
                value={part.audio}
                onChange={(audio) => updatePart({ ...part, audio })}
                accept="audio/mp3,audio/m4a"
              />
            </Box>

            <Box id={`tour-instruction-${part.id}`} sx={{ mb: 3 }}>
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

            <Box id={`tour-content-${part.id}`} sx={{ mb: -4 }}>
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

            <Box
              id={`tour-answers-${part.id}`}
              sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            >
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
                                      className="tour-option-input"
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
                                className="tour-add-option-btn"
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
                              className="tour-explanation-input"
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
        </Box>
      )}
    </>
  );
}
