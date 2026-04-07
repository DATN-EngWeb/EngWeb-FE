import React from 'react';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Checkbox } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import { FormControl, FormLabel, OutlinedInput, Collapse } from '@mui/material';
import { multipleChoiceStyles } from '../../../styles/Teacher/Reading/QuesitonTypeStyles';
import { uploadReadingStyles } from '../../../styles/Teacher/Reading/UploadReadingStyles';
import { Box, Typography } from '@mui/material';
import ClientSideCustomEditor from '../../../components/Editor/ClientSideCustomEditor';

export default function MultipleChoiceForm({
  flag,
  part,
  partId,
  index,
  handleDeletePart,
  handleDeleteOption,
  handleDeleteQuestion,
  handleUpdateDescriptionPart,
  questions,
  setQuestions,
  handleUpdateScoreForEachQuestionPart,
  handleUpdateContentPart,
  handleEditorError,
}) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [collapsedQuestions, setCollapsedQuestions] = React.useState({});

  const toggleQuestionCollapse = (questionId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

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
          option_label: 'A',
          is_correct: true,
          answer_text: '',
          ...(flag === 'update' && { action: 'create' }),
        },
        {
          id: 1,
          option_label: 'B',
          is_correct: false,
          answer_text: '',
          ...(flag === 'update' && { action: 'create' }),
        },
        {
          id: 2,
          option_label: 'C',
          is_correct: false,
          answer_text: '',
          ...(flag === 'update' && { action: 'create' }),
        },
      ],
      ...(flag === 'update' && { action: 'create' }),
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (questionId, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? { ...q, content: value, ...(flag === 'update' && !q.action && { action: 'update' }) }
        : q,
    );
    setQuestions(updatedQuestions);
  };

  const handleEditorErrorQuestion = (questionId, msg) => {
    window.alert(`Question ${questionId}: ${msg}`);
  };

  const handleUpdateExplanation = (questionId, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? { ...q, explanation: value, ...(flag === 'update' && !q.action && { action: 'update' }) }
        : q,
    );
    setQuestions(updatedQuestions);
  };

  const handleUpdateOption = (questionId, optionLabel, newContent) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;

        const updatedOptions = q.answers.map((opt) => {
          if (opt.option_label === optionLabel) {
            return {
              ...opt,
              answer_text: newContent,
              ...(flag === 'update' && !opt.action && { action: 'update' }),
            };
          }
          return opt;
        });

        return {
          ...q,
          answers: updatedOptions,
          ...(flag === 'update' && !q.action && { action: 'update' }), // Báo cho cha biết
        };
      }),
    );
  };

  const handleAddOption = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;

        const activeAns = q.answers.filter((a) => a.action !== 'delete');
        const label = String.fromCharCode(65 + activeAns.length);
        return {
          ...q,
          ...(flag === 'update' && !q.action && { action: 'update' }),
          answers: [
            ...q.answers,
            {
              id: Date.now(),
              option_label: label,
              is_correct: false,
              answer_text: '',
              ...(flag === 'update' && { action: 'create' }),
            },
          ],
        };
      }),
    );
  };

  const handleSetCorrectOption = (questionId, optionLabel) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;

        const updatedOptions = q.answers.map((opt) => ({
          ...opt,
          is_correct: opt.option_label === optionLabel,
          ...(flag === 'update' && !opt.action && { action: 'update' }),
        }));

        return {
          ...q,
          answers: updatedOptions,
          ...(flag === 'update' && !q.action && { action: 'update' }),
        };
      }),
    );
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
          <Box sx={multipleChoiceStyles.headingContainer}>
            <Typography sx={multipleChoiceStyles.headingCard}>Part {index + 1}</Typography>
            <Typography sx={multipleChoiceStyles.descriptionCard}>
              {`${part.format === 'G' ? 'Multiple choice long text' : 'Multiple choice short text'} - ${questions.filter((q) => q.action !== 'delete').length} questions`}
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
      {/* ------------- Config Section ------------- */}
      {isOpen && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 4,
            width: '100%',
            mt: 2,
          }}
        >
          {/* -------------- Left Column: Score & Passage -------------- */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* -------------- Total Each Score -------------- */}
            <FormControl fullWidth sx={{ ...uploadReadingStyles.formControl, mb: 3 }}>
              <FormLabel sx={uploadReadingStyles.labelInput}>The score for each question</FormLabel>
              <OutlinedInput
                placeholder="Enter the score for each question here"
                defaultValue={part.scoreForEachQuestion}
                sx={uploadReadingStyles.input}
                onBlur={(e) => handleUpdateScoreForEachQuestionPart(partId, e.target.value)}
              />
            </FormControl>
            {/* -------------- Description Section -------------- */}
            {part.format === 'G' ? (
              <FormControl fullWidth sx={uploadReadingStyles.formControl}>
                <Box
                  sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                >
                  <FormLabel sx={uploadReadingStyles.labelInput}>Passage</FormLabel>
                </Box>
                <ClientSideCustomEditor
                  data={part.content || ''}
                  onChange={(content) => handleUpdateContentPart(part.id, content)}
                  onError={(msg) => handleEditorError(part.id, msg)}
                  startingBlankId={1}
                />
              </FormControl>
            ) : (
              <FormControl fullWidth sx={uploadReadingStyles.formControl}>
                <FormLabel sx={uploadReadingStyles.labelInput}>Description</FormLabel>
                <OutlinedInput
                  multiline
                  placeholder="Enter description here"
                  defaultValue={part.description}
                  sx={uploadReadingStyles.inputMultiline}
                  onBlur={(e) => handleUpdateDescriptionPart(partId, e.target.value)}
                />
              </FormControl>
            )}
          </Box>

          {/* -------------- Right Column: Questions -------------- */}
          <Box sx={{ flex: 1.2, minWidth: 0 }}>
            <Box sx={{ ...uploadReadingStyles.formControl, width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormLabel sx={uploadReadingStyles.labelInput}>Questions</FormLabel>
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
                            <Box sx={{ flexGrow: 1 }} />
                            {/* ---------------- Question Controls ---------------- */}
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 1,
                                alignItems: 'center',
                                mt: 0.2,
                              }}
                            >
                              <DeleteRoundedIcon
                                onClick={() => handleDeleteQuestion(partId, question.id)}
                                sx={multipleChoiceStyles.trashIconQuestion}
                              />
                              <ExpandLessRoundedIcon
                                onClick={() => toggleQuestionCollapse(question.id)}
                                sx={{
                                  cursor: 'pointer',
                                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                                  color: 'text.gray',
                                  transition: 'transform 0.3s ease',
                                  transform: collapsedQuestions[question.id]
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                                }}
                              />
                            </Box>
                          </Box>

                          <Collapse in={!collapsedQuestions[question.id]} sx={{ width: '100%' }}>
                            <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {part.format === 'F' ? (
                                <FormControl
                                  fullWidth
                                  sx={{ ...uploadReadingStyles.formControl, position: 'relative' }}
                                >
                                  <FormControl
                                    fullWidth
                                    sx={{
                                      ...uploadReadingStyles.formControl,
                                      position: 'relative',
                                    }}
                                  >
                                    <ClientSideCustomEditor
                                      data={question.content || ''}
                                      onChange={(content) =>
                                        handleUpdateQuestion(question.id, content)
                                      }
                                      onError={(msg) => handleEditorErrorQuestion(question.id, msg)}
                                      startingBlankId={1}
                                    />
                                  </FormControl>
                                  <OutlinedInput
                                    multiline
                                    placeholder="Enter explaination here"
                                    defaultValue={question.explanation}
                                    sx={uploadReadingStyles.inputMultiline}
                                    onBlur={(e) =>
                                      handleUpdateExplanation(question.id, e.target.value)
                                    }
                                  />
                                </FormControl>
                              ) : (
                                <Box sx={{ ...uploadReadingStyles.formControl, width: '100%' }}>
                                  <OutlinedInput
                                    multiline
                                    placeholder="Enter question here"
                                    defaultValue={question.content}
                                    sx={uploadReadingStyles.inputMultiline}
                                    onBlur={(e) =>
                                      handleUpdateQuestion(question.id, e.target.value)
                                    }
                                  />
                                  <OutlinedInput
                                    multiline
                                    placeholder="Enter explaination here"
                                    defaultValue={question.explanation}
                                    sx={uploadReadingStyles.inputMultiline}
                                    onBlur={(e) =>
                                      handleUpdateExplanation(question.id, e.target.value)
                                    }
                                  />
                                </Box>
                              )}

                              <Box
                                sx={{
                                  width: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: 'text.gray',
                                    fontSize: { xs: '0.7rem', md: '0.9rem' },
                                  }}
                                >
                                  Text answers (Click to set correct answer)
                                </Typography>
                                {/* ---------- Option Section ----------- */}
                                <Box sx={multipleChoiceStyles.listOptionContainer}>
                                  {question.answers
                                    .filter((option) => option.action !== 'delete')
                                    .sort((a, b) => {
                                      const labelA = a.option_label || '';
                                      const labelB = b.option_label || '';
                                      return labelA.localeCompare(labelB);
                                    })
                                    .map((option, oIndex) => (
                                      <Box
                                        key={`${question.id}-${option.id}`}
                                        sx={multipleChoiceStyles.optionContainer}
                                      >
                                        <Checkbox
                                          checked={option.is_correct}
                                          onChange={() =>
                                            handleSetCorrectOption(question.id, option.option_label)
                                          }
                                          icon={
                                            <RadioButtonUncheckedIcon
                                              sx={multipleChoiceStyles.uncheckIcon}
                                            />
                                          }
                                          checkedIcon={
                                            <Box sx={multipleChoiceStyles.checkedIconWrapper}>
                                              <RadioButtonUncheckedIcon
                                                sx={multipleChoiceStyles.outerCircle}
                                              />
                                              <CircleIcon sx={multipleChoiceStyles.innerCircle} />
                                            </Box>
                                          }
                                          sx={multipleChoiceStyles.checkboxRoot}
                                        />
                                        <Typography sx={multipleChoiceStyles.optionLabel}>
                                          {option.option_label}
                                        </Typography>
                                        <OutlinedInput
                                          multiline
                                          placeholder="Enter option here"
                                          sx={multipleChoiceStyles.optionInput}
                                          defaultValue={option.answer_text}
                                          onBlur={(e) =>
                                            handleUpdateOption(
                                              question.id,
                                              option.option_label,
                                              e.target.value,
                                            )
                                          }
                                        />
                                        {/* ---------------- Delete Icon ---------------- */}
                                        <DeleteRoundedIcon
                                          onClick={() =>
                                            handleDeleteOption(
                                              partId,
                                              question.id,
                                              option.option_label,
                                            )
                                          }
                                          sx={multipleChoiceStyles.trashIcon}
                                        />
                                      </Box>
                                    ))}
                                </Box>
                                {/* --------------- Add Option --------------- */}
                                <Typography
                                  onClick={() => handleAddOption(question.id)}
                                  sx={multipleChoiceStyles.buttonAndIconContainer}
                                >
                                  <AddRoundedIcon sx={{ fontSize: '1.4rem' }} />
                                  Add option
                                </Typography>
                              </Box>
                            </Box>
                          </Collapse>
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
