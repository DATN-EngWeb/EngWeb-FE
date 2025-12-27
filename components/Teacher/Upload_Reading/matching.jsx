import React from 'react';
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
  questions,
  setQuestions,
  handleUpdateScoreForEachQuestionPart,
}) {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      correctAnswer: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateCorrectAnswer = (currentQIndex, selectedLetter) => {
    if (!selectedLetter) return;
    // 1. Quy đổi chữ cái được chọn thành số index (A=0, B=1, ...)
    const newTargetAnswerIndex = String(selectedLetter).charCodeAt(0) - 65;
    const updatedQuestions = questions.map((q, index) => {
      // 2. Nếu đây là câu hỏi hiện tại đang thao tác
      if (index === currentQIndex) {
        return { ...q, correctAnswer: newTargetAnswerIndex };
      }
      // 3. LOGIC ĐẢO NGƯỢC:
      // Nếu có một câu hỏi khác ĐANG nắm giữ đáp án này (A=0),
      // thì ta gỡ bỏ đáp án của câu đó (đặt về rỗng '')
      if (q.correctAnswer === newTargetAnswerIndex) {
        return { ...q, correctAnswer: '' };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleUpdateQuestion = (questionId, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, text: value } : q,
    );
    setQuestions(updatedQuestions);
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
              <FormLabel sx={uploadReadingStyles.labelInput}>Description</FormLabel>
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
              <FormLabel sx={uploadReadingStyles.labelInput}>Missing Sentence</FormLabel>
              <Typography
                onClick={handleAddQuestion}
                sx={multipleChoiceStyles.buttonAndIconContainer}
              >
                <AddIcon sx={{ fontSize: '1.4rem' }} />
                Add sentence
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
                  Add your first sentence
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={multipleChoiceStyles.listOptionContainer}>
                  {questions.map((question, qIndex) => (
                    <Box key={question.id} sx={multipleChoiceStyles.questionsContainer}>
                      <Box sx={multipleChoiceStyles.labelQuestionsContainer}>
                        <Box sx={multipleChoiceStyles.questionLabel}>
                          {String.fromCharCode(65 + qIndex)}
                        </Box>
                        <OutlinedInput
                          multiline
                          placeholder="Enter sentence here"
                          defaultValue={question.text}
                          onBlur={(e) => handleUpdateQuestion(question.id, e.target.value)}
                          sx={uploadReadingStyles.inputMultiline}
                        />
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
              </Box>
              <Box sx={matchingStyles.linkOptionContainer}>
                {questions.map((question, qIndex) => (
                  <Box
                    key={question.id}
                    sx={{
                      ...multipleChoiceStyles.questionsContainer,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box sx={matchingStyles.questionLabel}>{1 + qIndex}</Box>
                    <FormControl fullWidth sx={uploadReadingStyles.formControl}>
                      <Select
                        value={
                          question.correctAnswer !== undefined && question.correctAnswer !== ''
                            ? String.fromCharCode(65 + question.correctAnswer)
                            : ''
                        }
                        onChange={(e) => handleUpdateCorrectAnswer(qIndex, e.target.value)}
                        displayEmpty
                        sx={matchingStyles.selectAnswer}
                      >
                        <MenuItem value="" disabled>
                          <em>Select</em>
                        </MenuItem>
                        {/* Hiện đầy đủ danh sách, không cần vô hiệu hóa */}
                        {questions.map((_, optIndex) => (
                          <MenuItem key={optIndex} value={String.fromCharCode(65 + optIndex)}>
                            {String.fromCharCode(65 + optIndex)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
