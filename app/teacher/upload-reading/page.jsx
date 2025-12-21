'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormLabel,
  Select,
  MenuItem,
} from '@mui/material';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import SendRounded from '@mui/icons-material/SendRounded';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import ViewListOutlined from '@mui/icons-material/ViewListOutlined';
import EditNoteOutlined from '@mui/icons-material/EditNoteOutlined';
import BorderColorOutlined from '@mui/icons-material/BorderColorOutlined';
import Link from '@mui/icons-material/Link';
import { uploadReadingStyles } from '../../../styles/Teacher/Reading/UploadReadingStyles';
import MultipleChoiceForm from '../../../components/Teacher/Upload_Reading/multipleChoice';
import MatchingForm from '../../../components/Teacher/Upload_Reading/matching';
import FillBlankForm from '../../../components/Teacher/Upload_Reading/fillBlanks';
import Passage from 'next-auth/providers/passage';

export default function Page() {
  const [test, setTest] = useState({
    name: '',
    level: '',
    description: '',
  });
  const [parts, setParts] = useState([]);

  const handleAddPart = () => {
    const newPart = {
      id: Date.now(), // Dùng Date.now() để ID không bao giờ trùng
      title: `Part ${parts.length + 1}`,
      type: null,
      totalScore: null,
      time: null,
      description: '',
      questions: [], // Mỗi part có một mảng câu hỏi riêng ở đây
    };
    setParts([...parts, newPart]);
  };

  const updatePartQuestions = (partId, newQuestions) => {
    setParts((prevParts) =>
      prevParts.map((p) => (p.id === partId ? { ...p, questions: newQuestions } : p)),
    );
  };

  const handleDeletePart = (idToDelete) => {
    setParts(parts.filter((part) => part.id !== idToDelete));
  };

  const handleDeleteQuestion = (partId, questionId) => {
    setParts((prevParts) =>
      prevParts.map((p) =>
        p.id === partId
          ? {
              ...p,
              questions: p.questions.filter((q) => q.id !== questionId),
            }
          : p,
      ),
    );
  };

  const handleDeleteOption = (partId, questionId, optionId) => {
    setParts((prevParts) =>
      prevParts.map((p) =>
        p.id === partId
          ? {
              ...p,
              questions: p.questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      // Lọc bỏ optionId, sau đó cập nhật lại nhãn A, B, C nếu cần
                      options: q.options
                        .filter((a) => a.id !== optionId)
                        .map((a, index) => ({
                          ...a,
                          id: String.fromCharCode(65 + index), // Reset lại nhãn A, B, C theo thứ tự mới
                        })),
                      // Nếu đáp án đúng (true_answer) chính là cái vừa xóa, hãy reset nó
                      true_answer: q.true_answer === optionId ? '' : q.true_answer,
                    }
                  : q,
              ),
            }
          : p,
      ),
    );
  };

  const handleSelectType = (partId, type) => {
    setParts((prevParts) => prevParts.map((p) => (p.id === partId ? { ...p, type: type } : p)));
  };

  const handleUpdateToltalScorePart = (partId, newTotalScore) => {
    setParts((prevParts) =>
      prevParts.map((p) => (p.id === partId ? { ...p, totalScore: Number(newTotalScore) } : p)),
    );
  };

  const handleUpdateTimePart = (partId, newTime) => {
    setParts((prevParts) =>
      prevParts.map((p) => (p.id === partId ? { ...p, time: Number(newTime) } : p)),
    );
  };

  const renderPartEditor = (part, index) => {
    const partQuestions = part.questions || [];

    switch (part.type) {
      case 'multiple-choice-long':
        return (
          <MultipleChoiceForm
            part={part}
            partId={part.id}
            index={index}
            handleDeletePart={handleDeletePart}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            handleDeleteQuestion={handleDeleteQuestion}
            handleDeleteOption={handleDeleteOption}
            handleUpdateTimePart={handleUpdateTimePart}
            handleUpdateToltalScorePart={handleUpdateToltalScorePart}
          />
        );
      case 'multiple-choice-short':
        return (
          <MultipleChoiceForm
            part={part}
            partId={part.id}
            index={index}
            handleDeletePart={handleDeletePart}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            handleDeleteQuestion={handleDeleteQuestion}
            handleDeleteOption={handleDeleteOption}
            handleUpdateTimePart={handleUpdateTimePart}
            handleUpdateToltalScorePart={handleUpdateToltalScorePart}
          />
        );
      case 'matching':
        return (
          <MatchingForm
            part={part}
            partId={part.id}
            index={index}
            handleDeletePart={handleDeletePart}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            handleDeleteQuestion={handleDeleteQuestion}
            handleUpdateTimePart={handleUpdateTimePart}
            handleUpdateToltalScorePart={handleUpdateToltalScorePart}
          />
        );
      case 'fill-blank':
        return (
          <FillBlankForm
            part={part}
            partId={part.id}
            index={index}
            handleDeletePart={handleDeletePart}
            handleDeleteQuestion={handleDeleteQuestion}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            handleUpdateTimePart={handleUpdateTimePart}
            handleUpdateToltalScorePart={handleUpdateToltalScorePart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={uploadReadingStyles.mainContainer}>
      <Container maxWidth="lg">
        {/* -------- Title Section --------- */}
        <Box sx={uploadReadingStyles.cardTitle}>
          <Typography variant="h3" sx={uploadReadingStyles.mainTitleHeading}>
            Create New Reading Test
          </Typography>
          <Typography variant="body1" sx={uploadReadingStyles.description}>
            Fill in detail beloxw to create a new reading test for your students.
          </Typography>
        </Box>
        {/* -------- Function Buttons Section --------- */}
        <Box sx={uploadReadingStyles.functionButtonsWrapper}>
          <Button
            startIcon={<VisibilityOutlined />}
            sx={{ ...uploadReadingStyles.previewButton, gridArea: 'item1' }}
          >
            Show Preview
          </Button>
          <Button
            startIcon={
              <SendRounded sx={{ transform: 'rotate(-45deg) translateY(2px) translateX(7px)' }} />
            }
            sx={{ ...uploadReadingStyles.rightButton, gridArea: 'item2' }}
          >
            Send For Review
          </Button>
          <Button
            startIcon={<DescriptionOutlined sx={{ fontSize: 20, transform: 'translateY(0px)' }} />}
            sx={{ ...uploadReadingStyles.rightButton, gridArea: 'item3' }}
          >
            Save Draft
          </Button>
          <Button
            startIcon={<DescriptionOutlined sx={{ fontSize: 20, transform: 'translateY(0px)' }} />}
            sx={{ ...uploadReadingStyles.publicButton, gridArea: 'item4' }}
            onClick={() => {
              // eslint-disable-next-line no-console
              (console.log('Test: ', test), console.log('Part: ', parts));
            }}
          >
            Public
          </Button>
        </Box>
        {/* -------- Upload Reading Test Form Section --------- */}
        <Box sx={uploadReadingStyles.uploadReadingFormSection}>
          <Typography
            variant="h3"
            sx={{ ...uploadReadingStyles.mainTitleHeading, alignSelf: 'flex-start' }}
          >
            Test Editor
          </Typography>
          {/* -------------------- Basic Information -------------------- */}
          <Box sx={uploadReadingStyles.basicInfoContainer}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: '4px',
                  height: '36px',
                  backgroundColor: 'yellow.main',
                  borderRadius: '1rem',
                }}
              ></Box>
              <Typography sx={uploadReadingStyles.basicInfoHeading}>Basic infomation</Typography>
            </Box>
            <FormControl fullWidth sx={uploadReadingStyles.formControl}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Test name</FormLabel>
              <OutlinedInput
                placeholder="Enter test name here"
                onChange={(e) => {
                  setTest({ ...test, name: e.target.value });
                }}
                sx={uploadReadingStyles.input}
              />
            </FormControl>
            <FormControl fullWidth sx={uploadReadingStyles.formControl}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Description</FormLabel>
              <OutlinedInput
                placeholder="Enter description here"
                onChange={(e) => {
                  setTest({ ...test, description: e.target.value });
                }}
                sx={uploadReadingStyles.input}
              />
            </FormControl>
            <FormControl fullWidth sx={uploadReadingStyles.formControl}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Level</FormLabel>
              <Select
                displayEmpty
                defaultValue=""
                sx={{
                  ...uploadReadingStyles.input,
                  '& .MuiSelect-icon': {
                    color: 'primary.main',
                    fontSize: '1.8rem',
                    right: '12px',
                    transition: 'transform 0.2s',
                  },
                  '& .MuiSelect-iconOpen': {
                    transform: 'rotate(180deg)',
                  },
                }}
                IconComponent={KeyboardArrowDownIcon}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        fontFamily: 'inherit',
                        fontSize: { xs: '0.7rem', md: '0.9rem' },
                      },
                    },
                  },
                }}
                onChange={(e) => {
                  setTest({ ...test, level: e.target.value });
                }}
              >
                <MenuItem value="" disabled>
                  <span>Choose level</span>
                </MenuItem>
                <MenuItem value="A1">A1</MenuItem>
                <MenuItem value="A2">A2</MenuItem>
                <MenuItem value="B1">B1</MenuItem>
                <MenuItem value="B2">B2</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {/* ------------ Parts Section ------------- */}
          {parts.map((part, index) => (
            <Box key={part.id} sx={uploadReadingStyles.basicInfoContainer}>
              {!part.type ? (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: '4px',
                        height: '36px',
                        backgroundColor: 'yellow.main',
                        borderRadius: '1rem',
                      }}
                    ></Box>
                    <Typography sx={uploadReadingStyles.basicInfoHeading}>
                      Select Part Type
                    </Typography>
                  </Box>
                  <Box sx={uploadReadingStyles.partContentContainer}>
                    {/* Multiple Choice Long Text */}
                    <Button
                      sx={uploadReadingStyles.selectedPart}
                      onClick={() => handleSelectType(part.id, 'multiple-choice-long')}
                    >
                      <ArticleOutlined sx={uploadReadingStyles.iconSelectedPart} />
                      <Box sx={uploadReadingStyles.partTextContainer}>
                        <Typography sx={uploadReadingStyles.partTitle}>
                          Multiple Choice Long Text
                        </Typography>
                        <Typography sx={uploadReadingStyles.partDescription}>
                          Students select the correct answer.
                        </Typography>
                      </Box>
                    </Button>
                    {/* Multiple Choice Short Text */}
                    <Button
                      sx={uploadReadingStyles.selectedPart}
                      onClick={() => handleSelectType(part.id, 'multiple-choice-short')}
                    >
                      <EditNoteOutlined sx={uploadReadingStyles.iconSelectedPart} />
                      <Box sx={uploadReadingStyles.partTextContainer}>
                        <Typography sx={uploadReadingStyles.partTitle}>
                          Multiple Choice Short Text
                        </Typography>
                        <Typography sx={uploadReadingStyles.partDescription}>
                          Students select the correct answer.
                        </Typography>
                      </Box>
                    </Button>
                    {/* Fill in The Blanks */}
                    <Button
                      sx={uploadReadingStyles.selectedPart}
                      onClick={() => handleSelectType(part.id, 'fill-blank')}
                    >
                      <BorderColorOutlined sx={uploadReadingStyles.iconSelectedPart} />
                      <Box sx={uploadReadingStyles.partTextContainer}>
                        <Typography sx={uploadReadingStyles.partTitle}>
                          Fill In The Blanks
                        </Typography>
                        <Typography sx={uploadReadingStyles.partDescription}>
                          Students complete the missing words.
                        </Typography>
                      </Box>
                    </Button>
                    {/* Matching */}
                    <Button
                      sx={uploadReadingStyles.selectedPart}
                      onClick={() => handleSelectType(part.id, 'matching')}
                    >
                      <Link sx={uploadReadingStyles.iconSelectedPart} />
                      <Box sx={uploadReadingStyles.partTextContainer}>
                        <Typography sx={uploadReadingStyles.partTitle}>Matching</Typography>
                        <Typography sx={uploadReadingStyles.partDescription}>
                          Students match items together.
                        </Typography>
                      </Box>
                    </Button>
                  </Box>
                  <Button
                    sx={{
                      color: 'text.gray',
                      fontSize: { xs: '0.7rem', md: '0.9rem' },
                      textTransform: 'none',
                      px: 2,
                    }}
                    onClick={() => handleDeletePart(part.id)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                renderPartEditor(part, index)
              )}
            </Box>
          ))}
          {/* -------- Add New Part Button --------- */}
          <Button
            startIcon={<AddIcon />}
            sx={uploadReadingStyles.addPartButton}
            onClick={() => handleAddPart()}
          >
            Add New Part
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
