import React from 'react';
import { useEffect } from 'react';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { FormControl, FormLabel, OutlinedInput, Select, MenuItem } from '@mui/material';
import {
  multipleChoiceStyles,
  matchingStyles,
} from '../../../styles/Teacher/Reading/QuesitonTypeStyles';
import { uploadReadingStyles } from '../../../styles/Teacher/Reading/UploadReadingStyles';
import { Box, Typography } from '@mui/material';
import ClientSideCustomEditor from '../../../components/Editor/ClientSideCustomEditor';

export default function MatchingForm({
  flag,
  localAnswers,
  part,
  partId,
  index,
  handleDeletePart,
  handleDeleteQuestion,
  questions,
  setQuestions,
  setLocalAnswers,
  handleUpdateScoreForEachQuestionPart,
  handleUpdateContentPart,
  handleEditorError,
  errors,
}) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [answers, setLocalAnswersProp] = React.useState(() => {
    if (localAnswers && localAnswers.length > 0) {
      return localAnswers;
    }
    const count = questions.filter((q) => q.action !== 'delete').length;
    return Array.from({ length: Math.max(1, count) }, (_, i) => ({
      id: i,
      option_label: String.fromCharCode(65 + i),
    }));
  });

  const activeCount = questions.filter((q) => q.action !== 'delete').length;

  useEffect(() => {
    const activeLabels = Array.from({ length: Math.max(1, activeCount) }, (_, i) =>
      String.fromCharCode(65 + i),
    );

    const nextAnswers = activeLabels.map((label, i) => {
      const existingAnswer = answers.find((a) => a.option_label === label);
      return {
        id: existingAnswer ? existingAnswer.id : i,
        option_label: label,
      };
    });

    // Synchronize with parent state
    if (JSON.stringify(nextAnswers) !== JSON.stringify(answers)) {
      setLocalAnswersProp(nextAnswers);
      setLocalAnswers(nextAnswers);
    }

    let needsFix = false;
    const validatedQuestions = questions.map((q) => {
      if (q.action === 'delete') return q;

      const currentLabel = q.answers?.[0]?.option_label;

      if (currentLabel && !activeLabels.includes(currentLabel)) {
        needsFix = true;
        return {
          ...q,
          answers: [{ ...q.answers[0], option_label: '' }],
          ...(flag === 'update' && !q.action && { action: 'update' }),
        };
      }
      return q;
    });

    if (needsFix) {
      setQuestions(validatedQuestions);
    }
  }, [activeCount, answers, questions, setQuestions, setLocalAnswers]);

  const handleAddQuestion = () => {
    const activeQs = questions.filter((q) => q.action !== 'delete');

    const newQuestion = {
      id: Date.now(),
      question_number: activeQs.length + 1,
      content: '',
      explanation: '',
      answers: [
        {
          id: 0,
          option_label: '',
          is_correct: true,
          ...(flag === 'update' && { action: 'create' }),
        },
      ],
      ...(flag === 'update' && { action: 'create' }),
    };

    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateCorrectAnswer = (questionId, selectedLabel) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const targetAns = q.answers[0];
        return {
          ...q,
          ...(flag === 'update' && !q.action && { action: 'update' }),
          answers: [
            {
              ...targetAns,
              option_label: selectedLabel,
              ...(flag === 'update' && !targetAns.action && { action: 'update' }),
            },
          ],
        };
      } else if (q.answers?.[0]?.option_label === selectedLabel && selectedLabel !== '') {
        const targetAns = q.answers[0];
        return {
          ...q,
          ...(flag === 'update' && !q.action && { action: 'update' }),
          answers: [
            {
              ...targetAns,
              option_label: '',
              ...(flag === 'update' && !targetAns.action && { action: 'update' }),
            },
          ],
        };
      }

      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleUpdateQuestionContent = (questionId, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? { ...q, content: value, ...(flag === 'update' && !q.action && { action: 'update' }) }
        : q,
    );
    setQuestions(updatedQuestions);
  };

  const handleUpdateExplanation = (questionId, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? { ...q, explanation: value, ...(flag === 'update' && !q.action && { action: 'update' }) }
        : q,
    );
    setQuestions(updatedQuestions);
  };

  return (
    <>
      {/* ------------- Heading ------------- */}
      <Box sx={uploadReadingStyles.partEditorHeader}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            minWidth: 0,
            gap: 2,
          }}
        >
          <Box
            sx={{
              ...multipleChoiceStyles.simpleBoxFlexRow,
              gap: 2,
              justifyContent: 'flex-start',
              minWidth: 0,
              flex: 1,
            }}
          >
            <Box
              sx={{
                width: '4px',
                height: { xs: '36px', md: '40px' },
                backgroundColor: 'yellow.main',
                borderRadius: '1rem',
                flexShrink: 0,
              }}
            ></Box>
            <Box sx={multipleChoiceStyles.headingContainer}>
              <Typography sx={multipleChoiceStyles.headingCard}>Part {index + 1}</Typography>
              <Typography sx={multipleChoiceStyles.descriptionCard}>
                Matching · {questions.filter((q) => q.action !== 'delete').length} questions
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              ...multipleChoiceStyles.simpleBoxFlexRow,
              gap: 0.5,
              flexShrink: 0,
              ml: 'auto',
            }}
          >
            <DeleteRoundedIcon
              onClick={() => handleDeletePart(partId)}
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                color: 'primary.main',
              }}
            />
            <ExpandLessRoundedIcon
              onClick={() => setIsOpen(!isOpen)}
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.4rem', md: '1.6rem' },
                color: 'primary.main',
                transition: 'transform 0.3s ease',
                transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            />
          </Box>
        </Box>
      </Box>
      {/* ------------- Config Section ------------- */}
      {isOpen && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: '100%',
            alignSelf: 'stretch',
            mt: 0,
          }}
        >
          {/* -------------- Left Column: Score & Passage -------------- */}
          <Box sx={{ ...uploadReadingStyles.partEditorColumn, width: '100%', minWidth: 0, mb: 0 }}>
            {/* -------------- Total Each Score -------------- */}
            <FormControl fullWidth sx={{ ...uploadReadingStyles.formControl, mb: 3 }}>
              <FormLabel sx={uploadReadingStyles.labelInput}>
                The score for each question
                <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                  *
                </Box>
              </FormLabel>
              <OutlinedInput
                placeholder="Enter the score for each question here"
                defaultValue={part.scoreForEachQuestion}
                error={!!errors.score}
                sx={{
                  ...uploadReadingStyles.input,
                  '& .MuiOutlinedInput-input': {
                    py: 1,
                    px: 1.5,
                  },
                }}
                onBlur={(e) => handleUpdateScoreForEachQuestionPart(partId, e.target.value)}
              />
            </FormControl>
            {/* -------------- Description Section -------------- */}
            <FormControl fullWidth sx={uploadReadingStyles.formControl}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormLabel sx={uploadReadingStyles.labelInput}>
                  Passage
                  <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                    *
                  </Box>
                </FormLabel>
              </Box>
              <ClientSideCustomEditor
                data={part.content || ''}
                onChange={(content) => handleUpdateContentPart(part.id, content)}
                onError={(msg) => handleEditorError(part.id, msg)}
                startingBlankId={1}
              />
            </FormControl>
          </Box>

          {/* -------------- Right Column: Questions & Answers -------------- */}
          <Box
            sx={{
              ...uploadReadingStyles.partEditorColumn,
              width: '100%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              mb: 0,
            }}
          >
            {/* -------------- Questions Section -------------- */}
            <Box sx={{ ...uploadReadingStyles.formControl, width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormLabel sx={uploadReadingStyles.labelInput}>
                  Questions
                  <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                    *
                  </Box>
                </FormLabel>
              </Box>
              {questions.filter((q) => q.action !== 'delete').length === 0 ? (
                <Box sx={multipleChoiceStyles.questionsContainer}>
                  <Typography
                    onClick={handleAddQuestion}
                    sx={{
                      width: '100%',
                      display: 'inline-flex',
                      fontSize: { xs: '0.8rem', md: '1rem' },
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'text.gray',
                      cursor: 'pointer',
                      justifyContent: 'center',
                    }}
                  >
                    <AddRoundedIcon sx={{ fontSize: { xs: '1rem', md: '1.4rem' } }} />
                    Add your first question
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={multipleChoiceStyles.listOptionContainer}>
                    {questions
                      .filter((question) => question.action !== 'delete')
                      .sort((a, b) => (a.question_number || 0) - (b.question_number || 0))
                      .map((question, qIndex) => (
                        <Box key={question.id} sx={multipleChoiceStyles.questionsContainer}>
                          <Box sx={multipleChoiceStyles.labelQuestionsContainer}>
                            <Box sx={multipleChoiceStyles.questionLabel}>{qIndex + 1}</Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 1 }}>
                              <OutlinedInput
                                size="small"
                                multiline
                                placeholder="Enter question here"
                                defaultValue={question.content || question.text || ''}
                                onBlur={(e) =>
                                  handleUpdateQuestionContent(question.id, e.target.value)
                                }
                                sx={uploadReadingStyles.inputMultiline}
                              />
                              <OutlinedInput
                                size="small"
                                multiline
                                placeholder="Enter explanation here"
                                defaultValue={question.explanation}
                                onBlur={(e) => handleUpdateExplanation(question.id, e.target.value)}
                                sx={uploadReadingStyles.inputMultiline}
                              />
                            </Box>
                            <FormControl
                              size="small"
                              sx={{
                                ...uploadReadingStyles.formControl,
                                width: { xs: '150px', md: '180px' },
                              }}
                            >
                              <Select
                                size="small"
                                value={
                                  question.answers &&
                                  question.answers[0] &&
                                  question.answers[0].option_label !== undefined &&
                                  question.answers[0].option_label !== ''
                                    ? question.answers[0].option_label
                                    : ''
                                }
                                onChange={(e) =>
                                  handleUpdateCorrectAnswer(question.id, e.target.value)
                                }
                                displayEmpty
                                sx={matchingStyles.selectAnswer}
                              >
                                <MenuItem value="" disabled>
                                  <em>Select</em>
                                </MenuItem>
                                {/* Hiện đầy đủ danh sách, không cần vô hiệu hóa */}
                                {answers.map((answer) => (
                                  <MenuItem key={answer.option_label} value={answer.option_label}>
                                    {answer.option_label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <DeleteRoundedIcon
                              onClick={() => handleDeleteQuestion(partId, question.id)}
                              sx={multipleChoiceStyles.trashIconQuestion}
                            />
                          </Box>
                        </Box>
                      ))}
                  </Box>
                  <Box onClick={handleAddQuestion} sx={multipleChoiceStyles.addQuestionBox}>
                    <AddRoundedIcon sx={{ fontSize: '1.2rem' }} />
                    Add question
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
