'use client';
import { useState, useEffect } from 'react';
import ProductiveTestEditor from './../Writing-Speaking/ProductiveTestEditor';
import ProductiveEditor from './../Writing-Speaking/ProductiveEditor';
import ProductivePreview from './../Writing-Speaking/ProductivePreview';
import { createTest, submitProductiveTest } from '../../api/test';
import { uploadHtmlContent, uploadMediaFile } from '../../utils/uploadHelpers';

export default function SpeakingTestEditor() {
  const [mounted, setMounted] = useState(false);
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
    minWords: 100,
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
  const [errors, setErrors] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleSubmit = async (status) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const basicInfo = {
        title: testData.testName,
        level: testData.level,
        type: 'P',
        skill: 'S',
        status: status === 'Draft' ? 'D' : status === 'In review' ? 'I' : 'P',
        time: parseInt(settings.timeLimit),
        completed_bonus: settings.score,
        description: 'Speaking test',
      };

      const res = await createTest(basicInfo, token);
      const contentUrl = await uploadHtmlContent(question.description, res.id, token);
      const audioUrl = question.audio?.file
        ? await uploadMediaFile(question.audio.file, res.id, token)
        : null;

      const formatMapper = {
        Narrative: 'G',
        Description: 'H',
        'Social Argument': 'I',
        'Reading Aloud': 'J',
      };

      const detailedData = {
        format: formatMapper[testData.format] || 'A',
        topic: testData.topics,
        description: contentUrl,
        min_word: 0,
        glue_text: question.suggestion,
        glue_resources: {
          image: null,
          audio: audioUrl || null,
        },
      };

      await submitProductiveTest({ testId: res.id, data: detailedData, token });
      setSnackbar({ open: true, message: 'Test submitted successfully', severity: 'success' });
      setIsSaving(false);
      setTestData({ skill: 'S', testName: '', level: '', topics: '', format: '' });
      setSettings({ timeLimit: 30, minWords: 200, score: 10 });
      setQuestion({ description: '', suggestion: '', audio: null });
      setErrors(null);
      setIsSaving(false);
    } catch (error) {
      setSnackbar({ open: true, message: `Submit failed: ${error.message}`, severity: 'error' });
      setIsSaving(false);
    }
  };

  return (
    <ProductiveTestEditor
      title="Create New Speaking Test"
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
      previewContent={
        <ProductivePreview
          title={testData.testName}
          description={question.description}
          suggestion={question.suggestion}
          audio={question.audio?.url}
        />
      }
      errors={errors}
    >
      <ProductiveEditor
        question={question}
        onChange={(field, value) => setQuestion((p) => ({ ...p, [field]: value }))}
        showAudio={true}
      />
    </ProductiveTestEditor>
  );
}
