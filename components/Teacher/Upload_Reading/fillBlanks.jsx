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

export default function FillBlankForm({
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
}) {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleAddQuestion = () => {
    const currentFormat = part.format;

    const newQuestion = {
      id: Date.now(),
      question_number: 1,
      explanation: '',
    };

    // Logic riêng cho 2 loại H và I
    if (currentFormat === 'H') {
      // Loại H: Cần content và mảng 4 đáp án
      newQuestion.content = '';
      newQuestion.answers = [{ option_label: 'A', is_correct: true, answer_text: '' }];
    } else if (currentFormat === 'I') {
      // Loại I: answers là chuỗi rỗng, KHÔNG có trường content
      newQuestion.answers = '';
    }

    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (questionId, value) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        // Nếu là format H (Multiple Choice), update vào content câu hỏi
        if (part.format === 'H') {
          return { ...q, content: value };
        }
        // Nếu không phải H (tức là I - Text), update vào answers
        else {
          return { ...q, answers: value };
        }
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleUpdateExplanation = (questionId, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, explanation: value } : q,
    );
    setQuestions(updatedQuestions);
  };

  const handleSetCorrectOption = (questionId, optionLabel) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const updatedOptions = q.answers.map((opt) => {
          return {
            ...opt,
            is_correct: opt.option_label === optionLabel,
          };
        });
        return { ...q, answers: updatedOptions };
      }
      return q;
    });

    setQuestions(updatedQuestions);
  };

  const handleUpdateOption = (questionId, optionLabel, newContent) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const updatedOptions = q.answers.map((opt) => {
          if (opt.option_label === optionLabel) {
            return { ...opt, answer_text: newContent };
          }
          return opt;
        });
        return { ...q, answers: updatedOptions };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionId) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        // Tự động gán nhãn A, B, C, D dựa trên số lượng option hiện có
        const label = String.fromCharCode(65 + q.answers.length);
        return {
          ...q,
          answers: [...q.answers, { option_label: label, is_correct: false, answer_text: '' }],
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
              Fill in the blanks - {questions.length} questions
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
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', height: '100%' }}>
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
                  <Typography sx={{ fontSize: '0.9rem', ml: 1 }}>Multiple Choice</Typography>
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
                  <Typography sx={{ fontSize: '0.9rem', ml: 1 }}>Text</Typography>
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
              </Typography>{' '}
            </Box>
            <OutlinedInput placeholder="" disabled sx={uploadReadingStyles.input} />
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
            {questions.length == 0 ? (
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
                  {questions.map((question, qIndex) => (
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
                            defaultValue={part.format === 'H' ? question.content : question.answers}
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
                            {question.answers.map((option, oIndex) => (
                              <Box
                                key={option.option_label}
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
