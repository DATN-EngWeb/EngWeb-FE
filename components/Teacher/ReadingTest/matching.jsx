import React from 'react';
import { useEffect } from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import AddIcon from '@mui/icons-material/Add';
import { Checkbox } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
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
  handleUpdateScoreForEachQuestionPart,
  handleUpdateContentPart,
  handleEditorError,
}) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [answers, setLocalAnswers] = React.useState(() => {
    if (localAnswers && localAnswers.length > 0) {
      return localAnswers;
    }
    return questions.map((_, i) => ({
      id: i,
      option_label: String.fromCharCode(65 + i),
      answer_text: '',
    }));
  });

  const activeCount = questions.filter((q) => q.action !== 'delete').length;

  useEffect(() => {
    const activeQuestions = questions.filter((q) => q.action !== 'delete');
    const activeLabels = activeQuestions.map((_, i) => String.fromCharCode(65 + i));

    setLocalAnswers((prevAnswers) => {
      return activeLabels.map((label, i) => {
        const existingAnswer = prevAnswers.find((a) => a.option_label === label);
        return {
          id: existingAnswer ? existingAnswer.id : i,
          option_label: label,
          answer_text: existingAnswer ? existingAnswer.answer_text : '',
        };
      });
    });

    let needsFix = false;
    const validatedQuestions = questions.map((q) => {
      if (q.action === 'delete') return q;

      const currentLabel = q.answers?.[0]?.option_label;

      if (currentLabel && !activeLabels.includes(currentLabel)) {
        needsFix = true;
        return {
          ...q,
          answers: [{ ...q.answers[0], option_label: '', answer_text: '' }],
          ...(flag === 'update' && !q.action && { action: 'update' }),
        };
      }
      return q;
    });

    if (needsFix) {
      setQuestions(validatedQuestions);
    }
  }, [activeCount]);

  const handleAddQuestion = () => {
    const activeQs = questions.filter((q) => q.action !== 'delete');

    const newQuestion = {
      id: Date.now(),
      question_number: activeQs.length + 1,
      explanation: '',
      answers: [
        {
          id: 0,
          option_label: '',
          is_correct: true,
          answer_text: '',
          ...(flag === 'update' && { action: 'create' }),
        },
      ],
      ...(flag === 'update' && { action: 'create' }),
    };

    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateCorrectAnswer = (questionId, selectedLabel) => {
    const sourceAnswer = answers.find((ans) => ans.option_label === selectedLabel);
    const textToSave = sourceAnswer ? sourceAnswer.answer_text : '';

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
              answer_text: textToSave,
              ...(flag === 'update' && !targetAns.action && { action: 'update' }),
            },
          ],
        };
      }

      if (q.answers && q.answers[0] && q.answers[0].option_label === selectedLabel) {
        const otherAns = q.answers[0];
        return {
          ...q,
          ...(flag === 'update' && !q.action && { action: 'update' }),
          answers: [
            {
              ...otherAns,
              option_label: '',
              answer_text: '',
              ...(flag === 'update' && !otherAns.action && { action: 'update' }),
            },
          ],
        };
      }

      return q;
    });
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

  const handleUpdateAnswer = (optionLabel, newContent) => {
    const nextLocalAnswers = answers.map((a) =>
      a.option_label === optionLabel ? { ...a, answer_text: newContent } : a,
    );
    setLocalAnswers(nextLocalAnswers);

    const nextQuestions = questions.map((q) => {
      if (q.answers && q.answers.length > 0 && q.answers[0].option_label === optionLabel) {
        const currentAns = q.answers[0];
        return {
          ...q,
          ...(flag === 'update' && !q.action && { action: 'update' }),
          answers: [
            {
              ...currentAns,
              answer_text: newContent,
              ...(flag === 'update' && !currentAns.action && { action: 'update' }),
            },
          ],
        };
      }
      return q;
    });
    setQuestions(nextQuestions);
  };

  return (
    <>
      {/* ------------- Heading ------------- */}
      <Box
        sx={{
          ...multipleChoiceStyles.simpleBoxFlexRow,
          width: '100%',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            ...multipleChoiceStyles.simpleBoxFlexRow,
            gap: 2,
            justifyContent: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: '4px',
              height: { xs: '36px', md: '40px' },
              backgroundColor: 'yellow.main',
              borderRadius: '1rem',
            }}
          ></Box>
          <DragIndicatorIcon
            sx={{
              transform: 'scale(1.8)',
            }}
          />
          <Box sx={multipleChoiceStyles.headingContainer}>
            <Typography sx={multipleChoiceStyles.headingCard}>Part {index + 1}</Typography>
            <Typography sx={multipleChoiceStyles.descriptionCard}>
              Matching - {questions.filter((q) => q.action !== 'delete').length} questions
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            ...multipleChoiceStyles.simpleBoxFlexRow,
            gap: 0,
            justifyContent: 'flex-start',
          }}
        >
          <DeleteOutlineIcon
            onClick={() => handleDeletePart(partId)}
            sx={{
              cursor: 'pointer',
              fontSize: { xs: '1.8rem', md: '2rem' },
              color: 'primary.main',
            }}
          />
          <ExpandLessIcon
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              cursor: 'pointer',
              fontSize: { xs: '2.2rem', md: '2.4rem' },
              color: 'primary.main',
              transition: 'transform 0.3s ease',
              transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          />
        </Box>
      </Box>
      {/* ------------- Config Section ------------- */}
      {isOpen && (
        <>
          {/* -------------- Total Each Score -------------- */}
          <FormControl fullWidth sx={uploadReadingStyles.formControl}>
            <FormLabel sx={uploadReadingStyles.labelInput}>The score for each question</FormLabel>
            <OutlinedInput
              placeholder="Enter the score for each question here"
              defaultValue={part.scoreForEachQuestion}
              sx={uploadReadingStyles.input}
              onBlur={(e) => handleUpdateScoreForEachQuestionPart(partId, e.target.value)}
            />
          </FormControl>
          {/* -------------- Description Section -------------- */}
          <FormControl fullWidth sx={uploadReadingStyles.formControl}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Passage</FormLabel>
              <Typography sx={multipleChoiceStyles.buttonAndIconContainer}>
                <OpenInNewOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                Edit in editor
              </Typography>{' '}
            </Box>
            <ClientSideCustomEditor
              data={part.content || ''}
              onChange={(content) => handleUpdateContentPart(part.id, content)}
              onError={(msg) => handleEditorError(part.id, msg)}
              startingBlankId={1}
            />
          </FormControl>
          {/* -------------- Questions Section -------------- */}
          <Box sx={{ ...uploadReadingStyles.formControl, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Questions</FormLabel>
              <Typography
                onClick={handleAddQuestion}
                sx={multipleChoiceStyles.buttonAndIconContainer}
              >
                <AddIcon sx={{ fontSize: '1.4rem' }} />
                Add question
              </Typography>
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
                  <AddIcon sx={{ fontSize: { xs: '1rem', md: '1.4rem' } }} />
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
                          <OutlinedInput
                            multiline
                            placeholder="Enter explanation here"
                            defaultValue={question.explanation}
                            onBlur={(e) => handleUpdateExplanation(question.id, e.target.value)}
                            sx={uploadReadingStyles.inputMultiline}
                          />
                          <FormControl
                            sx={{
                              ...uploadReadingStyles.formControl,
                              width: { xs: '150px', md: '180px' },
                            }}
                          >
                            <Select
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
                          <DeleteOutlineIcon
                            onClick={() => handleDeleteQuestion(partId, question.id)}
                            sx={multipleChoiceStyles.trashIconQuestion}
                          />
                        </Box>
                      </Box>
                    ))}
                </Box>
              </>
            )}
          </Box>
          {answers.length > 0 && (
            <Box sx={{ ...uploadReadingStyles.formControl, width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormLabel sx={uploadReadingStyles.labelInput}>Answer</FormLabel>
              </Box>
              <Box sx={matchingStyles.linkOptionContainer}>
                {answers.map((answer, _aIndex) => (
                  <Box key={answer.option_label} sx={multipleChoiceStyles.optionContainer}>
                    <Typography sx={multipleChoiceStyles.optionLabel}>
                      {answer.option_label}.
                    </Typography>
                    <OutlinedInput
                      multiline
                      placeholder="Enter an answer here"
                      sx={multipleChoiceStyles.optionInput}
                      defaultValue={answer.answer_text}
                      onBlur={(e) => handleUpdateAnswer(answer.option_label, e.target.value)}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
    </>
  );
}
