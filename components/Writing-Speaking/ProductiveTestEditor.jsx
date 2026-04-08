'use client';

import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Divider,
  LinearProgress,
  TextField,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import TimerIcon from '@mui/icons-material/Timer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

import TestEditorHeader from '../UploadTest/TestEditorHeader';
import TestEditorActions from '../UploadTest/TestEditorActions';
import BasicInformation from './BasicInformation';
import TestSettingComponent from './TestSetting';
import * as styles from '../../styles/Teacher/productive/ProductiveStyles';

const levelTheme = {
  A1: { border: '#2ecc71', text: '#2ecc71', bg: '#f0fff4' },
  A2: { border: '#3498db', text: '#3498db', bg: '#ebf5fb' },
  B1: { border: '#f39c12', text: '#f39c12', bg: '#fef5e7' },
  B2: { border: '#e74c3c', text: '#e74c3c', bg: '#fdedec' },
};

const formatMapper = {
  A: 'Writing an email',
  B: 'Writing an article',
  C: 'Story based on picture',
  D: 'Writing an essay',
  E: 'Writing a letter',
  F: 'Writing a review',
  G: 'Narrative Speaking',
  H: 'Picture Description',
  I: 'Social Argument',
  J: 'Reading Aloud',
};

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

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
  isReadOnly,
  onEditClick,
  onCancelClick,
}) {
  return (
    <Box sx={{ ...styles.container, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ filter: isSaving ? 'blur(2px)' : 'none' }}>
        <TestEditorHeader title={title} description="Fill in the details below" />

        {isReadOnly ? (
          <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onEditClick}
              sx={{ borderRadius: '12px', textTransform: 'none', px: 4 }}
            >
              Edit Test Content
            </Button>
          </Box>
        ) : (
          <>
            {/* If editing, show the old Actions bar or Save/Cancel buttons */}
            <TestEditorActions
              onCancelClick={onCancelClick}
              onPreview={() => setShowPreview(!showPreview)}
              isPreviewActive={showPreview}
              onSaveDraft={() => handleSubmit('Draft')}
              onSendReview={() => handleSubmit('In review')}
              onPublish={() => handleSubmit('Published')}
            />
          </>
        )}
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          p: 2,
          bgcolor: 'primary.contrastText',
          borderRadius: '2rem',
          pointerEvents: isSaving ? 'none' : 'auto',
        }}
      >
        {/* Commented out resizable panels as per request */}
        {/* <PanelGroup direction="horizontal">
          <Panel defaultSize={40} minSize={20}> */}
        <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
          <Box
            sx={{
              width: '40%',
              height: '100%',
              overflowY: 'auto',
              pr: 2,
              ...(isReadOnly && {
                '& .MuiInputBase-root': { pointerEvents: 'none' },
                '& .ck-editor': { pointerEvents: 'none', opacity: 0.8 },
              }),
            }}
          >
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
          </Box>
          {/* </Panel>

          <PanelResizeHandle
            style={{
              width: '0.5px',
              backgroundColor: 'primary.contrastText',
              cursor: 'col-resize',
              marginRight: '15px',
            }}
          />

          <Panel defaultSize={60} minSize={30}> */}
          <Box
            sx={{
              width: '60%',
              height: '100%',
              overflowY: 'auto',
              pl: 1,
              ...(isReadOnly && {
                '& .MuiInputBase-root': { pointerEvents: 'none' },
                '& .ck-editor': { pointerEvents: 'none', opacity: 0.8 },
              }),
            }}
          >
            {children}
          </Box>
        </Box>
        {/* </Panel>
        </PanelGroup> */}
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

      {/* --- Preview Dialog --- */}
      <Dialog
        fullScreen
        open={showPreview}
        onClose={() => setShowPreview(false)}
        sx={{ zIndex: 1301 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f5f5f5' }}>
          {/* Student Header Replica */}
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2, md: 8 },
              py: 2,
              bgcolor: 'white',
              borderBottom: '1px solid #eee',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <Stack direction="row" alignItems="center">
              <Box>
                <Stack direction="row" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#4e342e' }}>
                    {testData.testName || 'Practice Test Name'}
                  </Typography>
                  {testData.level && (
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: '8px',
                        border: `1px solid`,
                        borderColor: levelTheme[testData.level]?.border || '#ddd',
                        color: levelTheme[testData.level]?.text || '#666',
                        bgcolor: levelTheme[testData.level]?.bg || '#f9f9f9',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        ml: 2,
                      }}
                    >
                      Level {testData.level}
                    </Box>
                  )}
                </Stack>
                <Stack
                  direction="row"
                  spacing={3}
                  alignItems="center"
                  sx={{ mt: 1 }}
                  divider={
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        bgcolor: '#ff7043',
                        borderRadius: '50%',
                        opacity: 0.5,
                      }}
                    />
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#666' }}>
                    <HistoryEduIcon />
                    <Typography variant="body2">
                      {formatMapper[testData.format] || 'General Task'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#666' }}>
                    <TimerIcon />
                    <Typography variant="body2">{testData.timeLimit || 0} mins</Typography>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setShowPreview(false)}
                    sx={{ textTransform: 'none', ml: 2, fontWeight: 700 }}
                    startIcon={<CloseIcon />}
                  >
                    Exit Preview
                  </Button>
                </Stack>
              </Box>
            </Stack>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#5d4037',
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 28 }} />
              <Typography variant="inherit">{formatTime(0)}</Typography>
            </Box>
          </Box>

          {/* Main Content Areas */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 3 }}>
            <PanelGroup direction="horizontal">
              {/* Left Panel: Test Content */}
              <Panel defaultSize={50} minSize={30}>
                <Box sx={{ height: '100%', overflowY: 'auto', pr: 2 }}>{previewContent}</Box>
              </Panel>

              <PanelResizeHandle
                style={{
                  width: '8px',
                  cursor: 'col-resize',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  margin: '0 8px',
                }}
              />

              {/* Right Panel: Placeholder Interaction Area */}
              <Panel defaultSize={50} minSize={30}>
                <Box sx={{ height: '100%', overflowY: 'auto', pl: 2 }}>
                  {testData.format >= 'G' ? (
                    /* Speaking Placeholder */
                    <Box
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '16px',
                        p: 3,
                        height: '100%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          border: '1px solid #ffe0b2',
                          borderRadius: '12px',
                          bgcolor: '#fffdf9',
                          mb: 3,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                        >
                          <InfoOutlinedIcon fontSize="small" /> Instruction
                        </Typography>
                        <Typography variant="caption">
                          You will have {testData.timeLimit} minutes to complete this speaking test.
                          Please speak clearly into the microphone.
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                          Ready to record
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                          Example of how it will look to student
                        </Typography>
                        <IconButton
                          disabled
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: '#f44336',
                            color: 'white',
                            opacity: 0.6,
                          }}
                        >
                          <MicIcon sx={{ fontSize: 40 }} />
                        </IconButton>
                        <Typography variant="h3" sx={{ mt: 4, fontFamily: 'monospace' }}>
                          00:00
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled
                        sx={{
                          py: 1.5,
                          borderRadius: '12px',
                          bgcolor: '#eceff1',
                          textTransform: 'none',
                        }}
                      >
                        Submit test
                      </Button>
                    </Box>
                  ) : (
                    /* Writing Placeholder */
                    <Box sx={{ height: '100%' }}>
                      <Button
                        variant="contained"
                        disabled
                        sx={{
                          bgcolor: '#e0d5d0',
                          color: '#666',
                          mb: 2,
                          textTransform: 'none',
                          borderRadius: '10px',
                          width: '200px',
                        }}
                      >
                        <AssignmentOutlinedIcon sx={{ mr: 1 }} /> Note/Outline
                      </Button>
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          border: '1px solid #eee',
                          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={0}
                            sx={{ flexGrow: 1, height: 10, borderRadius: 5, bgcolor: '#eee' }}
                          />
                          <Typography variant="body2" fontWeight={700}>
                            0 words
                          </Typography>
                        </Stack>
                        <TextField
                          multiline
                          fullWidth
                          rows={12}
                          placeholder="Student will type here..."
                          disabled
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              bgcolor: '#fcfcfc',
                            },
                          }}
                        />
                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled
                            startIcon={<EditNoteIcon />}
                            sx={{ bgcolor: '#eceff1', borderRadius: '8px' }}
                          >
                            Save Draft
                          </Button>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled
                            startIcon={<SendIcon />}
                            sx={{ bgcolor: '#eceff1', borderRadius: '8px' }}
                          >
                            Submit
                          </Button>
                        </Stack>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Panel>
            </PanelGroup>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
