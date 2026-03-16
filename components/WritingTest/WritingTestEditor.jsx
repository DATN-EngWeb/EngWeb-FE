'use client';
import { useState, useEffect } from 'react';
import ProductiveTestEditor from './../Writing-Speaking/ProductiveTestEditor';
import ProductiveEditor from './../Writing-Speaking/ProductiveEditor';
import ProductivePreview from './../Writing-Speaking/ProductivePreview';
import { createTest, submitProductiveTest } from '../../api/test';
import { uploadHtmlContent } from '../../utils/uploadHelpers';
import { useRouter } from 'next/navigation';

export default function WritingTestEditor() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [testData, setTestData] = useState({
    skill: 'W',
    testName: '',
    level: '',
    topics: '',
    format: '',
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
  const [showPreview, setShowPreview] = useState(true);
  const [basicOpen, setBasicOpen] = useState(true);
  const [settingOpen, setSettingOpen] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  const [errors, setErrors] = useState(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleSubmit = async (status) => {
    setIsSaving(true);

    try {
      const basicInfo = {
        title: testData.testName,
        level: testData.level,
        type: 'P',
        skill: 'W',
        status: status === 'Draft' ? 'D' : status === 'In review' ? 'I' : 'P',
        time: parseInt(settings.timeLimit),
        completed_bonus: settings.score,
        description: 'Writing test',
      };

      const res = await createTest(basicInfo);
      const contentUrl = await uploadHtmlContent(question.description, res.id);

      const formatMapper = {
        Email: 'A',
        Article: 'B',
        Story: 'C',
        Essay: 'D',
        Letter: 'E',
        Reviews: 'F',
      };

      const detailedData = {
        format: formatMapper[testData.format] || 'E',
        topic: testData.topics,
        description: contentUrl,
        min_word: parseInt(settings.minWords),
        glue_text: question.suggestion,
        glue_resources: {
          image: null,
          audio: null,
        },
      };

      await submitProductiveTest({ testId: res.id, data: detailedData });
      setSnackbar({ open: true, message: 'Test submitted successfully', severity: 'success' });
      setIsSaving(false);
      setTestData({ skill: 'W', testName: '', level: '', topics: '', format: '' });
      setSettings({ skill: 'W', timeLimit: 30, minWords: 100, score: 10 });
      setQuestion({ description: '', suggestion: '', audio: null });
      setErrors(null);
      setIsSaving(false);
      setTimeout(() => {
        router.push(`/teacher`);
      }, 1000);
    } catch (error) {
      setSnackbar({ open: true, message: `Submit failed: ${error.message}`, severity: 'error' });
      setIsSaving(false);
    }
  };

  return (
    <ProductiveTestEditor
      title="Create New Writing Test"
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
          audio={question.audio}
        />
      }
      errors={errors}
    >
      <ProductiveEditor
        question={question}
        onChange={(field, value) => setQuestion((p) => ({ ...p, [field]: value }))}
      />
    </ProductiveTestEditor>
  );
}
