/* global fetch */
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import ProductiveTestEditor from './../Writing-Speaking/ProductiveTestEditor';
import ProductiveEditor from './../Writing-Speaking/ProductiveEditor';
import ProductivePreview from './../Writing-Speaking/ProductivePreview';
import { updateProductiveTest, getProductiveTestDetails } from '../../api/test';
import { uploadHtmlContent, uploadMediaFile } from '../../utils/uploadHelpers';

export default function UpdateSpeakingTestEditor() {
  const [mounted, setMounted] = useState(false);

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
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);

  const [testData, setTestData] = useState({
    skill: 'S',
    testName: '',
    level: '',
    topics: '',
    format: '',
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
  const [showPreview, setShowPreview] = useState(true);
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
      const token = localStorage.getItem('accessToken');
      const response = await getProductiveTestDetails(testId, token);

      setTestData({
        skill: 'S',
        testName: response.title,
        level: response.level,
        topics: response.productive_test.topic,
        format: reverseFormatMapper[response.productive_test.format] || '',
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
        audioUrl: audioUrlFromServer,
      };
    } catch (error) {
      console.error('Fetch error:', error);
      setSnackbar({ open: true, message: 'Failed to load test data', severity: 'error' });
    }
  }, [testId]);

  useEffect(() => {
    if (testId) loadTestData();
  }, [loadTestData]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleSubmit = async (status) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const origin = originalData.current;
      if (!origin) return;
      const updatePayload = {};
      const productivePayload = {};

      if (testData.testName !== origin.title) updatePayload.title = testData.testName;
      if (testData.level !== origin.level) updatePayload.level = testData.level;
      if (parseInt(settings.timeLimit) !== origin.time)
        updatePayload.time = parseInt(settings.timeLimit);
      if (settings.score !== origin.score) updatePayload.completed_bonus = settings.score;

      const newStatus = status === 'Draft' ? 'D' : status === 'In review' ? 'I' : 'P';

      if (newStatus !== origin.status) {
        updatePayload.status = newStatus;
      }

      const isHtmlChanged = question.description !== origin.description;
      if (isHtmlChanged) {
        const newUrl = await uploadHtmlContent(question.description, testId, token);
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
        const uploadedUrl = await uploadMediaFile(question.audio.file, testId, token);
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
        await updateProductiveTest(testId, updatePayload, token);

        setSnackbar({ open: true, message: 'Updated successfully!', severity: 'success' });
        await loadTestData();
      } else {
        setSnackbar({ open: true, message: 'No changes detected', severity: 'info' });
      }

      setIsReadOnly(true);
    } catch (error) {
      console.error('Update error:', error);
      setSnackbar({ open: true, message: 'Failed to update test', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProductiveTestEditor
      title=" View Speaking Test"
      testData={testData}
      setTestData={setTestData}
      settings={settings}
      setSettings={setSettings}
      isSaving={isSaving}
      handleSubmit={handleSubmit}
      showPreview={showPreview}
      setShowPreview={setShowPreview}
      basicOpen={basicOpen}
      setBasicOpen={setBasicOpen}
      settingOpen={settingOpen}
      setSettingOpen={setSettingOpen}
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      isReadOnly={isReadOnly}
      onEditClick={() => {
        setIsReadOnly(false);
        setIsCanceling(false);
      }}
      onCancelClick={() => {
        setIsReadOnly(true);
        setIsCanceling(true);
      }}
      previewContent={
        <ProductivePreview
          title={testData.testName}
          description={question.description}
          suggestion={question.suggestion}
          isReadOnly={isReadOnly}
          audio={question.audio?.url}
          onEditClick={() => {
            setIsReadOnly(false);
            setIsCanceling(false);
          }}
          onCancelClick={() => {
            setIsReadOnly(true);
            setIsCanceling(true);
          }}
          handleSubmit={async (status) => {
            await handleSubmit(status);
            setIsReadOnly(true);
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
          if (!isReadOnly) {
            setQuestion((p) => ({ ...p, [field]: value }));
          }
        }}
      />
    </ProductiveTestEditor>
  );
}
