/* global IntersectionObserver */
'use client';

import React from 'react';
import { useEffect } from 'react';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { FormControl, FormLabel, OutlinedInput, Select, MenuItem, Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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

  const [openSelectId, setOpenSelectId] = React.useState(null);

  useEffect(() => {
    if (openSelectId === null) return;

    const element = document.getElementById(`select-${openSelectId}`);
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            setOpenSelectId(null);
          }
        });
      },
      { root: null, threshold: 0 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [openSelectId]);

  const handlePartTour = (e) => {
    e.stopPropagation();
    const { driver } = require('driver.js');

    const steps = [
      {
        element: `#tour-part-header-${partId}`,
        popover: {
          title: 'Matching Part',
          description: `This is Part ${index + 1} (Matching). Students will read passages and match them to correct categories, headings, or statements.`,
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: `#tour-score-${partId}`,
        popover: {
          title: 'Points per Match',
          description:
            'Define the default point score awarded for each correct match in this part.',
          side: 'right',
          align: 'start',
        },
      },
    ];

    if (document.querySelector(`#tour-passage-${partId}`)) {
      steps.push({
        element: `#tour-passage-${partId}`,
        popover: {
          title: 'Passage Texts',
          description:
            'Enter the base passage text in this editor. Students will read this to perform matching.',
          side: 'top',
          align: 'start',
        },
      });

      if (document.querySelector(`#tour-passage-${partId} .ck-toolbar`)) {
        const toolbarSelectors = [
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text^="Undo"]`,
            title: 'Undo',
            desc: 'Reverse your last text change or editor action.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text^="Redo"]`,
            title: 'Redo',
            desc: 'Re-apply the change you just reversed with Undo.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Heading"]`,
            title: 'Paragraph Format & Headings',
            desc: 'Switch between Paragraph text, major Heading titles, and subtitles to structure sections.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Text alignment"]`,
            title: 'Text Alignment',
            desc: 'Align text lines to the Left, Center, Right, or Justify the text block.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text^="Bold"]`,
            title: 'Bold Text Style',
            desc: 'Style text in bold to emphasize critical names, vocabulary, or keywords.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text^="Italic"]`,
            title: 'Italic Text Style',
            desc: 'Apply italics to titles, foreign phrases, or book/article citations.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text^="Underline"]`,
            title: 'Underline Text Style',
            desc: 'Add an underline style to highlight core statements or sections.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text^="Strikethrough"]`,
            title: 'Strikethrough Style',
            desc: 'Cross out text lines using strikethrough styling.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text^="Link"]`,
            title: 'Insert Link',
            desc: 'Hyperlink words to external web URLs, reference materials, or online definitions.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Block quote"]`,
            title: 'Block Quote',
            desc: 'Indicate longer, indented direct quotations or citation segments from external reading sources.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar .ck-splitbutton__action[data-cke-tooltip-text="Bulleted List"], #tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Bulleted List"]`,
            title: 'Bulleted List',
            desc: 'Format text points into a bulleted list for clean reading outlines.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar .ck-splitbutton__action[data-cke-tooltip-text="Numbered List"], #tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Numbered List"]`,
            title: 'Numbered List',
            desc: 'Format text points into an ordered, numbered list.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Decrease indent"]`,
            title: 'Decrease Indent',
            desc: 'Shift paragraph margins leftwards back to the primary boundary.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Increase indent"]`,
            title: 'Increase Indent',
            desc: 'Shift paragraph margins rightwards to format nested blocks or lists.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Upload image from computer"]`,
            title: 'Upload Image from Computer',
            desc: 'Enrich your passage by uploading custom charts, pictures, map guides, or diagrams.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Insert table"]`,
            title: 'Insert Table',
            desc: 'Insert standard tables to organize information or comparison data grids.',
          },
          {
            sel: `#tour-passage-${partId} .ck-toolbar [data-cke-tooltip-text="Horizontal line"]`,
            title: 'Horizontal Line Divider',
            desc: 'Insert a straight divider line to visually separate different sections or paragraphs.',
          },
        ];

        toolbarSelectors.forEach((item) => {
          if (document.querySelector(item.sel)) {
            steps.push({
              element: item.sel,
              popover: {
                title: item.title,
                description: item.desc,
                side: 'bottom',
                align: 'start',
              },
            });
          }
        });
      }
    }

    if (document.querySelector(`#tour-questions-${partId}`)) {
      steps.push({
        element: `#tour-questions-${partId}`,
        popover: {
          title: 'Matching Questions Section',
          description:
            'This panel lists all matching question items. Each question is paired with a dropdown to select its correct matching answer from the answer pool on the right.',
          side: 'top',
          align: 'start',
        },
      });

      if (document.querySelector(`#tour-questions-${partId} .tour-question-input`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-question-input`,
          popover: {
            title: 'Question / Statement',
            description:
              'Enter the question prompt or statement that students must match to the correct answer option. Example: "The capital city of France".',
            side: 'top',
            align: 'start',
          },
        });
      }
      if (document.querySelector(`#tour-questions-${partId} .tour-explanation-input`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-explanation-input`,
          popover: {
            title: 'Explanation',
            description:
              'Provide an optional explanation for why this question maps to its correct answer. Students will see this during result review.',
            side: 'top',
            align: 'start',
          },
        });
      }
      if (document.querySelector(`#tour-questions-${partId} .tour-answer-select`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-answer-select`,
          popover: {
            title: 'Correct Answer Dropdown',
            description:
              'Select the correct matching label (A, B, C...) from this dropdown. The labels correspond to the answer choices defined in the Answer Options panel.',
            side: 'left',
            align: 'start',
          },
        });
      }
      if (document.querySelector(`#tour-questions-${partId} .tour-add-question-btn`)) {
        steps.push({
          element: `#tour-questions-${partId} .tour-add-question-btn`,
          popover: {
            title: 'Add New Question',
            description:
              'Click "+ Add question" to append a new matching question item to this part.',
            side: 'top',
            align: 'center',
          },
        });
      }
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
              sx={{ ...uploadReadingStyles.formControl, mb: 3 }}
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
            <FormControl
              id={`tour-passage-${partId}`}
              fullWidth
              sx={uploadReadingStyles.formControl}
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
                        <Box key={question.id} sx={multipleChoiceStyles.questionsContainer}>
                          <Box sx={multipleChoiceStyles.labelQuestionsContainer}>
                            <Box sx={multipleChoiceStyles.questionLabel}>{qIndex + 1}</Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 1 }}>
                              <OutlinedInput
                                size="small"
                                multiline
                                className="tour-question-input"
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
                                className="tour-explanation-input"
                                placeholder="Enter explanation here"
                                defaultValue={question.explanation}
                                onBlur={(e) => handleUpdateExplanation(question.id, e.target.value)}
                                sx={uploadReadingStyles.inputMultiline}
                              />
                            </Box>
                            <FormControl
                              id={`select-${question.id}`}
                              size="small"
                              className="tour-answer-select"
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
                                open={openSelectId === question.id}
                                onOpen={() => setOpenSelectId(question.id)}
                                onClose={() => setOpenSelectId(null)}
                                displayEmpty
                                sx={matchingStyles.selectAnswer}
                                MenuProps={{ disableScrollLock: true }}
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
                  <Box
                    onClick={handleAddQuestion}
                    className="tour-add-question-btn"
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
