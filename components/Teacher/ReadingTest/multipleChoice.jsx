import React from 'react';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Checkbox } from '@mui/material';
import { Box, Typography, Button } from '@mui/material';
import { FormControl, FormLabel, OutlinedInput, Collapse } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { multipleChoiceStyles } from '../../../styles/Teacher/Reading/QuesitonTypeStyles';
import { uploadReadingStyles } from '../../../styles/Teacher/Reading/UploadReadingStyles';
import ClientSideCustomEditor from '../../../components/Editor/ClientSideCustomEditor';

export default function MultipleChoiceForm({
  flag,
  part,
  partId,
  index,
  handleDeletePart,
  handleDeleteOption,
  handleDeleteQuestion,
  questions,
  setQuestions,
  handleUpdateScoreForEachQuestionPart,
  handleUpdateContentPart,
  handleEditorError,
  errors,
}) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [collapsedQuestions, setCollapsedQuestions] = React.useState({});

  const handlePartTour = (e) => {
    e.stopPropagation();
    const { driver } = require('driver.js');

    const steps = [
      {
        element: `#tour-part-header-${partId}`,
        popover: {
          title: 'Multiple Choice Part',
          description: `This is Part ${index + 1} (${part.format === 'G' ? 'Long Passage' : 'Short Texts'}). Students will read the passage and select the correct option among multiple choices.`,
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: `#tour-score-${partId}`,
        popover: {
          title: 'Points per Question',
          description:
            'Define the default point score awarded for each correct multiple choice question in this part.',
          side: 'right',
          align: 'start',
        },
      },
    ];

    if (part.format === 'G' && document.querySelector(`#tour-passage-${partId}`)) {
      steps.push({
        element: `#tour-passage-${partId}`,
        popover: {
          title: 'Reading Passage Editor',
          description:
            'Use the CKEditor below to write or paste the main reading text. Format typography, embed tables/lists, or upload images directly.',
          side: 'top',
          align: 'start',
        },
      });
    }

    if (document.querySelector(`#tour-questions-${partId}`)) {
      steps.push({
        element: `#tour-questions-${partId}`,
        popover: {
          title: 'Questions Section',
          description:
            'This is the Questions panel. Each card here represents one multiple choice question. You can add, delete, and configure each question including content, explanation, and answer options.',
          side: 'top',
          align: 'start',
        },
      });

      if (document.querySelector(`#tour-questions-${partId} .tour-question-input`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-question-input`,
          popover: {
            title: 'Question Content',
            description:
              'Enter the text of the reading comprehension question here. For format F, you can write rich-text questions and insert blank placeholders using the editor toolbar.',
            side: 'top',
            align: 'start',
          },
        });
      }

      if (document.querySelector(`#tour-questions-${partId} .tour-explanation-input`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-explanation-input`,
          popover: {
            title: 'Question Explanation',
            description:
              'Provide an explanation or translation for the correct answer to help students review their test results.',
            side: 'top',
            align: 'start',
          },
        });
      }
      if (document.querySelector(`#tour-questions-${partId} .tour-option-item`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-option-item`,
          popover: {
            title: 'Answer Options',
            description:
              'Fill in the choice options here. Click the circular radio button to the left of the option to mark it as the correct answer.',
            side: 'top',
            align: 'start',
          },
        });
      }
      if (document.querySelector(`#tour-questions-${partId} .tour-add-option-btn`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-add-option-btn`,
          popover: {
            title: 'Add New Option',
            description:
              'Click this "+ Add option" button to insert an additional answer choice input card for this question.',
            side: 'top',
            align: 'center',
          },
        });
      }
    }

    if (document.querySelector(`#tour-add-btn-${partId}`)) {
      steps.push({
        element: `#tour-add-btn-${partId}`,
        popover: {
          title: 'Add New Question',
          description:
            'Click this button to append a new multiple choice question card to this part.',
          side: 'top',
          align: 'center',
        },
      });
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      doneBtnText: 'Finish',
      closeBtnText: 'Close',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      steps: steps,
    });

    driverObj.drive();
  };

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
        ? {
            ...q,
            content: value,
            ...(flag === 'update' && !q.action && { action: 'update' }),
            ...(flag === 'update' && part.format === 'F' && { ckeditor: true }),
          }
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
      <Box id={`tour-part-header-${partId}`} sx={uploadReadingStyles.partEditorHeader}>
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
                {`${part.format === 'G' ? 'Multiple choice long text' : 'Multiple choice short text'} · ${questions.filter((q) => q.action !== 'delete').length} questions`}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              ...multipleChoiceStyles.simpleBoxFlexRow,
              gap: 0.5,
              flexShrink: 0,
              ml: 'auto',
              alignItems: 'center',
            }}
          >
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
                mr: 2,
                '&:hover': {
                  backgroundColor: '#FFEAD4',
                  borderColor: '#FF9E45',
                },
              }}
            >
              Guide
            </Button>
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
            <FormControl
              id={`tour-score-${partId}`}
              fullWidth
              sx={{ ...uploadReadingStyles.formControl, mb: part.format === 'F' ? 1 : 3 }}
            >
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
            {part.format === 'G' && (
              <FormControl
                id={`tour-passage-${partId}`}
                fullWidth
                sx={uploadReadingStyles.formControl}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                >
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
            )}
          </Box>

          {/* -------------- Right Column: Questions -------------- */}
          <Box sx={{ ...uploadReadingStyles.partEditorColumn, width: '100%', minWidth: 0, mb: 0 }}>
            <Box
              id={`tour-questions-${partId}`}
              sx={{ ...uploadReadingStyles.formControl, width: '100%' }}
            >
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
                        <Box
                          key={question.id}
                          sx={{
                            ...multipleChoiceStyles.questionsContainer,
                            ...(collapsedQuestions[question.id] && { gap: 0 }),
                          }}
                        >
                          <Box sx={multipleChoiceStyles.labelQuestionsContainer}>
                            <Box sx={multipleChoiceStyles.questionLabel}>{qIndex + 1}</Box>
                            {!collapsedQuestions[question.id] && <Box sx={{ flexGrow: 1 }} />}
                            {collapsedQuestions[question.id] && (
                              <Typography
                                noWrap
                                onClick={() => toggleQuestionCollapse(question.id)}
                                sx={uploadReadingStyles.collapsedQuestions}
                              >
                                {question.content ? question.content.replace(/<[^>]+>/g, '') : ''}
                              </Typography>
                            )}
                            {/* ---------------- Question Controls ---------------- */}
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 1,
                                alignItems: 'center',
                                alignSelf: 'center',
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
                                  sx={{
                                    ...uploadReadingStyles.formControl,
                                    position: 'relative',
                                  }}
                                >
                                  <FormControl
                                    fullWidth
                                    className="tour-question-input"
                                    sx={{
                                      ...uploadReadingStyles.formControl,
                                      position: 'relative',
                                      mb: 1,
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
                                    size="small"
                                    multiline
                                    className="tour-explanation-input"
                                    placeholder="Enter explanation here"
                                    defaultValue={question.explanation}
                                    sx={uploadReadingStyles.inputMultiline}
                                    onBlur={(e) =>
                                      handleUpdateExplanation(question.id, e.target.value)
                                    }
                                  />
                                </FormControl>
                              ) : (
                                <Box
                                  sx={{
                                    ...uploadReadingStyles.formControl,
                                    width: '100%',
                                    gap: 1,
                                  }}
                                >
                                  <OutlinedInput
                                    size="small"
                                    multiline
                                    className="tour-question-input"
                                    placeholder="Enter question here"
                                    defaultValue={question.content}
                                    sx={uploadReadingStyles.inputMultiline}
                                    onBlur={(e) =>
                                      handleUpdateQuestion(question.id, e.target.value)
                                    }
                                  />
                                  <OutlinedInput
                                    size="small"
                                    multiline
                                    className="tour-explanation-input"
                                    placeholder="Enter explanation here"
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
                                        className="tour-option-item"
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
                                  className="tour-add-option-btn"
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
                  <Box
                    id={`tour-add-btn-${partId}`}
                    onClick={handleAddQuestion}
                    sx={multipleChoiceStyles.addQuestionBox}
                  >
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
