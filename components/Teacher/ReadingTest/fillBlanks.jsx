/* global DOMParser */
'use client';

import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  OutlinedInput,
  Checkbox,
  Collapse,
  Button,
  IconButton,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import { uploadReadingStyles } from '../../../styles/Teacher/Reading/UploadReadingStyles';
import {
  multipleChoiceStyles,
  fillBlankStyles,
} from '../../../styles/Teacher/Reading/QuesitonTypeStyles';
import ClientSideCustomEditor from '../../../components/Editor/ClientSideCustomEditor';
import { createDriver } from '../../../utils/createDriver';

export default function FillBlankForm({
  flag,
  part,
  partId,
  index,
  handleDeletePart,
  handleDeleteOption,
  questions,
  setQuestions,
  setFormat,
  handleUpdateScoreForEachQuestionPart,
  handleUpdateContentPart,
  handleEditorError,
  errors,
  setSnackbar,
}) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [collapsedQuestions, setCollapsedQuestions] = React.useState({});

  const handlePartTour = (e) => {
    e.stopPropagation();

    const steps = [
      {
        element: `#tour-part-header-${partId}`,
        popover: {
          title: 'Fill in the Blanks Part',
          description: `This is Part ${index + 1} (Fill in the Blanks). Students will fill in missing words in a reading passage.`,
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: `#tour-score-${partId}`,
        popover: {
          title: 'Points per Question',
          description:
            'Define the default point score awarded for each correct blank filled in this part.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: `#tour-answer-type-${partId}`,
        popover: {
          title: 'Answer Format',
          description:
            'Choose between "Multiple Choice" (students select from options) or "Text" (students type exact text) formats.',
          side: 'right',
          align: 'start',
        },
      },
    ];

    if (document.querySelector(`#tour-passage-${partId}`)) {
      steps.push({
        element: `#tour-passage-${partId}`,
        popover: {
          title: 'Insert Blank Placeholders',
          description:
            'Write your text in the CKEditor. To insert a blank placeholder for students to fill, click the "(1)_" icon in the CKEditor toolbar. Each inserted blank will automatically generate a matching question card below!',
          side: 'top',
          align: 'start',
        },
      });

      const insertBlankSel = `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Insert Blank"]`;
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
    }

    if (document.querySelector(`#tour-questions-${partId}`)) {
      steps.push({
        element: `#tour-questions-${partId}`,
        popover: {
          title: 'Blank Answer Cards',
          description:
            'This is the Answers panel. Each card corresponds to a blank placeholder you inserted into the passage above. Configure the correct answer and distractor options for each blank here.',
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
              'Enter the prompt text or expected correct word/phrase answers for the blanks in the passage.',
            side: 'top',
            align: 'start',
          },
        });
      }

      if (document.querySelector(`#tour-questions-${partId} .tour-add-text-option-btn`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-add-text-option-btn`,
          popover: {
            title: 'Add Alternative Answer',
            description:
              'Add another valid word/phrase that will be accepted as correct for this blank.',
            side: 'top',
            align: 'center',
          },
        });
      }

      if (document.querySelector(`#tour-questions-${partId} .tour-explanation-input`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-explanation-input`,
          popover: {
            title: 'Question Explanation',
            description: 'Provide a helpful explanation or context for this blank answer card.',
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
              'For Multiple Choice blank formats, input the options here. Mark the correct key by checking the radio button to the left.',
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
            description: 'Add extra distractor choices for students to select from.',
            side: 'top',
            align: 'center',
          },
        });
      }
    }

    const driverObj = createDriver({ steps });
    driverObj.drive();
  };

  const toggleQuestionCollapse = (questionId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const countBlanks = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.querySelectorAll('.blank-element').length;
  };

  const syncQuestionsWithBlanks = (newContent) => {
    const blankCount = countBlanks(newContent);
    const activeQuestions = questions.filter((q) => q.action !== 'delete');
    const currentCount = activeQuestions.length;

    if (blankCount === currentCount) return;

    let updatedQuestions = [...questions];

    if (blankCount > currentCount) {
      const numToAdd = blankCount - currentCount;
      for (let i = 0; i < numToAdd; i++) {
        const newQuestion = {
          id: Date.now() + i,
          question_number: currentCount + i + 1,
          explanation: '',
          ...(flag === 'update' && { action: 'create' }),
        };

        if (part.format === 'H') {
          newQuestion.answers = [
            {
              id: Date.now() + i + 100,
              option_label: 'A',
              is_correct: true,
              answer_text: '',
              ...(flag === 'update' && { action: 'create' }),
            },
            {
              id: Date.now() + i + 200,
              option_label: 'B',
              is_correct: false,
              answer_text: '',
              ...(flag === 'update' && { action: 'create' }),
            },
            {
              id: Date.now() + i + 300,
              option_label: 'C',
              is_correct: false,
              answer_text: '',
              ...(flag === 'update' && { action: 'create' }),
            },
          ];
        } else if (part.format === 'I') {
          newQuestion.answers = [
            {
              id: Date.now() + i + 100,
              is_correct: true,
              answer_text: '',
              ...(flag === 'update' && { action: 'create' }),
            },
          ];
        }
        updatedQuestions.push(newQuestion);
      }
    } else {
      let removeCount = currentCount - blankCount;
      for (let i = updatedQuestions.length - 1; i >= 0 && removeCount > 0; i--) {
        if (updatedQuestions[i].action !== 'delete') {
          if (flag === 'update' && updatedQuestions[i].action !== 'create') {
            updatedQuestions[i] = { id: updatedQuestions[i].id, action: 'delete' };
          } else {
            updatedQuestions.splice(i, 1);
          }
          removeCount--;
        }
      }
    }
    setQuestions(updatedQuestions);
  };

  const handleUpdateTextOption = (questionId, optionId, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            ...(flag === 'update' && !q.action && { action: 'update' }),
            answers: q.answers.map((opt) =>
              opt.id === optionId
                ? {
                    ...opt,
                    answer_text: value,
                    ...(flag === 'update' && !opt.action && { action: 'update' }),
                  }
                : opt,
            ),
          };
        }
        return q;
      }),
    );
  };

  const handleAddTextOption = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            ...(flag === 'update' && !q.action && { action: 'update' }),
            answers: [
              ...q.answers,
              {
                id: Date.now(),
                is_correct: true,
                answer_text: '',
                ...(flag === 'update' && { action: 'create' }),
              },
            ],
          };
        }
        return q;
      }),
    );
  };

  const handleRemoveTextOption = (questionId, optionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const activeAnswersCount = (q.answers || []).filter(
            (opt) => opt.action !== 'delete',
          ).length;

          if (activeAnswersCount <= 1) {
            if (setSnackbar) {
              setSnackbar({
                open: true,
                message: 'Each question must keep at least 1 answer option.',
                severity: 'warning',
              });
            }
            return q;
          }

          let updatedAnswers;
          if (flag === 'update') {
            updatedAnswers = q.answers
              .map((opt) => {
                if (opt.id === optionId) {
                  if (opt.action === 'create') return null;
                  return { id: opt.id, action: 'delete' };
                }
                return opt;
              })
              .filter(Boolean);
          } else {
            updatedAnswers = q.answers.filter((opt) => opt.id !== optionId);
          }

          return {
            ...q,
            ...(flag === 'update' && !q.action && { action: 'update' }),
            answers: updatedAnswers,
          };
        }
        return q;
      }),
    );
  };

  const handleUpdateExplanation = (questionId, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId
        ? { ...q, explanation: value, ...(flag === 'update' && !q.action && { action: 'update' }) }
        : q,
    );
    setQuestions(updatedQuestions);
  };

  const handleSetCorrectOption = (questionId, optionLabel) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;

        return {
          ...q,
          ...(flag === 'update' && !q.action && { action: 'update' }),
          answers: q.answers.map((opt) => ({
            ...opt,
            is_correct: opt.option_label === optionLabel,
            ...(flag === 'update' && !opt.action && { action: 'update' }),
          })),
        };
      }),
    );
  };

  const handleUpdateOption = (questionId, optionLabel, newContent) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;

        return {
          ...q,
          ...(flag === 'update' && !q.action && { action: 'update' }),
          answers: q.answers.map((opt) =>
            opt.option_label === optionLabel
              ? {
                  ...opt,
                  answer_text: newContent,
                  ...(flag === 'update' && !opt.action && { action: 'update' }),
                }
              : opt,
          ),
        };
      }),
    );
  };

  const handleAddOption = (questionId) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        // Tự động gán nhãn A, B, C, D dựa trên số lượng option hiện có
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
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  return (
    <>
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
          {/* ------------ Title Section ------------ */}
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
                Fill in the blanks · {questions.filter((q) => q.action !== 'delete').length}{' '}
                questions
              </Typography>
            </Box>
          </Box>
          {/* ------------ Delete and Chev Icons Section ------------ */}
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
          {/* -------------- Left Column: Config & Passage -------------- */}
          <Box sx={{ ...uploadReadingStyles.partEditorColumn, width: '100%', minWidth: 0, mb: 0 }}>
            {/* -------------- Total Each Score and Answer Type -------------- */}
            <Box sx={{ ...fillBlankStyles.scoreAndCheckbox, gridTemplateColumns: '1fr', gap: 2 }}>
              {/* -------------- CỘT TRÁI: Nhập điểm -------------- */}
              <FormControl
                id={`tour-score-${partId}`}
                fullWidth
                sx={uploadReadingStyles.formControl}
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
                  onBlur={(e) => handleUpdateScoreForEachQuestionPart(part.id, e.target.value)}
                />
              </FormControl>
              {/* -------------- Chọn loại format (H hoặc I) -------------- */}
              <FormControl
                id={`tour-answer-type-${partId}`}
                fullWidth
                sx={uploadReadingStyles.formControl}
              >
                <FormLabel sx={uploadReadingStyles.labelInput}>
                  Answer Type
                  <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                    *
                  </Box>
                </FormLabel>
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 0, md: 2 },
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  {/* Lựa chọn 1: Multiple Choice (Format H) */}
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setFormat('H')}
                  >
                    <Checkbox
                      checked={part.format === 'H'}
                      onChange={() => setFormat('H')}
                      icon={<RadioButtonUncheckedIcon sx={multipleChoiceStyles.uncheckIcon} />}
                      checkedIcon={
                        <Box sx={multipleChoiceStyles.checkedIconWrapper}>
                          <RadioButtonUncheckedIcon sx={multipleChoiceStyles.outerCircle} />
                          <CircleIcon sx={multipleChoiceStyles.innerCircle} />
                        </Box>
                      }
                      sx={multipleChoiceStyles.checkboxRoot}
                    />
                    <Typography sx={{ fontSize: { xs: '0.7rem', md: '0.9rem' }, ml: 1 }}>
                      Multiple Choice
                    </Typography>
                  </Box>
                  {/* Lựa chọn 2: Text (Format I) */}
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setFormat('I')}
                  >
                    <Checkbox
                      checked={part.format === 'I'}
                      onChange={() => setFormat('I')}
                      icon={<RadioButtonUncheckedIcon sx={multipleChoiceStyles.uncheckIcon} />}
                      checkedIcon={
                        <Box sx={multipleChoiceStyles.checkedIconWrapper}>
                          <RadioButtonUncheckedIcon sx={multipleChoiceStyles.outerCircle} />
                          <CircleIcon sx={multipleChoiceStyles.innerCircle} />
                        </Box>
                      }
                      sx={multipleChoiceStyles.checkboxRoot}
                    />
                    <Typography sx={{ fontSize: { xs: '0.7rem', md: '0.9rem' }, ml: 1 }}>
                      Text
                    </Typography>
                  </Box>
                </Box>
              </FormControl>
            </Box>
            {/* -------------- Passage Section -------------- */}
            <FormControl
              id={`tour-passage-${partId}`}
              fullWidth
              sx={{ ...uploadReadingStyles.formControl, mt: 3 }}
            >
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
                onChange={(content) => {
                  handleUpdateContentPart(part.id, content);
                  syncQuestionsWithBlanks(content);
                }}
                onError={(msg) => handleEditorError(part.id, msg)}
                startingBlankId={1}
              />
            </FormControl>
          </Box>

          {/* -------------- Right Column: Questions -------------- */}
          <Box sx={{ ...uploadReadingStyles.partEditorColumn, width: '100%', minWidth: 0, mb: 0 }}>
            <Box
              id={`tour-questions-${partId}`}
              sx={{ ...uploadReadingStyles.formControl, width: '100%' }}
            >
              {/* --------- Heading of Question Section --------- */}
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormLabel sx={uploadReadingStyles.labelInput}>
                  Questions
                  <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                    *
                  </Box>
                </FormLabel>
              </Box>
              {/* ----------- Questions Section --------- */}
              {questions.filter((q) => q.action !== 'delete').length === 0 ? (
                <Box sx={multipleChoiceStyles.questionsContainer}>
                  <Typography
                    sx={{
                      width: '100%',
                      textAlign: 'center',
                      color: 'text.gray',
                      fontSize: '0.9rem',
                    }}
                  >
                    No blanks inserted yet. Use the editor toolbar to insert blanks.
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
                          key={`${part.format}-${question.id}`}
                          sx={{
                            ...multipleChoiceStyles.questionsContainer,
                            ...(collapsedQuestions[question.id] && { gap: 0 }),
                          }}
                        >
                          <Box sx={multipleChoiceStyles.labelQuestionsContainer}>
                            <Box sx={multipleChoiceStyles.questionLabel}>{qIndex + 1}</Box>
                            <Box
                              sx={{
                                flexGrow: 1,
                                alignSelf: 'stretch',
                                ...(collapsedQuestions[question.id] && { cursor: 'pointer' }),
                                backgroundColor: 'transparent',
                              }}
                              onClick={() =>
                                collapsedQuestions[question.id] &&
                                toggleQuestionCollapse(question.id)
                              }
                            />
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
                              {/* ------------- Question and Explanation Section ------------- */}
                              <Box
                                sx={{
                                  ...uploadReadingStyles.formControl,
                                  width: '100%',
                                  mt: 0,
                                  gap: 1,
                                }}
                              >
                                {part.format !== 'H' && (
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
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        mb: 0.5,
                                        color: 'text.secondary',
                                      }}
                                    >
                                      Correct Answer(s)
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      {question.answers
                                        .filter((opt) => opt.action !== 'delete')
                                        .map((opt, vIdx, arr) => (
                                          <Box
                                            key={`${question.id}-${opt.id}`}
                                            sx={{
                                              display: 'flex',
                                              gap: 1,
                                              alignItems: 'flex-start',
                                            }}
                                          >
                                            <OutlinedInput
                                              size="small"
                                              fullWidth
                                              className="tour-question-input"
                                              multiline
                                              placeholder={`Option ${vIdx + 1}`}
                                              defaultValue={opt.answer_text}
                                              sx={uploadReadingStyles.inputMultiline}
                                              onBlur={(e) =>
                                                handleUpdateTextOption(
                                                  question.id,
                                                  opt.id,
                                                  e.target.value,
                                                )
                                              }
                                            />
                                            {arr.length > 1 && (
                                              <IconButton
                                                size="small"
                                                onClick={() =>
                                                  handleRemoveTextOption(question.id, opt.id)
                                                }
                                                sx={{ mt: 0.5 }}
                                              >
                                                <DeleteRoundedIcon sx={{ fontSize: '1.2rem' }} />
                                              </IconButton>
                                            )}
                                          </Box>
                                        ))}
                                    </Box>
                                    <Button
                                      className="tour-add-text-option-btn"
                                      size="small"
                                      startIcon={<AddRoundedIcon sx={{ fontSize: '1.4rem' }} />}
                                      onClick={() => handleAddTextOption(question.id)}
                                      sx={{
                                        mt: 1,
                                        textTransform: 'none',
                                        color: 'primary.main',
                                        alignSelf: 'flex-start',
                                      }}
                                    >
                                      Add option
                                    </Button>
                                  </Box>
                                )}
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
                              {part.format === 'H' && (
                                <Box
                                  sx={{
                                    width: '100%',
                                    pl: 0,
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
                                    {question.answers &&
                                      question.answers
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
                                                handleSetCorrectOption(
                                                  question.id,
                                                  option.option_label,
                                                )
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
                                                  <CircleIcon
                                                    sx={multipleChoiceStyles.innerCircle}
                                                  />
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
                              )}
                            </Box>
                          </Collapse>
                        </Box>
                      ))}
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
