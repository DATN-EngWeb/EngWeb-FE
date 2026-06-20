/* global fetch */
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductiveTestEditor from './../Writing-Speaking/ProductiveTestEditor';
import ProductiveEditor from './../Writing-Speaking/ProductiveEditor';
import ProductivePreview from './../Writing-Speaking/ProductivePreview';
import FeedbackPanel from '../Teacher/Feedback/FeedbackPanel';
import { updateProductiveTest, getProductiveTestDetails } from '../../api/test';
import { uploadHtmlContent } from '../../utils/uploadHelpers';
import { parseApiError } from '../../utils/productiveTestValidation';

export default function UpdateWritingTestEditor() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const reverseFormatMapper = {
    A: 'Email',
    B: 'Article',
    C: 'Story',
    D: 'Essay',
    E: 'Letter',
    F: 'Reviews',
  };
  const formatMapper = {
    Email: 'A',
    Article: 'B',
    Story: 'C',
    Essay: 'D',
    Letter: 'E',
    Reviews: 'F',
  };

  const { test_id: testId } = useParams();
  const [isReadOnly] = useState(false);

  const [testData, setTestData] = useState({
    skill: 'W',
    testName: '',
    level: '',
    topics: '',
    format: '',
    descriptionInfo: '',
  });
  const [settings, setSettings] = useState({
    skill: 'W',
    timeLimit: 30,
    minWords: 100,
    score: 10,
  });
  const [question, setQuestion] = useState({
    description: '',
    suggestion: '',
    audio: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [testStatus, setTestStatus] = useState('');
  const [basicOpen, setBasicOpen] = useState(true);
  const [settingOpen, setSettingOpen] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });
  const originalData = useRef(null);

  const [errors, setErrors] = useState(null);

  const loadTestData = useCallback(async () => {
    try {
      const response = await getProductiveTestDetails(testId);

      if (!response.is_owner) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to edit this test',
          severity: 'error',
        });
        setTimeout(() => router.push('/teacher/upload-test/writing'), 1500);
        return;
      }

      if (response.status !== 'D' && response.status !== 'I') {
        setSnackbar({
          open: true,
          message: 'Only draft tests can be edited',
          severity: 'error',
        });
        setTimeout(() => router.push('/teacher/upload-test/writing'), 1500);
        return;
      }

      setTestStatus(response.status || '');

      setTestData({
        skill: 'W',
        testName: response.title,
        level: response.level,
        topics: response.productive_test.topic,
        format: reverseFormatMapper[response.productive_test.format] || '',
        descriptionInfo: response.description,
      });
      setSettings({
        skill: 'W',
        timeLimit: response.time,
        minWords: response.productive_test.min_word,
        score: response.completed_bonus,
      });

      // Fetch HTML content từ link Google Storage
      const desResponse = await fetch(response.productive_test.description);
      const htmlText = await desResponse.text();

      setQuestion({
        description: htmlText,
        suggestion: response.productive_test.glue_text,
        audio: response.productive_test.glue_resources?.audio,
      });

      originalData.current = {
        title: response.title,
        level: response.level,
        time: response.time,
        score: response.completed_bonus,
        topic: response.productive_test.topic,
        format: response.productive_test.format,
        suggestion: response.productive_test.glue_text,
        description: htmlText,
        descriptionInfo: response.description,
        min_word: response.productive_test.min_word,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fetch error:', error);
      setSnackbar({ open: true, message: 'Failed to load test data', severity: 'error' });
    }
  }, [testId]);

  useEffect(() => {
    if (testId) loadTestData();
  }, [loadTestData]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const canShowFeedback = !!testId;

  const handlePreviewToggle = () => {
    setShowPreview((prev) => {
      const next = !prev;
      if (next) {
        setShowFeedback(false);
      }
      return next;
    });
  };

  const handleFeedbackToggle = () => {
    if (!canShowFeedback) return;
    setShowFeedback((prev) => {
      const next = !prev;
      if (next) {
        setShowPreview(false);
      }
      return next;
    });
  };

  const handleSubmit = async (status) => {
    setIsSaving(true);
    try {
      const origin = originalData.current;
      if (!origin) return;
      const updatePayload = {};
      const productivePayload = {};

      if (testData.testName !== origin.title) updatePayload.title = testData.testName;
      if (testData.level !== origin.level) updatePayload.level = testData.level;
      if (parseInt(settings.timeLimit) !== origin.time)
        updatePayload.time = parseInt(settings.timeLimit);
      if (settings.score !== origin.score) updatePayload.completed_bonus = settings.score;

      if (testData.descriptionInfo !== origin.descriptionInfo) {
        updatePayload.description = testData.descriptionInfo;
      }
      const newStatus = status === 'Draft' ? 'D' : status === 'In review' ? 'I' : 'P';

      if (newStatus !== origin.status) {
        updatePayload.status = newStatus;
      }

      const isHtmlChanged = question.description !== origin.description;
      if (isHtmlChanged) {
        const newUrl = await uploadHtmlContent(question.description, testId);
        productivePayload.description = newUrl;
      }

      if (formatMapper[testData.format] !== origin.format)
        productivePayload.format = formatMapper[testData.format];
      if (testData.topics !== origin.topic) productivePayload.topic = testData.topics;
      if (question.suggestion !== origin.suggestion)
        productivePayload.glue_text = question.suggestion;
      if (parseInt(settings.minWords) !== origin.min_word)
        productivePayload.min_word = parseInt(settings.minWords);

      if (Object.keys(productivePayload).length > 0) {
        updatePayload.productive_test = productivePayload;
      }

      if (Object.keys(updatePayload).length > 0) {
        await updateProductiveTest(testId, updatePayload);

        setSnackbar({ open: true, message: 'Updated successfully!', severity: 'success' });
        setTimeout(() => {
          router.push(`/teacher`);
        }, 1000);
      } else {
        setSnackbar({ open: true, message: 'No changes detected', severity: 'info' });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Update error:', error);
      const errorMsg = parseApiError(error);
      setSnackbar({ open: true, message: `Failed to update test: ${errorMsg}`, severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProductiveTestEditor
      title="Update Writing Test"
      testData={testData}
      setTestData={setTestData}
      settings={settings}
      setSettings={setSettings}
      isSaving={isSaving}
      handleSubmit={handleSubmit}
      showPreview={showPreview}
      setShowPreview={setShowPreview}
      onPreview={handlePreviewToggle}
      onFeedback={canShowFeedback ? handleFeedbackToggle : undefined}
      isFeedbackActive={showFeedback}
      feedbackContent={<FeedbackPanel testId={testId} compact readOnly />}
      basicOpen={basicOpen}
      setBasicOpen={setBasicOpen}
      settingOpen={settingOpen}
      setSettingOpen={setSettingOpen}
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      isReadOnly={isReadOnly}
      onEditClick={undefined}
      onCancelClick={undefined}
      previewContent={
        <ProductivePreview
          title={testData.testName}
          description={question.description}
          suggestion={question.suggestion}
          audio={question.audio}
          isReadOnly={isReadOnly}
          preview={false}
          handleSubmit={async (status) => {
            await handleSubmit(status);
          }}
        />
      }
      errors={errors}
    >
      <ProductiveEditor
        readOnly={isReadOnly}
        question={question}
        onChange={(field, value) => setQuestion((p) => ({ ...p, [field]: value }))}
      />
    </ProductiveTestEditor>
  );
}
