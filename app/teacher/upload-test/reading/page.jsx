/* eslint-env browser */
/* eslint-disable no-console */
/* global fetch */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  FormControl,
  OutlinedInput,
  FormLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlined from '@mui/icons-material/EditNoteOutlined';
import BorderColorOutlined from '@mui/icons-material/BorderColorOutlined';
import Link from '@mui/icons-material/Link';
import { uploadReadingStyles } from '../../../../styles/Teacher/Reading/UploadReadingStyles';
import MultipleChoiceForm from '../../../../components/Teacher/ReadingTest/multipleChoice';
import MatchingForm from '../../../../components/Teacher/ReadingTest/matching';
import FillBlankForm from '../../../../components/Teacher/ReadingTest/fillBlanks';
import ReadingPreview from '../../../../components/Teacher/ReadingTest/ReadingPreview';
import ScrollToTopButton from '../../../../components/CreateTest/ScrollToTopButton';
import TestEditorHeader from '../../../../components/UploadTest/TestEditorHeader';
import TestEditorActions from '../../../../components/UploadTest/TestEditorActions';
import { createNewTest, uploadReadingTestContent } from '../../../../api/teacher/upload-reading';
import {
  collectFilesReading,
  transformReadingPartsWithUrls,
  transformFormatData,
} from '../../../../utils/testTransformers';
import { getPresignedUrl, uploadToObjectStorage, confirmUpload } from '../../../../api/test';

export default function Page() {
  const router = useRouter();
  const [test, setTest] = useState({
    title: '',
    type: 'R',
    level: '',
    skill: 'R',
    time: 60,
    description: '',
    status: 'P',
  });
  const [parts, setParts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const lastPartRef = useRef(null);
  const prevPartsLengthRef = useRef(parts.length);

  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // Scroll đến Part mới tạo
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

  // Hàm xử lý tải lên Test và trả về testId mới tạo
  const handleUploadTest = async (status) => {
    if (!test.title || !test.description) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields!',
        severity: 'error',
      });
      return null;
    }
    if (!['A1', 'A2', 'B1', 'B2'].includes(test.level)) {
      setSnackbar({
        open: true,
        message: 'Please select a valid level (A1-B2)!',
        severity: 'error',
      });
      return null;
    }
    const payload = {
      title: test.title,
      type: test.type,
      level: test.level,
      skill: test.skill,
      time: parseInt(test.time),
      description: test.description,
      status: status,
    };

    try {
      const response = await createNewTest(payload);

      if (response && response.id) {
        const newTestId = response.id;
        return newTestId;
      } else {
        return null;
      }
    } catch (error) {
      // Xử lý lỗi dựa trên mã lỗi trong tài liệu
      if (error.status) {
        const status = error.status;

        if (status === 400) {
          setSnackbar({
            open: true,
            message: 'All fields are required.',
            severity: 'error',
          });
        } else if (status === 401) {
          setSnackbar({
            open: true,
            message: 'Authentication required. Please log in again.',
            severity: 'error',
          });
        } else if (status === 403) {
          setSnackbar({
            open: true,
            message: 'You do not have permission to perform this action.',
            severity: 'error',
          });
        }
      }
      return null;
    }
  };

  // Hàm xử lý tải lên các Part của bài thi
  const handleUploadParts = async (status) => {
    setIsLoading(true);
    try {
      const newTestId = await handleUploadTest(status);
      if (!newTestId) {
        setIsLoading(false);
        return;
      }

      const transformedParts = transformFormatData(parts);

      const files = collectFilesReading(transformedParts);
      const filenameToUrl = {};
      for (const f of files) {
        const currentMimeType = f.mimeType ?? f.file?.type ?? 'text/html';
        const currentSize = f.fileSize ?? f.file?.size;

        const presign = await getPresignedUrl({
          filename: f.filename,
          fileSize: currentSize,
          mimeType: currentMimeType,
          category: 'tests',
          testId: newTestId,
          part: f.partOrder,
        });

        const uploadResult = await uploadToObjectStorage({
          url: presign.url,
          mimeType: currentMimeType,
          file: f.file,
        });

        const storageKey =
          presign.key ||
          (presign.fields
            ? typeof presign.fields === 'string'
              ? JSON.parse(presign.fields).key
              : presign.fields.key
            : null);

        const confirm = await confirmUpload({
          key: storageKey,
          fileSize: currentSize,
          mimeType: currentMimeType,
          etag: uploadResult.etag,
        });

        filenameToUrl[f.filename] = confirm.file_url || presign.url;
      }

      const preparedParts = transformReadingPartsWithUrls(transformedParts, filenameToUrl);

      // console.log('Prepared Parts for Upload:', preparedParts);

      await uploadReadingTestContent(newTestId, preparedParts);
      setSnackbar({ open: true, message: 'Upload test successfully!', severity: 'success' });
      setTimeout(() => {
        router.push('/teacher');
      }, 1000);
    } catch (error) {
      if (error.status === 400) {
        setSnackbar({
          open: true,
          message: 'Invalid data format. Please check your input.',
          severity: 'error',
        });
      } else if (error.status === 404) {
        setSnackbar({
          open: true,
          message: 'Test not found.',
          severity: 'error',
        });
      }
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

  // Dành cho format H và I
  const handleUpdateFormat = (partId, newFormat) => {
    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id === partId) {
          // 1. Tạo câu hỏi mặc định tùy theo Format
          const newQuestion = {
            id: 0,
            question_number: 1,
            explanation: '',
            score: p.scoreForEachQuestion || 10, // Lấy score mặc định của Part
          };

          if (newFormat === 'H') {
            // Loại H: Cần content và mảng answers có 1 lựa chọn mặc định
            newQuestion.content = '';
            newQuestion.answers = [{ id: 0, option_label: 'A', is_correct: true, answer_text: '' }];
          } else if (newFormat === 'I') {
            // Loại I: answers vẫn là mảng nhưng chứa 1 phần tử
            newQuestion.answers = [{ id: 0, is_correct: true, answer_text: '' }];
            // Lưu ý: Loại I không có trường content trong Question theo logic của bạn
          }

          return {
            ...p,
            format: newFormat,
            questions: [newQuestion],
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
      prevParts.map((p) => {
        if (p.id !== partId) return p;

        const filteredQuestions = p.questions.filter((q) => q.id !== questionId);

        let currentNumber = 1;
        const renumberedQuestions = filteredQuestions.map((q) => {
          if (q.question_number === currentNumber) {
            currentNumber++;
            return q;
          }
          return {
            ...q,
            question_number: currentNumber++,
          };
        });

        return {
          ...p,
          questions: renumberedQuestions,
        };
      }),
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <ScrollToTopButton />
      <Container maxWidth="lg">
        <TestEditorHeader
          title="Create New Reading Test"
          description="Fill in the details below to create a new reading test for your students"
        />
        <TestEditorActions
          onPreview={() => setShowPreview((prev) => !prev)}
          isPreviewActive={showPreview}
          onSendReview={() => handleUploadParts('I')}
          onSaveDraft={() => handleUploadParts('D')}
          onPublish={() => handleUploadParts('P')}
          isLoading={isLoading}
        />
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
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: '4px',
                  height: '36px',
                  backgroundColor: 'yellow.main',
                  borderRadius: '1rem',
                }}
              ></Box>
              <Typography sx={uploadReadingStyles.basicInfoHeading}>Basic infomation</Typography>
            </Stack>
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
                  <Stack direction="row" spacing={2} alignItems="center">
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
                  </Stack>
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
      <ReadingPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        testData={{ ...test, parts }}
      />
    </Box>
  );
}
