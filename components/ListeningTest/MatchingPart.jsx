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
  Collapse,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AudioUploader from '../Upload/AudioUploader';
import { useState } from 'react';
import {
  sectionHeader,
  accentBar,
  emptyStateBox,
  numberIndicator,
  partHeader,
  rowContent,
  labelText,
  textInput,
  answerTextInput,
  actionTextButton,
  outlinedCard,
  matchingAnswerLabel,
  trashIconButton,
  addQuestionBox,
} from '../../styles/Teacher/Listening/ListeningStyles';

export default function MatchingPart({ index, part = {}, onChange, onDelete }) {
  const questions = Array.isArray(part.questions) ? part.questions : [];
  const answers = Array.isArray(part.answers) ? part.answers : [];
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedQuestions, setCollapsedQuestions] = useState({});

  const toggleQuestionCollapse = (questionId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

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
          {/* -------------- Left Column: Config & Audio -------------- */}
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
                  const newQuestions = questions.map((q) => ({
                    ...q,
                    score: scoreValue,
                  }));
                  updatePart({ ...part, score: scoreValue, questions: newQuestions });
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
                minRows={4}
                placeholder="e.g., Match the items on the left with the correct answers on the right..."
                value={part.description ?? ''}
                onChange={(e) => updatePart({ ...part, description: e.target.value })}
                sx={textInput}
              />
            </Box>
          </Box>

          {/* -------------- Right Column: Questions & Answers -------------- */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* -------------- Questions Section -------------- */}
            <Box>
              <Box sx={rowContent}>
                <Typography sx={labelText}>
                  Questions <span style={{ color: 'red' }}>*</span>
                </Typography>
              </Box>

              {questions.length === 0 ? (
                <Box sx={{ ...emptyStateBox, mb: 3 }}>
                  No questions yet
                  <br />
                  <Button
                    startIcon={<AddRoundedIcon />}
                    sx={{ mt: 1, ...actionTextButton, textTransform: 'none' }}
                    onClick={addQuestion}
                  >
                    Add your first question
                  </Button>
                </Box>
              ) : (
                <Stack spacing={2} sx={{ mb: 2 }}>
                  {' '}
                  {questions.map((question, qIdx) => (
                    <Paper key={question.id} variant="outlined" sx={outlinedCard}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: 1 }}>
                        <Box sx={numberIndicator}>{qIdx + 1}</Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={() => removeQuestion(qIdx)} sx={trashIconButton}>
                          <DeleteRoundedIcon sx={{ fontSize: '1.2rem' }} />
                        </IconButton>
                        <IconButton onClick={() => toggleQuestionCollapse(question.id)}>
                          <ExpandLessRoundedIcon
                            sx={{
                              fontSize: '1.4rem',
                              transition: 'transform 0.3s ease',
                              transform: collapsedQuestions[question.id]
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            }}
                          />
                        </IconButton>
                      </Box>

                      <Collapse in={!collapsedQuestions[question.id]} sx={{ width: '100%' }}>
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField
                              size="small"
                              placeholder="Question text..."
                              value={question.text}
                              onChange={(e) => setQuestionText(qIdx, e.target.value)}
                              sx={{ ...textInput, flex: 1 }}
                            />

                            <FormControl
                              size="small"
                              sx={{
                                width: 110,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '1rem',
                                },
                              }}
                            >
                              <Select
                                value={question.selectedAnswerId || ''}
                                onChange={(e) => setQuestionAnswer(qIdx, e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="" disabled>
                                  <em>Select...</em>
                                </MenuItem>
                                {answers.map((answer, aIdx) => (
                                  <MenuItem key={answer.id} value={answer.id}>
                                    {String.fromCharCode(65 + aIdx)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>

                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Enter explanation"
                            value={question.explanation || ''}
                            onChange={(e) => {
                              const newQs = questions.map((question, i) =>
                                i === qIdx
                                  ? { ...question, explanation: e.target.value }
                                  : question,
                              );
                              updatePart({ ...part, questions: newQs });
                            }}
                            sx={textInput}
                          />
                        </Box>
                      </Collapse>
                    </Paper>
                  ))}
                  <Box onClick={addQuestion} sx={addQuestionBox}>
                    <AddRoundedIcon sx={{ fontSize: '1.2rem' }} />
                    Add question
                  </Box>
                </Stack>
              )}
            </Box>

            {/* -------------- Answers Section -------------- */}
            <Box>
              <Box sx={rowContent}>
                <Typography sx={labelText}>
                  Answers <span style={{ color: 'red' }}>*</span>
                </Typography>
              </Box>

              {answers.length === 0 ? (
                <Box sx={emptyStateBox}>Answers are generated automatically from questions.</Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  {answers.map((answer, aIdx) => (
                    <Paper
                      key={answer.id}
                      variant="outlined"
                      sx={{
                        ...outlinedCard,
                        p: 1,
                        py: 0.75,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={matchingAnswerLabel}>{String.fromCharCode(65 + aIdx)}</Box>

                        <TextField
                          size="small"
                          placeholder="Answer text"
                          value={answer.text}
                          onChange={(e) => setAnswerText(aIdx, e.target.value)}
                          sx={{
                            ...answerTextInput,
                            flex: 1,
                            '& .MuiOutlinedInput-input': {
                              py: 0.25,
                              lineHeight: 1.2,
                            },
                          }}
                        />

                        <IconButton onClick={() => removeAnswer(aIdx)} sx={trashIconButton}>
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
