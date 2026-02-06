import React from 'react';
import { Box, Typography, FormControl, FormLabel, OutlinedInput, Checkbox } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import AddIcon from '@mui/icons-material/Add';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import { uploadReadingStyles } from '../../../styles/Teacher/Reading/UploadReadingStyles';
import {
  multipleChoiceStyles,
  fillBlankStyles,
} from '../../../styles/Teacher/Reading/QuesitonTypeStyles';
import ClientSideCustomEditor from '../../../components/Editor/ClientSideCustomEditor';

export default function FillBlankForm({
  flag,
  part,
  partId,
  index,
  handleDeletePart,
  handleDeleteQuestion,
  handleDeleteOption,
  questions,
  setQuestions,
  setFormat,
  handleUpdateScoreForEachQuestionPart,
  handleUpdateContentPart,
  handleEditorError,
}) {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleAddQuestion = () => {
    const currentFormat = part.format;
    const activeQuestions = questions.filter((q) => q.action !== 'delete');

    const newQuestion = {
      id: Date.now(),
      question_number: activeQuestions.length + 1,
      explanation: '',
      ...(flag === 'update' && { action: 'create' }),
    };

    // Loại H: Cần content và answers với option_label
    // Loại I: Chỉ cần answers và không có option_label
    if (currentFormat === 'H') {
      newQuestion.content = '';
      newQuestion.answers = [
        {
          id: 0,
          option_label: 'A',
          is_correct: true,
          answer_text: '',
          ...(flag === 'update' && { action: 'create' }),
        },
      ];
    } else if (currentFormat === 'I') {
      newQuestion.answers = [
        {
          id: 0,
          is_correct: true,
          answer_text: '',
          ...(flag === 'update' && { action: 'create' }),
        },
      ];
    }
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (questionId, value) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        // Nếu là format H (Multiple Choice), update vào content câu hỏi
        if (part.format === 'H') {
          return {
            ...q,
            content: value,
            ...(flag === 'update' && !q.action && { action: 'update' }),
          };
        }
        // Nếu không phải H (tức là I - Text), update vào answers
        else {
          return {
            ...q,
            ...(flag === 'update' && !q.action && { action: 'update' }),
            answers: [
              {
                ...q.answers[0],
                answer_text: value,
                ...(flag === 'update' && !q.answers[0].action && { action: 'update' }),
              },
            ],
          };
        }
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
      <Box
        sx={{
          ...multipleChoiceStyles.simpleBoxFlexRow,
          width: '100%',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        {/* ------------ Title Section ------------ */}
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
              Fill in the blanks - {questions.filter((q) => q.action !== 'delete').length} questions
            </Typography>
          </Box>
        </Box>
        {/* ------------ Delete and Chev Icons Section ------------ */}
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
          {/* -------------- Total Each Score and Answer Type -------------- */}
          <Box sx={fillBlankStyles.scoreAndCheckbox}>
            {/* -------------- CỘT TRÁI: Nhập điểm -------------- */}
            <FormControl fullWidth sx={uploadReadingStyles.formControl}>
              <FormLabel sx={uploadReadingStyles.labelInput}>The score for each question</FormLabel>
              <OutlinedInput
                placeholder="Enter the score for each question here"
                defaultValue={part.scoreForEachQuestion}
                sx={uploadReadingStyles.input}
                onBlur={(e) => handleUpdateScoreForEachQuestionPart(part.id, e.target.value)}
              />
            </FormControl>
            {/* -------------- Chọn loại format (H hoặc I) -------------- */}
            <FormControl fullWidth sx={uploadReadingStyles.formControl}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Answer Type</FormLabel>
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
          <FormControl fullWidth sx={uploadReadingStyles.formControl}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Passage</FormLabel>
              <Typography sx={multipleChoiceStyles.buttonAndIconContainer}>
                <OpenInNewOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                Edit in editor
              </Typography>
            </Box>
            <ClientSideCustomEditor
              data={part.content || ''}
              onChange={(content) => handleUpdateContentPart(part.id, content)}
              onError={(msg) => handleEditorError(part.id, msg)}
              startingBlankId={1}
            />
          </FormControl>
          <Box sx={{ ...uploadReadingStyles.formControl, width: '100%' }}>
            {/* --------- Heading of Question Section --------- */}
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
            {/* ----------- Questions Section --------- */}
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
                      <Box
                        key={`${part.format}-${question.id}`}
                        sx={multipleChoiceStyles.questionsContainer}
                      >
                        <Box sx={multipleChoiceStyles.labelQuestionsContainer}>
                          <Box sx={multipleChoiceStyles.questionLabel}>{qIndex + 1}</Box>
                          {/* ------------- Question and Explanation Section ------------- */}
                          <Box sx={{ ...uploadReadingStyles.formControl, width: '100%' }}>
                            <OutlinedInput
                              key={`${part.format}-${question.id}`}
                              multiline
                              placeholder={
                                part.format === 'H' ? 'Enter question' : 'Enter correct answer'
                              }
                              defaultValue={
                                part.format === 'H'
                                  ? question.content
                                  : question.answers[0].answer_text
                              }
                              sx={uploadReadingStyles.inputMultiline}
                              onBlur={(e) => handleUpdateQuestion(question.id, e.target.value)}
                            />
                            <OutlinedInput
                              multiline
                              placeholder="Enter explaination here"
                              defaultValue={question.explanation}
                              sx={uploadReadingStyles.inputMultiline}
                              onBlur={(e) => handleUpdateExplanation(question.id, e.target.value)}
                            />
                          </Box>
                          {/* ---------------- Delete Icon ---------------- */}
                          <DeleteOutlineIcon
                            onClick={() => handleDeleteQuestion(partId, question.id)}
                            sx={multipleChoiceStyles.trashIconQuestion}
                          />
                        </Box>
                        {part.format === 'H' && (
                          <Box
                            sx={{
                              width: '100%',
                              pl: 4,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1,
                            }}
                          >
                            <Typography
                              sx={{ color: 'text.gray', fontSize: { xs: '0.7rem', md: '0.9rem' } }}
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
                                      {option.option_label}.
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
                                    <DeleteOutlineIcon
                                      onClick={() =>
                                        handleDeleteOption(partId, question.id, option.option_label)
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
                              <AddIcon sx={{ fontSize: '1.4rem' }} />
                              Add option
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                </Box>
              </>
            )}
          </Box>
        </>
      )}
    </>
  );
}
