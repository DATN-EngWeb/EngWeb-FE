'use client';

import { Paper, Typography, Box, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

import TestEditorHeader from '../UploadTest/TestEditorHeader';
import TestEditorActions from '../UploadTest/TestEditorActions';
import BasicInformation from './BasicInformation';
import TestSettingComponent from './TestSetting';
import * as styles from '../../styles/Teacher/writing/WritingStyles';
import ClientSideCustomEditor from '../Editor/ClientSideCustomEditor';
import SignpostIcon from '@mui/icons-material/Signpost';
import { Button, Collapse } from '@mui/material';

export default function WritingTestEditor() {
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [basicOpen, setBasicOpen] = useState(true);
  const [settingOpen, setSettingOpen] = useState(true);

  const [testData, setTestData] = useState({
    testName: '',
    level: 'A2',
    topics: 'General',
    format: 'essay',
  });

  const [settings, setSettings] = useState({
    timeLimit: 30,
    minWords: 200,
    score: 10,
  });

  const [questions, setQuestions] = useState([{ id: 'Q1', description: '', suggestion: '' }]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuestionChange = (id, field, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  if (!mounted) return null;

  return (
    <Box sx={{ ...styles.container, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ filter: isSaving ? 'blur(2px)' : 'none' }}>
        <TestEditorHeader title="Create New Writing Test" description="Fill in the details below" />
        <TestEditorActions
          onPreview={() => setShowPreview(!showPreview)}
          isPreviewActive={showPreview}
          onSaveDraft={() => {}}
          onSendReview={() => {}}
          onPublish={() => {}}
        />
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 2, bgcolor: 'primary.contrastText' }}>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={20}>
            <Box sx={{ height: '100%', overflowY: 'auto', pr: 2 }}>
              <Typography variant="h5" sx={styles.SECTION_TITLE_STYLE}>
                Test editor
              </Typography>

              {basicOpen && (
                <BasicInformation
                  {...testData}
                  onChange={(field, val) => setTestData((prev) => ({ ...prev, [field]: val }))}
                />
              )}

              {settingOpen && (
                <TestSettingComponent
                  {...settings}
                  onChange={(field, val) => setSettings((prev) => ({ ...prev, [field]: val }))}
                />
              )}

              {(!basicOpen || !settingOpen) && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mb: 2,
                    position: 'sticky',
                    top: 0,
                    zIndex: 5,
                    bgcolor: 'background.paper',
                    py: 1,
                  }}
                >
                  {!basicOpen && (
                    <Button size="small" variant="outlined" onClick={() => setBasicOpen(true)}>
                      Basic Info
                    </Button>
                  )}

                  {!settingOpen && (
                    <Button size="small" variant="outlined" onClick={() => setSettingOpen(true)}>
                      Test Settings
                    </Button>
                  )}
                </Box>
              )}

              {questions.map((question) => (
                <Paper key={question.id} sx={{ ...styles.panelPaper, mb: 3 }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', flex: 1, marginBottom: '16px' }}
                  >
                    <Box sx={styles.accentBar} />
                    <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
                      Question Content
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      Description test <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Box className="editor-container">
                      <ClientSideCustomEditor
                        data={question.description}
                        onChange={(data) => handleQuestionChange(question.id, 'description', data)}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      Suggestion (Optional)
                    </Typography>
                    <Box className="editor-container">
                      <ClientSideCustomEditor
                        data={question.suggestion}
                        onChange={(data) => handleQuestionChange(question.id, 'suggestion', data)}
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Panel>

          {showPreview && (
            <PanelResizeHandle
              style={{
                width: '1px',
                backgroundColor: 'primary.contrastText',
                cursor: 'col-resize',
                transition: 'background-color 0.2s',
                marginRight: '15px',
              }}
            />
          )}

          {showPreview && (
            <Panel defaultSize={50} minSize={20}>
              <Box sx={styles.STICKY_PREVIEW_WRAPPER}>
                <Typography variant="h5" sx={styles.SECTION_TITLE_STYLE}>
                  Preview
                </Typography>
                <Paper sx={styles.PREVIEW_PAPER_STYLE}>
                  <Typography variant="h5" align="center" fontWeight={700}>
                    {testData.testName || 'Writing Test Title'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <Box
                    className="ck-content"
                    dangerouslySetInnerHTML={{
                      __html:
                        questions[0].description && questions[0].description !== '<p></p>'
                          ? questions[0].description
                          : `<p style="color: #a0a0a0; font-style: italic;">Typing your test...</p>`,
                    }}
                    sx={{
                      minHeight: '100px',
                      '& p': {
                        margin: 0,
                      },
                    }}
                  />

                  {questions[0].suggestion && (
                    <Box sx={{ mt: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<SignpostIcon />}
                          onClick={() => setShowSuggestion(!showSuggestion)}
                          sx={{
                            mb: 1,
                            ml: 'auto',
                            borderRadius: '20px',
                            textTransform: 'none',

                            ...(showSuggestion && {
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              '&:hover': {
                                bgcolor: 'primary.light',
                              },
                            }),
                          }}
                        >
                          {showSuggestion ? 'Hide Suggestion' : 'View Suggestion'}
                        </Button>
                      </Box>

                      <Collapse in={showSuggestion}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: 'warning.pastel',
                            borderRadius: '8px',
                            borderColor: `1px solid ${'warning.main'}`,
                            mt: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ mb: 1, fontWeight: 700, color: 'secondary.main' }}
                          >
                            💡 Suggestion
                          </Typography>
                          <Box
                            className="ck-content"
                            dangerouslySetInnerHTML={{ __html: questions[0].suggestion }}
                            sx={{ minHeight: '50px', fontSize: '0.9rem' }}
                          />
                        </Box>
                      </Collapse>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Panel>
          )}
        </PanelGroup>
      </Box>
    </Box>
  );
}
