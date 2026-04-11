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
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import { uploadReadingTestContent } from '../../../../api/teacher/upload-reading';
import { createTest } from '../../../../api/test';
import {
  collectFilesReading,
  transformReadingPartsWithUrls,
  transformFormatData,
} from '../../../../utils/testTransformers';
import { getPresignedUrl, uploadToObjectStorage, confirmUpload } from '../../../../api/test';
import { validateReadingPartPayload } from '../../../../utils/testValidation';

export default function Page() {
  const router = useRouter();
  const [showInlinePreview, setShowInlinePreview] = useState(false);
  const [test, setTest] = useState({
    title: '',
    type: 'R',
    level: '',
    skill: 'R',
    time: 60,
    description: '',
    status: 'D',
  });
  const [parts, setParts] = useState([
    {
      id: Date.now(),
      order: 1,
      format: null,
      description: '',
      scoreForEachQuestion: 10,
      questions: [],
    },
  ]);

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
        message: 'Please fill title and description of test!',
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
      const response = await createTest(payload);

      if (response && response.id) {
        const newTestId = response.id;
        setTest((prev) => ({ ...prev, status }));
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
            message: error.message || 'Please check all required fields.',
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
      const transformedParts = transformFormatData(parts);
      const errorMessage = validateReadingPartPayload(transformedParts);
      if (errorMessage) {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
        return;
      }

      console.log('Transformed Parts:', transformedParts);

      const newTestId = await handleUploadTest(status);
      if (!newTestId) {
        setIsLoading(false);
        return;
      }

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

          // Tự động thêm câu hỏi đầu tiên
          const newQuestion = {
            id: Date.now(),
            question_number: 1,
            explanation: '',
            score: p.scoreForEachQuestion || 10,
          };

          if (format === 'G' || format === 'F') {
            newQuestion.content = '';
            newQuestion.answers = [
              { id: 0, option_label: 'A', is_correct: true, answer_text: '' },
              { id: 1, option_label: 'B', is_correct: false, answer_text: '' },
              { id: 2, option_label: 'C', is_correct: false, answer_text: '' },
            ];
          } else if (format === 'H') {
            newQuestion.content = '';
            newQuestion.answers = [{ id: 0, option_label: 'A', is_correct: true, answer_text: '' }];
          } else if (format === 'I') {
            newQuestion.answers = [{ id: 0, is_correct: true, answer_text: '' }];
          } else if (format === 'J') {
            newQuestion.answers = [{ id: 0, option_label: '', is_correct: true, answer_text: '' }];
          }

          updatedPart.questions = [newQuestion];
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
    // 'F': Multiple choice (short text)
    // 'G': Multiple choice (long text)
    // 'H': Fill in the blank (multiple choice)
    // 'I': Fill in the blank (text)
    // 'J': Matching
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
    <Box sx={{ ...uploadReadingStyles.mainContainer, minHeight: '100vh' }}>
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
        {/* -------- Title Section --------- */}
        <Box sx={uploadReadingStyles.cardTitle}>
          <Typography variant="h3" sx={uploadReadingStyles.mainTitleHeading}>
            Create New Reading Test
          </Typography>
          <Typography variant="body1" sx={uploadReadingStyles.description}>
            Fill in details below to create a new reading test for your students.
          </Typography>
        </Box>
        {/* -------- Function Buttons Section --------- */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            backgroundColor: '#FFF4E9',
            pt: 0.5,
            pb: 0.5,
            px: 2,
          }}
        >
          <TestEditorActions
            onPreview={() => setShowInlinePreview((prev) => !prev)}
            isPreviewActive={showInlinePreview}
            onSendReview={() => handleUploadParts('I')}
            onSaveDraft={() => handleUploadParts('D')}
            onPublish={() => handleUploadParts('P')}
            isLoading={isLoading}
          />
        </Box>

        {showInlinePreview && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <ReadingPreview
              inline
              open={false}
              onClose={() => setShowInlinePreview(false)}
              testData={{
                id: test.id,
                status: test.status,
                title: test.title,
                parts,
              }}
              showBackButton={false}
            />
          </Box>
        )}
        {/* -------- Upload Reading Test Form Section --------- */}
        {!showInlinePreview && (
          <Box sx={uploadReadingStyles.uploadReadingFormSection}>
            {/* -------------------- Basic Information -------------------- */}
            <Box sx={{ ...uploadReadingStyles.basicInfoContainer, mt: 1 }}>
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
                  <FormLabel sx={uploadReadingStyles.labelInput}>
                    Test title
                    <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                      *
                    </Box>
                  </FormLabel>
                  <OutlinedInput
                    placeholder="Enter test title here"
                    value={test.title}
                    onChange={(e) => setTest({ ...test, title: e.target.value })}
                    sx={uploadReadingStyles.input}
                  />
                </FormControl>
                <FormControl fullWidth sx={uploadReadingStyles.formControl}>
                  <FormLabel sx={uploadReadingStyles.labelInput}>
                    Time
                    <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                      *
                    </Box>
                  </FormLabel>
                  <OutlinedInput
                    placeholder="Enter time here"
                    value={test.time}
                    sx={uploadReadingStyles.input}
                    onChange={(e) => setTest({ ...test, time: Number(e.target.value) || '' })}
                  />
                </FormControl>
              </Box>
              <FormControl fullWidth sx={uploadReadingStyles.formControl}>
                <FormLabel sx={uploadReadingStyles.labelInput}>
                  Description
                  <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                    *
                  </Box>
                </FormLabel>
                <OutlinedInput
                  multiline
                  placeholder="Enter description here"
                  value={test.description}
                  onChange={(e) => setTest({ ...test, description: e.target.value })}
                  sx={uploadReadingStyles.inputMultiline}
                />
              </FormControl>
              <FormControl fullWidth sx={uploadReadingStyles.formControl}>
                <FormLabel sx={uploadReadingStyles.labelInput}>
                  Level
                  <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                    *
                  </Box>
                </FormLabel>
                <Select
                  displayEmpty
                  value={test.level}
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
        )}
      </Container>
    </Box>
  );
}
