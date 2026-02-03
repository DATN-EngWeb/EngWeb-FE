'use client';

import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  Button,
} from '@mui/material';

import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

import TestEditorHeader from '../UploadTest/TestEditorHeader';
import TestEditorActions from '../UploadTest/TestEditorActions';
import BasicInformation from './BasicInformation';
import TestSettingComponent from './TestSetting';
import * as styles from '../../styles/Teacher/productive/ProductiveStyles';

export default function ProductiveTestEditor({
  title,
  testData,
  setTestData,
  settings,
  setSettings,
  isSaving,
  handleSubmit,
  showPreview,
  setShowPreview,
  basicOpen,
  setBasicOpen,
  settingOpen,
  setSettingOpen,
  snackbar,
  setSnackbar,
  children,
  previewContent,
  errors,
}) {
  return (
    <Box sx={{ ...styles.container, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ filter: isSaving ? 'blur(2px)' : 'none' }}>
        <TestEditorHeader title={title} description="Fill in the details below" />
        <TestEditorActions
          onPreview={() => setShowPreview(!showPreview)}
          isPreviewActive={showPreview}
          onSaveDraft={() => handleSubmit('Draft')}
          onSendReview={() => handleSubmit('In review')}
          onPublish={() => handleSubmit('Published')}
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
                  onChange={(field, value) => setTestData((prev) => ({ ...prev, [field]: value }))}
                  errors={errors?.testData}
                />
              )}

              {settingOpen && (
                <TestSettingComponent
                  {...settings}
                  onChange={(field, value) => setSettings((prev) => ({ ...prev, [field]: value }))}
                  errors={errors?.settings}
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
              {children}
            </Box>
          </Panel>

          {showPreview && (
            <PanelResizeHandle
              style={{
                width: '0.5px',
                backgroundColor: 'primary.contrastText',
                cursor: 'col-resize',
                marginRight: '15px',
              }}
            />
          )}
          {showPreview && (
            <Panel defaultSize={50} minSize={20}>
              {previewContent}
            </Panel>
          )}
        </PanelGroup>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Backdrop sx={{ color: 'primary.contrastText', zIndex: 1100 }} open={isSaving}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
