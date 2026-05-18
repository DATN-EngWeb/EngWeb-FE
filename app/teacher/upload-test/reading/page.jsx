/* eslint-env browser */
/* eslint-disable no-console */
/* global fetch */
/* global DOMParser */
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
import { uploadReadingTestContent } from '../../../../api/teacher/upload-reading';
import { createTest } from '../../../../api/test';
import {
  collectFilesReading,
  transformReadingPartsWithUrls,
  transformFormatData,
} from '../../../../utils/testTransformers';
import { getPresignedUrl, uploadToObjectStorage, confirmUpload } from '../../../../api/test';
import { validateReadingPartPayload } from '../../../../utils/testValidation';
import { accentBar, addPartBox } from '@/styles/Teacher/Listening/ListeningStyles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

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
    if (!test.title) {
      setSnackbar({
        open: true,
        message: 'Please fill title of test!',
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

  const [errors, setErrors] = useState({});

  // Hàm xử lý tải lên các Part của bài thi
  const handleUploadParts = async (status) => {
    setIsLoading(true);
    setErrors({}); // Reset errors before validation

    try {
      // Validate Basic Info
      if (!test.title) {
        setErrors((prev) => ({ ...prev, title: true }));
        setSnackbar({ open: true, message: 'Please fill title of test!', severity: 'error' });
        setIsLoading(false);
        return;
      }
      if (!['A1', 'A2', 'B1', 'B2'].includes(test.level)) {
        setErrors((prev) => ({ ...prev, level: true }));
        setSnackbar({
          open: true,
          message: 'Please select a valid level (A1-B2)!',
          severity: 'error',
        });
        setIsLoading(false);
        return;
      }

      const transformedParts = transformFormatData(parts);
      const errorMessage = validateReadingPartPayload(transformedParts);

      if (errorMessage) {
        // Here we could parse errorMessage to find exactly where it failed,
        // but for now let's show a general error in parts if it fails.
        // As requested by user, we should highlight specific fields.
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
        setIsLoading(false);
        return;
      }

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
          const parser = new DOMParser();
          const doc = parser.parseFromString(p.content || '', 'text/html');
          const blankCount = doc.querySelectorAll('.blank-element').length;

          const existingQuestions = p.questions || [];

          const rebuiltQuestions = [];

          for (let i = 0; i < blankCount; i++) {
            const existingQ = existingQuestions[i];

            const newQuestion = {
              id: existingQ ? existingQ.id : Date.now() + i,
              question_number: i + 1,
              explanation: '',
              score: p.scoreForEachQuestion || 10,
            };

            if (newFormat === 'H') {
              newQuestion.answers = [
                {
                  id: Date.now() + i + 100,
                  option_label: 'A',
                  is_correct: true,
                  answer_text: '',
                },
                {
                  id: Date.now() + i + 200,
                  option_label: 'B',
                  is_correct: false,
                  answer_text: '',
                },
                {
                  id: Date.now() + i + 300,
                  option_label: 'C',
                  is_correct: false,
                  answer_text: '',
                },
              ];
            } else if (newFormat === 'I') {
              newQuestion.answers = [
                {
                  id: Date.now() + i + 100,
                  is_correct: true,
                  answer_text: '',
                },
              ];
            }

            rebuiltQuestions.push(newQuestion);
          }

          return {
            ...p,
            format: newFormat,
            questions: rebuiltQuestions,
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
    let deleteBlocked = false;

    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id !== partId) return p;

        return {
          ...p,
          questions: p.questions.map((q) => {
            if (q.id !== questionId) return q;

            if (q.answers.length <= 2) {
              deleteBlocked = true;
              return q;
            }

            return {
              ...q,
              // Lọc bỏ optionId, sau đó cập nhật lại nhãn A, B, C nếu cần
              answers: q.answers
                .filter((a) => a.option_label !== optionLabel)
                .map((a, index) => ({
                  ...a,
                  option_label: String.fromCharCode(65 + index), // Reset lại nhãn A, B, C theo thứ tự mới
                })),
            };
          }),
        };
      }),
    );

    if (deleteBlocked) {
      setSnackbar({
        open: true,
        message: 'Each question must keep at least 2 answer options.',
        severity: 'warning',
      });
    }
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
            return updatedPart;
          } else if (format === 'I') {
            return updatedPart;
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

  const handleShowPreview = () => {
    if (!test.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Test title is required!',
        severity: 'error',
      });
      return;
    }
    if (parts.length === 0) {
      setSnackbar({
        open: true,
        message: 'The test need at least one part!',
        severity: 'error',
      });
      return;
    }
    if (parts.length === 1 && (parts[0].format === undefined || parts[0].format === null)) {
      setSnackbar({
        open: true,
        message: 'The test need at least one part!',
        severity: 'error',
      });
      return;
    }
    setShowInlinePreview((prev) => !prev);
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
            errors={errors}
          />
        );
      case 'J':
        return (
          <MatchingForm
            part={part}
            partId={part.id}
            index={index}
            localAnswers={part.localAnswers || []}
            handleDeletePart={handleDeletePart}
            handleDeleteQuestion={handleDeleteQuestion}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            setLocalAnswers={(newAns) => {
              setParts((prev) =>
                prev.map((p) => (p.id === part.id ? { ...p, localAnswers: newAns } : p)),
              );
            }}
            handleUpdateScoreForEachQuestionPart={handleUpdateScoreForEachQuestionPart}
            handleUpdateContentPart={handleUpdateContentPart}
            handleEditorError={handleEditorError}
            errors={errors}
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
            handleDeleteOption={handleDeleteOption}
            questions={partQuestions}
            setQuestions={(newQs) => updatePartQuestions(part.id, newQs)}
            setFormat={(newFormat) => handleUpdateFormat(part.id, newFormat)}
            handleUpdateScoreForEachQuestionPart={handleUpdateScoreForEachQuestionPart}
            handleUpdateContentPart={handleUpdateContentPart}
            handleEditorError={handleEditorError}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ ...uploadReadingStyles.mainContainer, minHeight: 'calc(100vh-64px)' }}>
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
        <TestEditorHeader
          title="Create New Reading Test"
          description="Fill in the details below to create a new reading test for your students"
          sx={{ mb: 2.5 }}
        />
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
            onPreview={() => handleShowPreview()}
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
            <Box sx={uploadReadingStyles.basicInfoContainer}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={accentBar} />
                <Typography
                  sx={{
                    ...uploadReadingStyles.basicInfoHeading,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                  }}
                >
                  Basic infomation
                </Typography>
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
                    size="small"
                    placeholder="Enter test title here"
                    value={test.title}
                    error={!!errors.title}
                    onChange={(e) => {
                      setTest({ ...test, title: e.target.value });
                      if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
                    }}
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
                    size="small"
                    placeholder="60"
                    value={test.time}
                    error={!!errors.time}
                    sx={uploadReadingStyles.input}
                    onChange={(e) => {
                      setTest({ ...test, time: Number(e.target.value) || '' });
                      if (errors.time) setErrors((prev) => ({ ...prev, time: false }));
                    }}
                  />
                </FormControl>
              </Box>
              <FormControl fullWidth sx={uploadReadingStyles.formControl}>
                <FormLabel sx={uploadReadingStyles.labelInput}>
                  Description <span style={{ color: 'red' }}>*</span>
                </FormLabel>
                <OutlinedInput
                  size="small"
                  placeholder="Enter description here"
                  value={test.description}
                  onChange={(e) => setTest({ ...test, description: e.target.value })}
                  sx={uploadReadingStyles.input}
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
                  size="small"
                  displayEmpty
                  value={test.level}
                  error={!!errors.level}
                  sx={{
                    ...uploadReadingStyles.input,
                    ...(errors.level && {
                      borderColor: 'error.main',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }),
                    '& .MuiSelect-icon': {
                      color: 'text.gray',
                      fontSize: '1.6rem',
                      right: '12px',
                      transition: 'transform 0.2s',
                    },
                    '& .MuiSelect-iconOpen': {
                      color: 'text.primary',
                      transform: 'rotate(180deg)',
                    },
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                    },
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                  onChange={(e) => {
                    setTest({ ...test, level: e.target.value });
                    if (errors.level) setErrors((prev) => ({ ...prev, level: false }));
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
            <Box sx={addPartBox} onClick={() => handleAddPart()}>
              <AddRoundedIcon sx={{ fontSize: '1.4rem' }} /> Add New Part
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
