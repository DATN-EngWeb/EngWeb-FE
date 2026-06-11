/* eslint-env browser */
/* eslint-disable no-console */
/* global DOMParser */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
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
import ReadingPreview from '../../../../../components/Teacher/ReadingTest/ReadingPreview';
import FeedbackPanel from '../../../../../components/Teacher/Feedback/FeedbackPanel';
import TestEditorActions from '../../../../../components/UploadTest/TestEditorActions';
import DeleteConfirmSnackbar from '../../../../../components/Teacher/DeleteConfirmSnackbar';
import {
  updateReadingTestContent,
  getReceptiveTestDetails,
  fetchHtmlContent,
} from '../../../../../api/teacher/upload-reading';
import {
  collectFilesUpdateReading,
  transformReadingPartsWithUrls,
  transformFormatUpdateData,
  buildReceptiveTestPayload,
  processCkeditorState,
} from '../../../../../utils/testTransformers';
import { getPresignedUrl, uploadToObjectStorage, confirmUpload } from '../../../../../api/test';
import {
  validateReadingPartUpdatePayload,
  validateReadingBasicInfo,
} from '../../../../../utils/testValidation';
import ScrollToTopButton from '../../../../../components/CreateTest/ScrollToTopButton';
import TestEditorHeader from '../../../../../components/UploadTest/TestEditorHeader';
import { accentBar, addPartBox } from '@/styles/Teacher/Listening/ListeningStyles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

export default function Page() {
  const { test_id } = useParams();
  const router = useRouter();
  const [showInlinePreview, setShowInlinePreview] = useState(false);
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(false);
  const [feedbackTab, setFeedbackTab] = useState('teacher');
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
  const originalContentRef = useRef({});

  const lastPartRef = useRef(null);
  const prevPartsLengthRef = useRef(parts.length);

  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [deleteTargetPartId, setDeleteTargetPartId] = useState(null);
  const canShowFeedback = test?.flag === 'update' && !!test?.id;

  const validateBasicInformation = () => {
    const basicInfoErrors = validateReadingBasicInfo({
      testName: test.title,
      level: test.level,
      time: test.time,
      description: test.description,
    });

    if (!basicInfoErrors) return null;

    setErrors({
      title: !!basicInfoErrors.testName,
      level: !!basicInfoErrors.level,
      time: !!basicInfoErrors.time || !!basicInfoErrors.timeNegative,
      timeNegative: !!basicInfoErrors.timeNegative,
      description: !!basicInfoErrors.description,
    });

    if (basicInfoErrors.testName) return 'Please fill title of test!';
    if (basicInfoErrors.level) return 'Please select a valid level (A1-B2)!';
    if (basicInfoErrors.time) return 'Please enter a valid time greater than 0!';
    if (basicInfoErrors.timeNegative) return 'Time cannot be negative!';
    if (basicInfoErrors.description) return 'Please fill description of test!';

    return 'Please check basic information.';
  };

  const handleStartTour = () => {
    const { driver } = require('driver.js');

    const steps = [
      {
        element: '#tour-basic-info',
        popover: {
          title: 'Basic Information',
          description:
            'Fill in the test title, duration, level, and description of the reading test.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-test-title',
        popover: {
          title: 'Test Title',
          description: 'Enter a descriptive title for this reading test.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-test-time',
        popover: {
          title: 'Test Duration',
          description:
            'Set the allowed time limit (in minutes) for students to complete this test.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-test-description',
        popover: {
          title: 'Test Description',
          description: 'Provide a brief overview or special instructions for the test.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-test-level',
        popover: {
          title: 'Difficulty Level',
          description:
            'Select the English proficiency level (A1, A2, B1, B2) targeted by this test.',
          side: 'bottom',
          align: 'start',
        },
      },
    ];

    if (document.querySelector('#tour-select-part-panel')) {
      steps.push({
        element: '#tour-select-part-panel',
        popover: {
          title: 'Select Part Type',
          description: 'Choose the format for the reading part you want to create.',
          side: 'top',
          align: 'start',
        },
      });
    }

    if (document.querySelector('#tour-score-each-question')) {
      steps.push({
        element: '#tour-score-each-question',
        popover: {
          title: 'Score per Question',
          description: 'Set the default score for each question in this part (e.g., 10 points).',
          side: 'right',
          align: 'start',
        },
      });
    }

    if (document.querySelector('#tour-passage')) {
      steps.push({
        element: '#tour-passage',
        popover: {
          title: 'Reading Passage Editor',
          description:
            'Write or paste your reading passage here using this advanced editor. Use the rich toolbar to format text (bold, italic, list, table, or upload images). IMPORTANT: For Fill-in-the-Blanks questions (Format H & I), click the "(1)_" icon in the toolbar to insert blank placeholders into the text.',
          side: 'top',
          align: 'start',
        },
      });
    }

    if (document.querySelector('#tour-questions-section')) {
      steps.push({
        element: '#tour-questions-section',
        popover: {
          title: 'Questions List',
          description:
            'Manage questions for this part. You can write question stems, explanation text, and answer choices. Check the checkbox next to the correct option to set the answer key.',
          side: 'top',
          align: 'start',
        },
      });
    }

    if (document.querySelector('#tour-add-question-btn')) {
      steps.push({
        element: '#tour-add-question-btn',
        popover: {
          title: 'Add Question',
          description: 'Click here to append a new multiple choice question to this reading part.',
          side: 'top',
          align: 'center',
        },
      });
    }

    steps.push({
      element: '#tour-add-part-btn',
      popover: {
        title: 'Create Reading Parts',
        description:
          'Click here to add a new reading part. You can choose different formats like Multiple Choice, Fill in the Blanks, or Matching.',
        side: 'top',
        align: 'center',
      },
    });

    steps.push({
      element: '#tour-actions-bar',
      popover: {
        title: 'Action Panel',
        description:
          'Once finished, use this panel to Preview the test, Save it as a Draft, Send it for Review, or Publish it immediately.',
        side: 'bottom',
        align: 'center',
      },
    });

    const driverObj = driver({
      showProgress: true,
      animate: true,
      doneBtnText: 'Finish',
      closeBtnText: 'Close',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      steps: steps,
    });

    driverObj.drive();
  };

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
        const svData = await getReceptiveTestDetails(test_id);

        if (!svData.is_owner) {
          setSnackbar({
            open: true,
            message: 'You do not have permission to edit this test',
            severity: 'error',
          });
          setTimeout(() => router.push('/teacher/upload-test/reading'), 1500);
          return;
        }

        if (svData.status !== 'D' && svData.status !== 'I') {
          setSnackbar({
            open: true,
            message: 'Only draft tests can be edited',
            severity: 'error',
          });
          setTimeout(() => router.push('/teacher/upload-test/reading'), 1500);
          return;
        }

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
            };

            originalContentRef.current[newPart.id] = {
              content: newPart.content,
              questions: {},
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
                    // I, H ko có content
                    ...(!['I', 'H'].includes(format) && { content: q.content }),
                  };

                  if (newQ.content?.startsWith?.('http') && format !== 'G' && format !== 'J') {
                    originalContentRef.current[newPart.id].questions[newQ.id] = newQ.content;
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
      if (lastPartRef.current && test?.flag !== 'update') {
        lastPartRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
    prevPartsLengthRef.current = parts.length;
  }, [parts.length]);

  const [errors, setErrors] = useState({});

  // Hàm xử lý tải lên các Part của bài thi
  const handleUploadParts = async (status) => {
    setIsLoading(true);
    setErrors({}); // Reset errors before validation
    try {
      const basicInfoErrorMessage = validateBasicInformation();
      if (basicInfoErrorMessage) {
        setSnackbar({
          open: true,
          message: basicInfoErrorMessage,
          severity: 'error',
        });
        setIsLoading(false);
        return;
      }

      const finalParts = processCkeditorState(parts, originalContentRef.current, test.flag);
      const errorMessage = validateReadingPartUpdatePayload(finalParts);
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

      const transformedParts = transformFormatUpdateData(finalParts);

      const files = collectFilesUpdateReading(transformedParts);
      const filenameToUrl = {};
      for (const f of files) {
        const currentMimeType = f.mimeType ?? f.file?.type ?? 'text/html';
        const currentSize = f.fileSize ?? f.file?.size;

        const presign = await getPresignedUrl({
          filename: f.filename,
          fileSize: currentSize,
          mimeType: currentMimeType,
          category: 'tests',
          testId: test_id,
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

      const requestBody = buildReceptiveTestPayload(test, preparedParts, status);

      await updateReadingTestContent(test_id, requestBody);
      setSnackbar({ open: true, message: 'Update test successfully!', severity: 'success' });

      setTimeout(() => {
        router.push('/teacher');
      }, 1000);
    } catch (error) {
      if (error.status === 400) {
        setSnackbar({
          open: true,
          message: error.message || 'Invalid data format. Please check your input.',
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
          const parser = new DOMParser();
          const doc = parser.parseFromString(p.content || '', 'text/html');
          const blankCount = doc.querySelectorAll('.blank-element').length;

          const deletedOldQuestions = (p.questions || [])
            .map((q) => {
              if (q.action === 'delete') return q;
              if (q.action === 'create') return null;
              if (test.flag === 'update') return { id: q.id, action: 'delete' };
              return null;
            })
            .filter(Boolean); // Lọc bỏ các giá trị null

          const newQuestions = [];
          for (let i = 0; i < blankCount; i++) {
            const newQuestion = {
              id: Date.now() + i,
              question_number: i + 1,
              explanation: '',
              score: p.scoreForEachQuestion || 10,
              ...(test.flag === 'update' && { action: 'create' }),
            };

            if (newFormat === 'H') {
              // Loại H: Không cần content và mảng answers có option_label
              newQuestion.answers = [
                {
                  id: Date.now() + i + 100,
                  option_label: 'A',
                  is_correct: true,
                  answer_text: '',
                  ...(test.flag === 'update' && { action: 'create' }),
                },
                {
                  id: Date.now() + i + 200,
                  option_label: 'B',
                  is_correct: false,
                  answer_text: '',
                  ...(test.flag === 'update' && { action: 'create' }),
                },
                {
                  id: Date.now() + i + 300,
                  option_label: 'C',
                  is_correct: false,
                  answer_text: '',
                  ...(test.flag === 'update' && { action: 'create' }),
                },
              ];
            } else if (newFormat === 'I') {
              // Loại I: Không cần content, answers không có option_label
              newQuestion.answers = [
                {
                  id: Date.now() + i + 100,
                  is_correct: true,
                  answer_text: '',
                  ...(test.flag === 'update' && { action: 'create' }),
                },
              ];
            }

            newQuestions.push(newQuestion);
          }

          return {
            ...p,
            format: newFormat,
            questions: [...deletedOldQuestions, ...newQuestions],
            ...(test.flag === 'update' && !p.action && { action: 'update' }),
          };
        }
        return p;
      }),
    );
  };

  const handleRequestDeletePart = (idToDelete) => {
    setDeleteTargetPartId(idToDelete);
  };

  const handleConfirmDeletePart = () => {
    if (!deleteTargetPartId) return;

    setParts((prevParts) => {
      let updatedParts;

      if (test?.flag === 'update') {
        updatedParts = prevParts
          .map((part) => {
            if (part.id === deleteTargetPartId) {
              if (part.action === 'create') return null;
              return { id: part.id, action: 'delete' };
            }
            return part;
          })
          .filter(Boolean);
      } else {
        updatedParts = prevParts.filter((part) => part.id !== deleteTargetPartId);
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
    setDeleteTargetPartId(null);
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
    let deleteBlocked = false;

    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id !== partId) return p;

        return {
          ...p,
          questions: p.questions.map((q) => {
            if (q.id !== questionId) return q;

            const activeAnswersCount = (q.answers || []).filter(
              (a) => a.action !== 'delete',
            ).length;
            if (activeAnswersCount <= 2) {
              deleteBlocked = true;
              return q;
            }

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
          // Nếu là loại G hoặc H hoặc I
          if (format === 'G' || format === 'H' || format === 'I' || format === 'J') {
            updatedPart.content = '';
          }

          // Tự động thêm câu hỏi đầu tiên (nếu part chưa có câu hỏi nào đang active)
          const activeQuestions = p.questions
            ? p.questions.filter((q) => q.action !== 'delete')
            : [];
          if (format && activeQuestions.length === 0) {
            const now = Date.now();
            const newQuestion = {
              id: now,
              question_number: 1,
              explanation: '',
              score: p.scoreForEachQuestion || 10,
              ...(test.flag === 'update' && { action: 'create' }),
            };

            if (format === 'G' || format === 'F') {
              newQuestion.content = '';
              newQuestion.answers = [
                {
                  id: 0,
                  option_label: 'A',
                  is_correct: true,
                  answer_text: '',
                  ...(test.flag === 'update' && { action: 'create' }),
                },
                {
                  id: 1,
                  option_label: 'B',
                  is_correct: false,
                  answer_text: '',
                  ...(test.flag === 'update' && { action: 'create' }),
                },
                {
                  id: 2,
                  option_label: 'C',
                  is_correct: false,
                  answer_text: '',
                  ...(test.flag === 'update' && { action: 'create' }),
                },
              ];
            } else if (format === 'H') {
              return updatedPart;
            } else if (format === 'I') {
              return updatedPart;
            } else if (format === 'J') {
              newQuestion.answers = [
                {
                  id: 0,
                  option_label: '',
                  is_correct: true,
                  answer_text: '',
                  ...(test.flag === 'update' && { action: 'create' }),
                },
              ];
            }
            updatedPart.questions = [...(p.questions || []), newQuestion];
          }

          return updatedPart;
        }
        return p;
      }),
    );
  };

  const handleUpdateScoreForEachQuestionPart = (partId, newScoreForEachQuestion) => {
    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id !== partId) return p;

        const updatedScore = Number(newScoreForEachQuestion);
        const updatedQuestions = (p.questions || []).map((q) => ({
          ...q,
          score: updatedScore,
          ...(test.flag === 'update' && !q.action && { action: 'update' }),
          ...(test.flag === 'update' && { _changedFields: ['score'] }),
        }));

        return {
          ...p,
          scoreForEachQuestion: updatedScore,
          questions: updatedQuestions,
          ...(test.flag === 'update' && !p.action && { action: 'update' }),
        };
      }),
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
              ...(test.flag === 'update' && { ckeditor: true }),
            }
          : p,
      ),
    );
  };

  const handleEditorError = (message) => {
    setSnackbar({
      open: true,
      message: message,
      severity: 'error',
    });
  };

  const handleShowPreview = () => {
    const basicInfoErrorMessage = validateBasicInformation();
    if (basicInfoErrorMessage) {
      setSnackbar({
        open: true,
        message: basicInfoErrorMessage,
        severity: 'error',
      });
      return;
    }
    const activeParts = parts.filter((part) => part.action !== 'delete');
    if (activeParts.length === 0) {
      setSnackbar({
        open: true,
        message: 'The test need at least one part!',
        severity: 'error',
      });
      return;
    }
    if (
      activeParts.length === 1 &&
      (activeParts[0].format === undefined || activeParts[0].format === null)
    ) {
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
            handleDeletePart={handleRequestDeletePart}
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
            flag={test.flag}
            localAnswers={part.initialLocalAnswers || []}
            part={part}
            partId={part.id}
            index={index}
            handleDeletePart={handleRequestDeletePart}
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
            flag={test.flag}
            part={part}
            partId={part.id}
            index={index}
            handleDeletePart={handleRequestDeletePart}
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
      <ScrollToTopButton />
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
        <TestEditorHeader
          title="Update Reading Test"
          description="Fill in the details below to update the reading test for your students"
          sx={{ mb: 2.5 }}
        />
        {/* -------- Function Buttons Section --------- */}
        <Box
          id="tour-actions-bar"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            backgroundColor: '#FFF4E9',
            pt: 0.5,
            pb: 0.5,
          }}
        >
          <TestEditorActions
            onPreview={() => handleShowPreview()}
            isPreviewActive={showInlinePreview}
            onFeedback={
              canShowFeedback
                ? () => {
                    setShowFeedbackPanel((prev) => {
                      const next = !prev;
                      if (next) {
                        setShowInlinePreview(false);
                      }
                      return next;
                    });
                  }
                : undefined
            }
            isFeedbackActive={showFeedbackPanel}
            onSendReview={() => handleUploadParts('I')}
            onSaveDraft={() => handleUploadParts('D')}
            onPublish={() => handleUploadParts('P')}
            onTour={handleStartTour}
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
                parts: parts.filter((part) => part.action !== 'delete'),
              }}
              showBackButton={false}
            />
          </Box>
        )}
        {/* -------- Upload Reading Test Form Section --------- */}
        {!showInlinePreview && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 2,
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ ...uploadReadingStyles.uploadReadingFormSection, flex: 1, minWidth: 0 }}>
              {/* -------------------- Basic Information -------------------- */}
              <Box id="tour-basic-info" sx={uploadReadingStyles.basicInfoContainer}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 2,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={accentBar} />

                  <Typography
                    sx={{
                      ...uploadReadingStyles.basicInfoHeading,
                      fontSize: { xs: '1rem', md: '1.2rem' },
                    }}
                  >
                    Basic infomation
                  </Typography>
                </Box>
                <Box sx={uploadReadingStyles.nameTestAndTime}>
                  <FormControl id="tour-test-title" fullWidth sx={uploadReadingStyles.formControl}>
                    <FormLabel sx={uploadReadingStyles.labelInput}>
                      Test title
                      <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                        *
                      </Box>
                    </FormLabel>
                    <OutlinedInput
                      size="small"
                      placeholder="Enter test title here"
                      defaultValue={test.title}
                      error={!!errors.title}
                      onBlur={(e) => setTest({ ...test, title: e.target.value })}
                      sx={uploadReadingStyles.input}
                    />
                  </FormControl>
                  <FormControl id="tour-test-time" fullWidth sx={uploadReadingStyles.formControl}>
                    <FormLabel sx={uploadReadingStyles.labelInput}>
                      Time
                      <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                        *
                      </Box>
                    </FormLabel>
                    <OutlinedInput
                      size="small"
                      placeholder="60"
                      defaultValue={test.time}
                      error={!!errors.time || !!errors.timeNegative}
                      sx={uploadReadingStyles.input}
                      onBlur={(e) => setTest({ ...test, time: Number(e.target.value) || '' })}
                    />
                  </FormControl>
                </Box>
                <FormControl
                  id="tour-test-description"
                  fullWidth
                  sx={uploadReadingStyles.formControl}
                >
                  <FormLabel sx={uploadReadingStyles.labelInput}>
                    Description
                    <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                      *
                    </Box>
                  </FormLabel>
                  <OutlinedInput
                    size="small"
                    placeholder="Enter description here"
                    defaultValue={test.description}
                    error={!!errors.description}
                    onBlur={(e) => setTest({ ...test, description: e.target.value })}
                    sx={uploadReadingStyles.input}
                  />
                </FormControl>
                <FormControl id="tour-test-level" fullWidth sx={uploadReadingStyles.formControl}>
                  <FormLabel sx={uploadReadingStyles.labelInput}>
                    Level
                    <Box component="span" sx={uploadReadingStyles.requiredAsterisk}>
                      *
                    </Box>
                  </FormLabel>
                  <Select
                    size="small"
                    displayEmpty
                    value={test.level || ''}
                    error={!!errors.level}
                    sx={{
                      ...uploadReadingStyles.input,
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
              {parts
                .filter((part) => part.action !== 'delete')
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((part, index) => (
                  <Box
                    key={part.id}
                    id={!part.format ? 'tour-select-part-panel' : undefined}
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
                          onClick={() => handleRequestDeletePart(part.id)}
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
              <Box id="tour-add-part-btn" sx={addPartBox} onClick={() => handleAddPart()}>
                <AddRoundedIcon sx={{ fontSize: '1.4rem' }} /> Add New Part
              </Box>
            </Box>

            {canShowFeedback && showFeedbackPanel && (
              <Paper
                elevation={0}
                sx={{
                  width: { xs: '100%', lg: '320px' },
                  flexShrink: 0,
                  border: '1px solid #f0f0f0',
                  borderRadius: 3,
                  bgcolor: '#fff',
                  overflow: 'auto',
                  position: { lg: 'sticky' },
                  top: { lg: 70 },
                  maxHeight: { lg: 'calc(100vh - 90px)' },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Tabs
                  value={feedbackTab}
                  onChange={(_, value) => setFeedbackTab(value)}
                  variant="fullWidth"
                  sx={{
                    minHeight: 40,
                    '& .MuiTab-root': {
                      minHeight: 40,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                    },
                  }}
                >
                  <Tab value="ai" label="AI feedback" />
                  <Tab value="teacher" label="Teacher feedback" />
                </Tabs>
                <Box sx={{ p: 1.5, minHeight: 0, flex: 1 }}>
                  <FeedbackPanel
                    testId={test.id}
                    compact
                    readOnly
                    feedbackFilter={feedbackTab === 'ai' ? 'ai' : 'teacher'}
                  />
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </Container>

      <DeleteConfirmSnackbar
        open={Boolean(deleteTargetPartId)}
        onClose={() => setDeleteTargetPartId(null)}
        onConfirm={handleConfirmDeletePart}
        loading={false}
        title="Confirm Delete Part"
        description="Delete this part? This action will remove it from the test."
        confirmLabel="Delete part"
        loadingLabel="Deleting part..."
      />
    </Box>
  );
}
