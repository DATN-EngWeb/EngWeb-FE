/* global fetch */
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductiveTestEditor from './../Writing-Speaking/ProductiveTestEditor';
import ProductiveEditor from './../Writing-Speaking/ProductiveEditor';
import ProductivePreview from './../Writing-Speaking/ProductivePreview';
import FeedbackPanel from '../Teacher/Feedback/FeedbackPanel';
import { updateProductiveTest, getProductiveTestDetails } from '../../api/test';
import { uploadHtmlContent, uploadMediaFile } from '../../utils/uploadHelpers';
import { parseApiError } from '../../utils/productiveTestValidation';

export default function UpdateSpeakingTestEditor() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const reverseFormatMapper = {
    G: 'Narrative',
    H: 'Description',
    I: 'Social Argument',
    J: 'Reading Aloud',
  };
  const formatMapper = {
    Narrative: 'G',
    Description: 'H',
    'Social Argument': 'I',
    'Reading Aloud': 'J',
  };

  const { test_id: testId } = useParams();
  const [isReadOnly] = useState(false);

  const [testData, setTestData] = useState({
    skill: 'S',
    testName: '',
    level: '',
    topics: '',
    format: '',
    descriptionInfo: '',
  });
  const [settings, setSettings] = useState({
    skill: 'S',
    timeLimit: 30,
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
        setTimeout(() => router.push('/teacher/upload-test/speaking'), 1500);
        return;
      }

      if (response.status !== 'D' && response.status !== 'I') {
        setSnackbar({
          open: true,
          message: 'Only draft tests can be edited',
          severity: 'error',
        });
        setTimeout(() => router.push('/teacher/upload-test/speaking'), 1500);
        return;
      }

      setTestStatus(response.status || '');

      setTestData({
        skill: 'S',
        testName: response.title,
        level: response.level,
        topics: response.productive_test.topic,
        format: reverseFormatMapper[response.productive_test.format] || '',
        descriptionInfo: response.description || '',
      });
      setSettings({
        skill: 'S',
        timeLimit: response.time,
        score: response.completed_bonus,
      });

      // Fetch HTML content từ link Google Storage
      const desResponse = await fetch(response.productive_test.description);
      const htmlText = await desResponse.text();

      const audioUrlFromServer = response.productive_test.glue_resources?.audio;

      setQuestion({
        description: htmlText,
        suggestion: response.productive_test.glue_text,
        audio: audioUrlFromServer ? { url: audioUrlFromServer, file: { name: 'Audio.mp3' } } : null,
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
        audioUrl: audioUrlFromServer,
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

      let finalAudioUrl = origin.audioUrl;
      let audioChanged = false;

      if (question.audio && question.audio.file instanceof File) {
        const uploadedUrl = await uploadMediaFile(question.audio.file, testId);
        finalAudioUrl = uploadedUrl;
        audioChanged = true;
      } else if (question.audio === null && origin.audioUrl !== null) {
        finalAudioUrl = null;
        audioChanged = true;
      }
      if (audioChanged) {
        productivePayload.glue_resources = {
          ...productivePayload.glue_resources,
          audio: finalAudioUrl,
        };
      }

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
      title="Update Speaking Test"
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
      showTestSettings={false}
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
          isReadOnly={isReadOnly}
          audio={question.audio?.url}
          preview={false}
          handleSubmit={async (status) => {
            await handleSubmit(status);
          }}
        />
      }
      errors={errors}
    >
      <ProductiveEditor
        isReadOnly={isReadOnly}
        question={question}
        showAudio={true}
        onChange={(field, value) => {
          setQuestion((p) => ({ ...p, [field]: value }));
        }}
      />
    </ProductiveTestEditor>
  );
}
