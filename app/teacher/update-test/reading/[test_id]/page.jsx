/* eslint-env browser */
/* eslint-disable no-console */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  Snackbar,
  Alert,
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
import { uploadReadingStyles } from '../../../../../styles/Teacher/Reading/UploadReadingStyles';
import MultipleChoiceForm from '../../../../../components/Teacher/ReadingTest/multipleChoice';
import MatchingForm from '../../../../../components/Teacher/ReadingTest/matching';
import FillBlankForm from '../../../../../components/Teacher/ReadingTest/fillBlanks';
import {
  updateReadingTestContent,
  getRecepiveTestDetails,
  fetchHtmlContent,
} from '../../../../../api/teacher/upload-reading';
import {
  collectFilesReading,
  transformReadingPartsWithUrls,
  transformFormatUpdateData,
  buildReceptiveTestPayload,
} from '../../../../../utils/testTransformers';
import { getPresignedUrl, uploadToObjectStorage, confirmUpload } from '../../../../../api/test';

export default function Page() {
  const { test_id } = useParams();
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

  const lastPartRef = useRef(null);
  const prevPartsLengthRef = useRef(parts.length);

  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const extractLocalAnswersFromQuestions = (questions) => {
    if (!questions || !Array.isArray(questions)) return [];

    const answersMap = new Map();

    questions.forEach((q) => {
      if (q.answers && Array.isArray(q.answers)) {
        q.answers.forEach((ans) => {
          if (ans.option_label) {
            const currentText = answersMap.get(ans.option_label);
            if (!answersMap.has(ans.option_label) || (!currentText && ans.answer_text)) {
              answersMap.set(ans.option_label, ans.answer_text || '');
            }
          }
        });
      }
    });

    return Array.from(answersMap.entries())
      .map(([label, text]) => ({
        option_label: label,
        answer_text: text,
      }))
      .sort((a, b) => a.option_label.localeCompare(b.option_label));
  };

  useEffect(() => {
    const fetchTestData = async () => {
      if (!test_id) return;

      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setSnackbar({ open: true, message: 'Authentication required', severity: 'error' });
          return;
        }

        const svData = await getRecepiveTestDetails(test_id, accessToken);

        setTest({
          id: svData.id ?? '',
          title: svData.title || '',
          type: svData.type || 'R',
          level: svData.level || '',
          skill: svData.skill || 'R',
          time: svData.time > 10000 ? 60 : svData.time,
          description: svData.description || '',
          status: svData.status || 'D',
          flag: 'update',
        });

        const rawParts = svData.receptive_test?.receptive_parts || [];

        const processedParts = await Promise.all(
          rawParts.map(async (part, pIndex) => {
            const { format } = part;

            const newPart = {
              id: part.id ?? `part_${Date.now()}_${pIndex}`,
              order: part.order,
              format: format,
              scoreForEachQuestion: part.receptive_questions?.[0]?.score,
              // F ko có content; G, H, I, J ko có description
              ...(format !== 'F' && { content: part.content }),
              ...(!['G', 'H', 'I', 'J'].includes(format) && { description: part.description }),
            };

            // Fetch nội dung HTML cho Part nếu có content
            if (newPart.content?.startsWith?.('http')) {
              newPart.content = await fetchHtmlContent(newPart.content);
            }

            if (part.receptive_questions && Array.isArray(part.receptive_questions)) {
              newPart.questions = await Promise.all(
                part.receptive_questions.map(async (q, qIndex) => {
                  const newQ = {
                    id: q.id ?? `q_${pIndex}_${qIndex}`,
                    question_number: q.question_number,
                    explanation: q.explanation,
                    score: q.score,
                    // I và J ko có content
                    ...(!['I', 'J'].includes(format) && { content: q.content }),
                  };

                  if (newQ.content?.startsWith?.('http')) {
                    newQ.content = await fetchHtmlContent(newQ.content);
                  }

                  newQ.answers = (q.receptive_answers || []).map((ans) => {
                    const { resources, ...restAns } = ans;

                    // I không có option_label
                    if (format === 'I') {
                      const { option_label, ...ansNoLabel } = restAns;
                      return ansNoLabel;
                    }
                    return restAns;
                  });

                  return newQ;
                }),
              );
            }

            if (format === 'J') {
              const extractedAnswers = extractLocalAnswersFromQuestions(newPart.questions);
              if (extractedAnswers.length === 0 && newPart.questions) {
                newPart.questions.forEach((_, i) => {
                  extractedAnswers.push({
                    id: i,
                    option_label: String.fromCharCode(65 + i),
                    answer_text: '',
                  });
                });
              }
              newPart.initialLocalAnswers = extractedAnswers;
            }

            return newPart;
          }),
        );

        setParts(processedParts);
      } catch (error) {
        console.error('Lỗi tải dữ liệu bài thi:', error);
      }
    };

    fetchTestData();
  }, [test_id]);

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

  // Hàm xử lý tải lên các Part của bài thi
  const handleUploadParts = async (status) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setSnackbar({ open: true, message: 'Authentication required', severity: 'error' });
        setIsLoading(false);
        return;
      }

      const transformedParts = transformFormatUpdateData(parts);

      const files = collectFilesReading(transformedParts);
      const filenameToUrl = {};
      for (const f of files) {
        const currentMimeType = f.mimeType ?? f.file?.type ?? 'text/html';
        const currentSize = f.fileSize ?? f.file?.size;

        const presign = await getPresignedUrl(
          {
            filename: f.filename,
            fileSize: currentSize,
            mimeType: currentMimeType,
            category: 'tests',
            testId: test_id,
            part: f.partOrder,
          },
          token,
        );

        const uploadResult = await uploadToObjectStorage({
          url: presign.url,
          fields: presign.fields,
          file: f.file,
          mimeType: currentMimeType,
        });

        const storageKey =
          presign.key ||
          (presign.fields
            ? typeof presign.fields === 'string'
              ? JSON.parse(presign.fields).key
              : presign.fields.key
            : null);

        const confirm = await confirmUpload(
          {
            key: storageKey,
            fileSize: currentSize,
            mimeType: currentMimeType,
            etag: uploadResult.etag,
          },
          token,
        );

        filenameToUrl[f.filename] = confirm.file_url || presign.url;
      }

      const preparedParts = transformReadingPartsWithUrls(transformedParts, filenameToUrl);

      const requestBody = buildReceptiveTestPayload(test, preparedParts, status);

      const response = await updateReadingTestContent(test_id, requestBody, token);
      setSnackbar({ open: true, message: 'Update test successfully!', severity: 'success' });
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
          message: 'Test not found. Or test type is not reading.',
          severity: 'error',
        });
      } else if (error.status === 403) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to update this test.',
          severity: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPart = () => {
    const activeParts = parts.filter((p) => p.action !== 'delete');

    const newPart = {
      id: Date.now(),
      order: activeParts.length + 1,
      format: null,
      description: '',
      scoreForEachQuestion: 10,
      questions: [],
      ...(test.flag === 'update' && { action: 'create' }),
    };
    setParts([...parts, newPart]);
  };

  const updatePartQuestions = (partId, newQuestions) => {
    setParts((prevParts) =>
      prevParts.map((p) =>
        p.id === partId
          ? {
              ...p,
              questions: newQuestions,
              ...(test.flag === 'update' && !p.action && { action: 'update' }),
            }
          : p,
      ),
    );
  };

  // Dành cho format H và I
  const handleUpdateFormat = (partId, newFormat) => {
    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id === partId) {
          const deletedOldQuestions = (p.questions || [])
            .map((q) => {
              if (q.action === 'create') return null;
              return { id: q.id, action: 'delete' };
            })
            .filter(Boolean);

          // Tạo câu hỏi mặc định tùy theo Format
          const newQuestion = {
            id: Date.now(),
            question_number: 1,
            explanation: '',
            score: p.scoreForEachQuestion || 10, // Lấy score mặc định của Part
            ...(test.flag === 'update' && { action: 'create' }),
          };

          if (newFormat === 'H') {
            // Loại H: Cần content và mảng answers
            newQuestion.content = '';
            newQuestion.answers = [
              {
                option_label: 'A',
                is_correct: true,
                answer_text: '',
                ...(test.flag === 'update' && { action: 'create' }),
              },
            ];
          } else if (newFormat === 'I') {
            // Loại I: answers vẫn là mảng nhưng chứa 1 phần tử, không có trường content trong Question
            newQuestion.answers = [
              {
                is_correct: true,
                answer_text: '',
                ...(test.flag === 'update' && { action: 'create' }),
              },
            ];
          }

          return {
            ...p,
            format: newFormat,
            questions: [...deletedOldQuestions, newQuestion],
            ...(test.flag === 'update' && !p.action && { action: 'update' }),
          };
        }
        return p;
      }),
    );
  };

  const handleDeletePart = (idToDelete) => {
    setParts((prevParts) => {
      let updatedParts;

      if (test?.flag === 'update') {
        updatedParts = prevParts
          .map((part) => {
            if (part.id === idToDelete) {
              if (part.action === 'create') return null;
              return { id: part.id, action: 'delete' };
            }
            return part;
          })
          .filter(Boolean);
      } else {
        updatedParts = prevParts.filter((part) => part.id !== idToDelete);
      }

      let visibleIndex = 1;
      return updatedParts.map((part) => {
        if (part.action === 'delete') return part;
        return {
          ...part,
          order: visibleIndex++,
        };
      });
    });
  };

  const handleDeleteQuestion = (partId, questionId) => {
    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id !== partId) return p;

        let updatedQuestions;
        if (test?.flag === 'update') {
          updatedQuestions = p.questions
            .map((q) => {
              if (q.id === questionId) {
                if (q.action === 'create') return null;
                return { id: q.id, action: 'delete' };
              }
              return q;
            })
            .filter(Boolean);
        } else {
          updatedQuestions = p.questions.filter((q) => q.id !== questionId);
        }

        let currentNumber = 1;
        updatedQuestions = updatedQuestions.map((q) => {
          if (q.action === 'delete') return q;

          if (q.question_number !== currentNumber) {
            return {
              ...q,
              question_number: currentNumber++,
            };
          }

          currentNumber++;
          return q;
        });

        if (p.format === 'J') {
          const activeQsCount = updatedQuestions.filter((q) => q.action !== 'delete').length;
          const maxLabelCode = 65 + activeQsCount - 1;

          updatedQuestions = updatedQuestions.map((q) => {
            if (q.action === 'delete') return q;

            const currentLabel = q.answers?.[0]?.option_label;
            if (currentLabel && currentLabel.charCodeAt(0) > maxLabelCode) {
              return {
                ...q,
                answers: [{ ...q.answers[0], option_label: '', answer_text: '' }],
                ...(test.flag === 'update' && !q.action && { action: 'update' }),
              };
            }
            return q;
          });
        }

        return {
          ...p,
          questions: updatedQuestions,
          ...(test?.flag === 'update' && !p.action && { action: 'update' }),
        };
      }),
    );
  };

  const handleDeleteOption = (partId, questionId, optionLabel) => {
    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id !== partId) return p;

        return {
          ...p,
          questions: p.questions.map((q) => {
            if (q.id !== questionId) return q;

            let updatedAnswers;
            if (test?.flag === 'update') {
              updatedAnswers = q.answers
                .map((a) => {
                  if (a.option_label === optionLabel) {
                    if (a.action === 'create') return null;
                    return { id: a.id, action: 'delete' };
                  }
                  return a;
                })
                .filter(Boolean);
            } else {
              updatedAnswers = q.answers.filter((a) => a.option_label !== optionLabel);
            }

            let visibleIndex = 0;
            const reindexedAnswers = updatedAnswers.map((a) => {
              if (a.action === 'delete') return a;
              return {
                ...a,
                option_label: String.fromCharCode(65 + visibleIndex++),
              };
            });

            return {
              ...q,
              answers: reindexedAnswers,
              ...(test?.flag === 'update' && !q.action && { action: 'update' }),
            };
          }),
          ...(test?.flag === 'update' && !p.action && { action: 'update' }),
        };
      }),
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
      prevParts.map((p) =>
        p.id === partId
          ? {
              ...p,
              description: newDescription,
              ...(test.flag === 'update' && !p.action && { action: 'update' }),
            }
          : p,
      ),
    );
  };

  const handleUpdateContentPart = (partId, newContent) => {
    setParts((prevParts) =>
      prevParts.map((p) =>
        p.id === partId
          ? {
              ...p,
              content: newContent,
              ...(test.flag === 'update' && !p.action && { action: 'update' }),
            }
          : p,
      ),
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
            flag={test.flag}
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
            flag={test.flag}
            localAnswers={part.initialLocalAnswers || []}
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
            flag={test.flag}
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
            onClick={() => handleUploadParts('D')}
            disabled={isLoading}
          >
            Save Draft
          </Button>
          <Button
            startIcon={<FileUploadIcon sx={{ fontSize: 20, transform: 'translateY(0px)' }} />}
            sx={{ ...uploadReadingStyles.publicButton, gridArea: 'item4' }}
            onClick={() => handleUploadParts('P')}
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
                value={test.level || ''}
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
          {parts
            .filter((part) => part.action !== 'delete')
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((part, index) => (
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
