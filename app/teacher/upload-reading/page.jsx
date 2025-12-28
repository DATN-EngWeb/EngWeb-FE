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
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SendRounded from '@mui/icons-material/SendRounded';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlined from '@mui/icons-material/EditNoteOutlined';
import BorderColorOutlined from '@mui/icons-material/BorderColorOutlined';
import Link from '@mui/icons-material/Link';
import { uploadReadingStyles } from '../../../styles/Teacher/Reading/UploadReadingStyles';
import MultipleChoiceForm from '../../../components/Teacher/Upload_Reading/multipleChoice';
import MatchingForm from '../../../components/Teacher/Upload_Reading/matching';
import FillBlankForm from '../../../components/Teacher/Upload_Reading/fillBlanks';

export default function Page() {
  const [test, setTest] = useState({
    title: '',
    level: '',
    skill: 'R',
    time: 60,
    description: '',
    status: 'P',
  });
  const [parts, setParts] = useState([]);

  const handleAddPart = () => {
    const newPart = {
      id: Date.now(),
      // Những fields sẽ được gửi đi
      order: parts.length + 1,
      format: null,
      description: '',
      scoreForEachQuestion: 10,
      questions: [],
    };
    setParts([...parts, newPart]);
  };

  const updatePartQuestions = (partId, newQuestions) => {
    setParts((prevParts) =>
      prevParts.map((p) => (p.id === partId ? { ...p, questions: newQuestions } : p)),
    );
  };

  // Dành cho format H và I
  const handleUpdateFormat = (partId, newFormat) => {
    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id === partId) {
          const updatedQuestions = p.questions.map((q) => {
            // 1. Tách tất cả các thuộc tính hiện tại của Question
            const { content, answers, ...rest } = q;

            // 2. Nếu ĐÍCH là 'I' (Text):
            // answers sẽ lấy từ content cũ (nếu có) hoặc giữ nguyên nếu answers đang là chuỗi
            if (newFormat === 'I') {
              const finalAnswer = typeof answers === 'string' ? answers : content || '';
              return {
                ...rest, // Giữ id, question_number, explanation...
                answers: finalAnswer,
                // KHÔNG có trường content ở đây
              };
            }

            // 3. Nếu ĐÍCH là 'H' (Multiple Choice):
            // content sẽ lấy từ answers cũ (nếu là chuỗi) hoặc giữ nguyên content cũ
            if (newFormat === 'H') {
              const finalContent = typeof answers === 'string' ? answers : content || '';
              return {
                ...rest,
                content: finalContent,
                answers: [{ option_label: 'A', is_correct: true, answer_text: '' }],
              };
            }

            return q;
          });

          // 4. Cấu trúc lại Part
          const { content: partContent, ...partRest } = p;
          if (newFormat === 'I') {
            return { ...partRest, format: newFormat, questions: updatedQuestions };
          } else {
            return {
              ...partRest,
              format: newFormat,
              questions: updatedQuestions,
              content: partContent || '',
            };
          }
        }
        return p;
      }),
    );
  };

  const handleDeletePart = (idToDelete) => {
    setParts((prevParts) => {
      const filteredParts = prevParts.filter((part) => part.id !== idToDelete);
      return filteredParts.map((part, index) => ({
        ...part,
        order: index + 1,
      }));
    });
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

  const handleDeleteOption = (partId, questionId, optionLabel) => {
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
                      answers: q.answers
                        .filter((a) => a.option_label !== optionLabel)
                        .map((a, index) => ({
                          ...a,
                          option_label: String.fromCharCode(65 + index), // Reset lại nhãn A, B, C theo thứ tự mới
                        })),
                    }
                  : q,
              ),
            }
          : p,
      ),
    );
  };

  const handleSelectType = (partId, format) => {
    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id === partId) {
          const updatedPart = { ...p, format: format };
          // Nếu là loại G hoặc H hoặc I
          if (format === 'G' || format === 'H' || format === 'I') {
            updatedPart.content = '';
          }
          return updatedPart;
        }
        return p;
      }),
    );
  };

  const handleUpdateScoreForEachQuestionPart = (partId, newScoreForEachQuestion) => {
    setParts((prevParts) =>
      prevParts.map((p) =>
        p.id === partId ? { ...p, scoreForEachQuestion: Number(newScoreForEachQuestion) } : p,
      ),
    );
  };

  const handleUpdateDescriptionPart = (partId, newDescription) => {
    setParts((prevParts) =>
      prevParts.map((p) => (p.id === partId ? { ...p, description: newDescription } : p)),
    );
  };

  const renderPartEditor = (part, index) => {
    const partQuestions = part.questions || [];

    // - 'F': Reading - Multiple choice (short text)
    // - 'G': Reading - Multiple choice (long text)
    // - 'H': Reading - Fill in the blank (multiple choice)
    // - 'I': Reading - Fill in the blank (text)
    // - 'J': Reading - Matching

    switch (part.format) {
      case 'G':
      case 'F':
        return (
          <MultipleChoiceForm
            part={part}
            partId={part.id}
            index={index}
            handleUpdateDescriptionPart={handleUpdateDescriptionPart}
            handleDeletePart={handleDeletePart}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            handleDeleteQuestion={handleDeleteQuestion}
            handleDeleteOption={handleDeleteOption}
            handleUpdateScoreForEachQuestionPart={handleUpdateScoreForEachQuestionPart}
          />
        );
      case 'J':
        return (
          <MatchingForm
            part={part}
            partId={part.id}
            index={index}
            handleDeletePart={handleDeletePart}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            handleDeleteQuestion={handleDeleteQuestion}
            handleUpdateScoreForEachQuestionPart={handleUpdateScoreForEachQuestionPart}
          />
        );
      case 'I':
      case 'H':
        return (
          <FillBlankForm
            part={part}
            partId={part.id}
            index={index}
            handleDeletePart={handleDeletePart}
            handleDeleteQuestion={handleDeleteQuestion}
            handleDeleteOption={handleDeleteOption}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            setFormat={(newFormat) => handleUpdateFormat(part.id, newFormat)}
            handleUpdateScoreForEachQuestionPart={handleUpdateScoreForEachQuestionPart}
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
            startIcon={
              <VisibilityOutlined
                sx={{ transform: { xs: 'translateY(0px)', md: 'translateY(3px)' } }}
              />
            }
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
            startIcon={<FileUploadIcon sx={{ fontSize: 20, transform: 'translateY(0px)' }} />}
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
            <Box sx={uploadReadingStyles.nameTestAndTime}>
              <FormControl fullWidth sx={uploadReadingStyles.formControl}>
                <FormLabel sx={uploadReadingStyles.labelInput}>Test title</FormLabel>
                <OutlinedInput
                  placeholder="Enter test title here"
                  defaultValue={test.title}
                  onBlur={(e) => setTest({ ...test, title: e.target.value })}
                  sx={uploadReadingStyles.input}
                />
              </FormControl>
              <FormControl fullWidth sx={uploadReadingStyles.formControl}>
                <FormLabel sx={uploadReadingStyles.labelInput}>Time</FormLabel>
                <OutlinedInput
                  placeholder="Enter time here"
                  defaultValue={test.time}
                  sx={uploadReadingStyles.input}
                  onBlur={(e) => setTest({ ...test, time: Number(e.target.value) })}
                />
              </FormControl>
            </Box>
            <FormControl fullWidth sx={uploadReadingStyles.formControl}>
              <FormLabel sx={uploadReadingStyles.labelInput}>Description</FormLabel>
              <OutlinedInput
                multiline
                placeholder="Enter description here"
                defaultValue={test.description}
                onBlur={(e) => setTest({ ...test, description: e.target.value })}
                sx={uploadReadingStyles.inputMultiline}
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
              {!part.format ? (
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
                      onClick={() => handleSelectType(part.id, 'G')}
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
                      onClick={() => handleSelectType(part.id, 'F')}
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
                      onClick={() => handleSelectType(part.id, 'I')}
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
                      onClick={() => handleSelectType(part.id, 'J')}
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
