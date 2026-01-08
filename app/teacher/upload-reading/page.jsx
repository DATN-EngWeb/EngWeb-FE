/* eslint-env browser */
/* eslint-disable no-console */
'use client';

import { useState, useRef, useEffect } from 'react';
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
import { createNewTest, uploadReadingTestContent } from '../../../api/teacher/upload-reading';

export default function Page() {
  const [test, setTest] = useState({
    title: '',
    level: '',
    skill: 'R',
    time: 60,
    description: '',
    status: 'P',
    completed_bonus: 0,
  });
  const [parts, setParts] = useState([]);

  const lastPartRef = useRef(null);
  const prevPartsLengthRef = useRef(parts.length);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (parts.length > prevPartsLengthRef.current) {
      if (lastPartRef.current) {
        lastPartRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
    prevPartsLengthRef.current = parts.length;
  }, [parts.length]);

  const transformFormatData = (data) => {
    // Biến đếm toàn cục, bắt đầu từ 1
    let globalQuestionNumber = 1;

    // Duyệt qua từng Part
    return data.map((part) => {
      // Duyệt qua từng Question trong Part
      const updatedQuestions = part.questions.map((question) => {
        const { id, ...restQuestion } = question;
        return {
          ...restQuestion,
          question_number: globalQuestionNumber++,
          score: part.scoreForEachQuestion,
        };
      });
      const { id, scoreForEachQuestion, ...restPart } = part;
      return {
        ...restPart,
        questions: updatedQuestions,
      };
    });
  };

  // Hàm xử lý tải lên Test và trả về testId mới tạo
  const handleUploadTest = async () => {
    if (!test.title || !test.description) {
      window.alert('Vui lòng điền đầy đủ tiêu đề và mô tả!');
      return null;
    }
    if (!['A1', 'A2', 'B1', 'B2'].includes(test.level)) {
      window.alert('Vui lòng chọn cấp độ hợp lệ (A1-B2)!');
      return null;
    }
    const payload = {
      title: test.title,
      level: test.level,
      skill: test.skill,
      time: parseInt(test.time),
      description: test.description,
      completed_bonus: parseInt(test.completed_bonus) || 0,
    };

    try {
      const token = localStorage.getItem('accessToken');

      const response = await createNewTest(payload, token);

      if (response && response.id) {
        const newTestId = response.id;
        return newTestId;
      } else {
        return null;
      }
    } catch (error) {
      // Xử lý lỗi dựa trên mã lỗi trong tài liệu
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          window.alert('Lỗi dữ liệu: ' + JSON.stringify(data));
        } else if (status === 403) {
          window.alert('Bạn không có quyền giáo viên để tạo bài kiểm tra!');
        } else {
          window.alert('Đã xảy ra lỗi: ' + (data.detail || 'Không xác định'));
        }
      } else {
        console.error('Lỗi kết nối:', error);
      }
      return null;
    }
  };

  // Hàm xử lý tải lên các Part của bài thi
  const handleUploadParts = async () => {
    setIsLoading(true);
    try {
      const newTestId = await handleUploadTest();
      if (!newTestId) {
        setIsLoading(false);
        return;
      }

      // console.log('New Test ID: ', newTestId);

      const transformedParts = transformFormatData(parts);

      // const token = localStorage.getItem('accessToken');
      // const isSuccess = await uploadReadingTestContent(newTestId, transformedParts, token);

      // if (isSuccess) {
      //   window.alert('Toàn bộ bài thi đã được tải lên và xác nhận thành công!');
      // }

      console.log('Upload parts successful: ', transformedParts);
    } catch (error) {
      console.error('Error uploading parts:', error);
      // Hiển thị thông báo lỗi chi tiết từ server nếu có
      const message = error.message || 'Failed to upload parts. Please try again.';
    } finally {
      setIsLoading(false);
    }
  };

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

  const updateAnswerPart = (partId, newAnswers) => {
    setParts((prevParts) =>
      prevParts.map((p) => (p.id === partId ? { ...p, answers: newAnswers } : p)),
    );
  };

  // Dành cho format H và I
  const handleUpdateFormat = (partId, newFormat) => {
    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id === partId) {
          // 1. Tạo câu hỏi mặc định tùy theo Format
          const newQuestion = {
            id: Date.now(),
            question_number: 1,
            explanation: '',
            score: p.scoreForEachQuestion || 10, // Lấy score mặc định của Part
          };

          if (newFormat === 'H') {
            // Loại H: Cần content và mảng answers có 1 lựa chọn mặc định
            newQuestion.content = '';
            newQuestion.answers = [{ option_label: 'A', is_correct: true, answer_text: '' }];
          } else if (newFormat === 'I') {
            // Loại I: answers vẫn là mảng nhưng chứa 1 phần tử
            newQuestion.answers = [{ is_correct: true, answer_text: '' }];
            // Lưu ý: Loại I không có trường content trong Question theo logic của bạn
          }

          // 2. Trả về Part với Format mới nhưng GIỮ LẠI content và description
          return {
            ...p, // Giữ lại id, order, description, content, scoreForEachQuestion...
            format: newFormat, // Cập nhật format mới
            questions: [newQuestion], // Reset mảng questions về 1 câu mới phù hợp format
          };
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
          if (format === 'G' || format === 'H' || format === 'I' || format === 'J') {
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

  const handleUpdateContentPart = (partId, newContent) => {
    setParts((prevParts) =>
      prevParts.map((p) => (p.id === partId ? { ...p, content: newContent } : p)),
    );
  };

  const handleEditorError = (partId, message) => {
    // Cách 1: Log lỗi
    console.error(`Lỗi tại Part ${partId}: ${message}`);
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
            handleUpdateContentPart={handleUpdateContentPart}
            handleEditorError={handleEditorError}
          />
        );
      case 'J':
        return (
          <MatchingForm
            part={part}
            partId={part.id}
            index={index}
            handleDeletePart={handleDeletePart}
            handleDeleteQuestion={handleDeleteQuestion}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            setAnswers={(newAnswers) => updateAnswerPart(part.id, newAnswers)}
            handleUpdateScoreForEachQuestionPart={handleUpdateScoreForEachQuestionPart}
            handleUpdateContentPart={handleUpdateContentPart}
            handleEditorError={handleEditorError}
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
            handleUpdateContentPart={handleUpdateContentPart}
            handleEditorError={handleEditorError}
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
            onClick={handleUploadParts}
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Public'}
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
            <Box
              key={part.id}
              ref={index === parts.length - 1 ? lastPartRef : null}
              sx={uploadReadingStyles.basicInfoContainer}
            >
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
