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

export default function MatchingForm({
  part,
  partId,
  index,
  handleDeletePart,
  handleDeleteQuestion,
  handleDeleteAnswer,
  questions,
  setQuestions,
  setAnswers,
  handleUpdateScoreForEachQuestionPart,
}) {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      // Những fields gửi lên server
      question_number: 1,
      explanation: '',
      answer_label: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleAddAnswer = () => {
    const label = String.fromCharCode(65 + part.answers.length);
    const newAnswer = {
      id: Date.now(),
      // Những fields gửi lên server
      option_label: label,
      answer_text: '',
      is_correct: false,
    };
    setAnswers([...part.answers, newAnswer]);
  };

  const handleUpdateCorrectAnswer = (questionId, selectedLabel) => {
    const updatedQuestions = questions.map((q) => {
      // Nếu đây là câu hỏi đang được thao tác -> gán label mới
      if (q.id === questionId) {
        return { ...q, answer_label: selectedLabel };
      }
      // Nếu câu hỏi KHÁC cũng đang giữ label này -> reset label của nó về rỗng
      if (q.answer_label === selectedLabel) {
        return { ...q, answer_label: '' };
      }
      return q;
    });
    setQuestions(updatedQuestions);

    // Gom tất cả các label đang được sử dụng làm đáp án đúng
    const allCorrectLabels = updatedQuestions
      .map((q) => q.answer_label)
      .filter((label) => label !== ''); // Loại bỏ các label rỗng
    const updatedAnswers = part.answers.map((ans) => ({
      ...ans,
      is_correct: allCorrectLabels.includes(ans.option_label),
    }));
    setAnswers(updatedAnswers);
  };

  const handleUpdateExplanation = (questionId, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, explanation: value } : q,
    );
    setQuestions(updatedQuestions);
  };

  const handleUpdateAnswer = (optionLabel, newContent) => {
    const updatedAnswer = part.answers.map((a) =>
      a.option_label === optionLabel ? { ...a, answer_text: newContent } : a,
    );
    setAnswers(updatedAnswer);
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
              Matching - {questions.length} questions
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
            <OutlinedInput placeholder="" disabled sx={uploadReadingStyles.input} />
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
                              question.answer_label !== undefined && question.answer_label !== ''
                                ? question.answer_label
                                : ''
                            }
                            onChange={(e) => handleUpdateCorrectAnswer(question.id, e.target.value)}
                            displayEmpty
                            sx={matchingStyles.selectAnswer}
                          >
                            <MenuItem value="" disabled>
                              <em>Select</em>
                            </MenuItem>
                            {/* Hiện đầy đủ danh sách, không cần vô hiệu hóa */}
                            {part.answers.map((answer, aIndex) => (
                              <MenuItem key={answer.id} value={String.fromCharCode(65 + aIndex)}>
                                {String.fromCharCode(65 + aIndex)}
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
          {questions.length > 0 && (
            <Box sx={{ ...uploadReadingStyles.formControl, width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <FormLabel sx={uploadReadingStyles.labelInput}>Answer</FormLabel>
                <Typography
                  onClick={handleAddAnswer}
                  sx={multipleChoiceStyles.buttonAndIconContainer}
                >
                  <AddIcon sx={{ fontSize: '1.4rem' }} />
                  Add answer
                </Typography>
              </Box>
              <Box sx={matchingStyles.linkOptionContainer}>
                {part.answers.map((answer, aIndex) => (
                  <Box key={answer.id} sx={multipleChoiceStyles.optionContainer}>
                    <Typography sx={multipleChoiceStyles.optionLabel}>
                      {answer.option_label}.
                    </Typography>
                    <OutlinedInput
                      multiline
                      placeholder="Enter option here"
                      sx={multipleChoiceStyles.optionInput}
                      defaultValue={answer.answer_text}
                      onBlur={(e) => handleUpdateAnswer(answer.option_label, e.target.value)}
                    />
                    {/* ---------------- Delete Icon ---------------- */}
                    <DeleteOutlineIcon
                      onClick={() => handleDeleteAnswer(partId, answer.option_label)}
                      sx={multipleChoiceStyles.trashIcon}
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
