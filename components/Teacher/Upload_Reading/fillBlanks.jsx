import React from 'react';
import { Box, Typography, FormControl, FormLabel, OutlinedInput } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import AddIcon from '@mui/icons-material/Add';
import { uploadReadingStyles } from '../../../styles/Teacher/Reading/UploadReadingStyles';
import { multipleChoiceStyles } from '../../../styles/Teacher/Reading/QuesitonTypeStyles';

export default function FillBlankForm({
  part,
  partId,
  index,
  handleDeletePart,
  handleDeleteQuestion,
  questions,
  setQuestions,
}) {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
    };
    setQuestions([...questions, newQuestion]);
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
          {/* -------------- Total Score & Time Section -------------- */}
          <Box sx={multipleChoiceStyles.totalScoreAndTime}>
            <FormControl fullWidth sx={uploadReadingStyles.formControl}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Total score</FormLabel>
              <OutlinedInput placeholder="Enter total score here" sx={uploadReadingStyles.input} />
            </FormControl>
            <FormControl fullWidth sx={uploadReadingStyles.formControl}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Time</FormLabel>
              <OutlinedInput placeholder="Enter time here" sx={uploadReadingStyles.input} />
            </FormControl>
          </Box>
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
                          placeholder="Enter question here"
                          sx={{ ...uploadReadingStyles.input, width: '100%' }}
                        />
                        <DeleteOutlineIcon
                          onClick={() => handleDeleteQuestion(partId, question.id)}
                          sx={multipleChoiceStyles.trashIconQuestion}
                        />
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          pl: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      ></Box>
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
