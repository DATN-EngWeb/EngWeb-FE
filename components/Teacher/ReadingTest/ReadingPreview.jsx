'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FillBlanksContent from '../../Reading/FillBlanks/FillBlanksContent';
import MatchingContent from '../../Reading/Matching/MatchingContent';
import MultiChoiceContent from '../../Reading/MultiChoice/MultiChoiceContent';
import { getPresignedUrl, uploadToObjectStorage, confirmUpload } from '../../../api/test';
import { generateAIReadingFeedback } from '../../../api/feedback';

const HiddenReviewContent = React.forwardRef(({ testData, captureTargetRef }, ref) => (
  <Box
    ref={ref}
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '794px',
      bgcolor: '#fff',
      color: '#111',
      p: 2,
      opacity: 0,
      pointerEvents: 'none',
      zIndex: -1,
    }}
  >
    <div ref={captureTargetRef}>
      <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 700 }}>
        {testData.title || 'Reading Test'}
      </Typography>

      {(testData.parts || []).map((part, index) => (
        <Box
          key={index}
          sx={{
            mb: 3,
            pageBreakAfter: 'always',
            '&:last-child': { pageBreakAfter: 'auto' },
            '& p': { m: 0, p: 0 },
          }}
        >
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
            Part {index + 1}
          </Typography>

          <Box sx={{ mb: 2, lineHeight: 1.7, fontSize: '1rem' }}>
            <div dangerouslySetInnerHTML={{ __html: part.content || '' }} />
          </Box>

          {(part.questions || []).map((q, qIndex) => (
            <Box key={qIndex} sx={{ mb: 1.5, pageBreakInside: 'avoid' }}>
              <Box sx={{ display: 'flex', gap: 1, fontWeight: 600 }}>
                <Typography sx={{ fontWeight: 600 }}>{q.question_number}.</Typography>
                <div
                  dangerouslySetInnerHTML={{ __html: q.content || `Question ${q.question_number}` }}
                />
              </Box>
              <Box sx={{ ml: 3, mt: 0.5 }}>
                {(q.answers || []).map((ans, aIndex) => (
                  <Box key={aIndex} sx={{ display: 'flex', gap: 1, mb: 0.25 }}>
                    <Typography variant="body2">{ans.option_label}.</Typography>
                    <Typography variant="body2">{ans.answer_text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </div>
  </Box>
));

HiddenReviewContent.displayName = 'HiddenReviewContent';

const PrintView = ({ testData }) => (
  <Box
    sx={{
      display: 'none',
      '@media print': {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        bgcolor: 'white',
        zIndex: 9999,
      },
      p: 0,
    }}
  >
    <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 700, color: '#000' }}>
      {testData.title || 'Reading Test'}
    </Typography>

    {testData.parts?.map((part, index) => (
      <Box
        key={index}
        sx={{
          mb: index === testData.parts.length - 1 ? 0 : 6,
          pageBreakAfter: 'always',
          '&:last-child': { pageBreakAfter: 'auto' },
          '& p': { margin: 0, padding: 0 }, // Remove <p> tag spacing
        }}
      >
        <Box
          sx={{
            mb: 4,
            lineHeight: 1.8,
            fontSize: '1.2rem',
            textAlign: 'justify',
            p: 0,
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: part.content || '' }} />
        </Box>

        <Box sx={{ mt: 4 }}>
          {part.questions?.map((q, qIndex) => (
            <Box key={qIndex} sx={{ mb: 3, pageBreakInside: 'avoid' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>{q.question_number}.</Typography>
                <div
                  style={{ fontWeight: 600 }}
                  dangerouslySetInnerHTML={{ __html: q.content || `Question ${q.question_number}` }}
                />
              </Box>
              <Box sx={{ ml: 4, mt: 1 }}>
                {q.answers?.map((ans, aIndex) => (
                  <Box key={aIndex} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2">{ans.option_label}.</Typography>
                    <Typography variant="body2">{ans.answer_text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    ))}
  </Box>
);

const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;

const ReadingPreview = ({ open, onClose, testData, inline = false }) => {
  const router = useRouter();
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, severity: 'info', message: '' });
  const hiddenReviewRef = useRef(null);
  const captureRef = useRef(null);

  const parts = testData?.parts || [];
  const partTitles = parts.map((_part, index) => `Part ${index + 1}`);

  const currentPart = parts[currentPartIndex];

  const handlePartChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < parts.length) {
      setCurrentPartIndex(newIndex);
    }
  };

  const [statusAlert, setStatusAlert] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);

  const showToast = (severity, message) => {
    setToast({ open: true, severity, message });
  };

  const handleAIReview = async () => {
    const status = testData?.test?.status || testData?.status;
    const testId = testData?.test?.id || testData?.id;

    // Chỉ cho phép AI Review khi test đang In Review (I) và đã lưu trên server
    const canReview = status === 'I' && testId;

    if (!canReview) {
      if (inline) {
        showToast('warning', 'This test must be In Review before you can request AI Review.');
      } else {
        setStatusAlert(true);
      }
      return;
    }

    try {
      setReviewLoading(true);

      if (!captureRef.current) {
        throw new Error('Review content is not ready for PDF generation.');
      }

      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const pdfBlob = await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `reading-review-${testId}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(captureRef.current)
        .outputPdf('blob');

      if (!pdfBlob?.size || pdfBlob.size > MAX_PDF_SIZE_BYTES) {
        throw new Error('Generated PDF is empty or exceeds 50MB.');
      }

      const fileName = `reading-review-${testId}-${Date.now()}.pdf`;
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      const presign = await getPresignedUrl({
        filename: pdfFile.name,
        fileSize: pdfFile.size,
        mimeType: pdfFile.type,
        category: 'tests',
        testId,
      });

      const { etag } = await uploadToObjectStorage({
        url: presign.url,
        mimeType: pdfFile.type,
        file: pdfFile,
      });

      const confirm = await confirmUpload({
        key: presign.key,
        fileSize: pdfFile.size,
        mimeType: pdfFile.type,
        etag,
      });

      const fileUrl = confirm?.file_url || '';
      const gcsHttpPrefix = 'https://storage.googleapis.com/';
      if (!fileUrl.startsWith(gcsHttpPrefix)) {
        throw new Error('Uploaded file URL is invalid. Expected Google Cloud Storage URL.');
      }

      const gcsPath = fileUrl.slice(gcsHttpPrefix.length);
      const separatorIndex = gcsPath.indexOf('/');
      if (separatorIndex <= 0 || separatorIndex === gcsPath.length - 1) {
        throw new Error('Uploaded file URL format is invalid.');
      }

      const bucket = gcsPath.slice(0, separatorIndex);
      const objectKey = gcsPath.slice(separatorIndex + 1);
      const pdfGcsUri = `gs://${bucket}/${objectKey}`;

      await generateAIReadingFeedback({
        test_id: Number(testId),
        pdf_gcs_uri: pdfGcsUri,
      });

      setSuccessPopupOpen(true);
    } catch (error) {
      showToast('error', error?.message || 'Failed to generate AI review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const transformedData = useMemo(() => {
    if (!currentPart) return null;

    const commonProps = {
      testName: testData?.test?.title || testData?.title || 'Preview Test',
      parts: partTitles,
      currentPart: currentPartIndex + 1,
      passage: currentPart.content || '',
      passageTitle: currentPart.description || '',
      onPartChange: handlePartChange,
      isTeacher: true,
      onBack: () => handlePartChange(currentPartIndex - 1),
      onNext: () => handlePartChange(currentPartIndex + 1),
      currentSection: currentPartIndex + 1,
      totalSections: parts.length,
      onAIReview: reviewLoading ? undefined : handleAIReview,
      onExit: onClose,
      embedded: inline,
    };

    switch (currentPart.format) {
      case 'F': // Multiple Choice Short
      case 'G': // Multiple Choice Long
        return {
          component: MultiChoiceContent,
          props: {
            ...commonProps,
            questions: currentPart.questions.map((q) => ({
              id: q.id,
              question: q.content || `Question ${q.question_number}`,
              options: q.answers.map((a) => ({
                value: String(a.id || a.option_label),
                label: `${a.option_label}. ${a.answer_text}`,
              })),
            })),
          },
        };

      case 'I': // Fill Blanks Text
      case 'H': // Fill Blanks Choice
        return {
          component: FillBlanksContent,
          props: {
            ...commonProps,
            blanks: currentPart.questions.map((q) => q.question_number).sort((a, b) => a - b),
            questions: currentPart.questions.map((q) => ({
              id: q.id,
              question_number: q.question_number,
              question: q.content || `Question ${q.question_number}`,
              options: q.answers.map((a) => ({
                value: String(a.id || a.option_label),
                label: `${a.option_label}. ${a.answer_text}`,
              })),
            })),
          },
        };

      case 'J': {
        const sentences = [];
        const seenOptions = new Set();

        currentPart.questions.forEach((q) => {
          q.answers.forEach((a) => {
            if (!seenOptions.has(a.option_label)) {
              seenOptions.add(a.option_label);
              sentences.push({
                id: a.option_label,
                text: a.answer_text,
              });
            }
          });
        });

        let passageWithGaps = currentPart.content || '';
        const gaps = currentPart.questions.map((q) => q.question_number).sort((a, b) => a - b);

        return {
          component: MatchingContent,
          props: {
            ...commonProps,
            sentences: sentences.sort((a, b) => a.id.localeCompare(b.id)),
            gaps: gaps,
            passage: passageWithGaps,
          },
        };
      }

      default:
        return null;
    }
  }, [currentPart, currentPartIndex, parts, partTitles, testData.title]);

  if (!open && !inline) return null;

  const ContentComponent = transformedData?.component;

  if (inline) {
    return (
      <Box>
        {ContentComponent ? (
          <ContentComponent {...transformedData.props} />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {parts.length === 0
                ? 'No parts added yet.'
                : 'This part type is not supported for preview yet or is invalid.'}
            </Typography>
          </Box>
        )}

        <HiddenReviewContent
          ref={hiddenReviewRef}
          captureTargetRef={captureRef}
          testData={{
            title: testData?.test?.title || testData?.title || 'Reading Test',
            parts: testData?.parts || testData?.test?.parts || [],
          }}
        />

        <Dialog
          open={successPopupOpen}
          onClose={() => setSuccessPopupOpen(false)}
          slotProps={{
            paper: { sx: { borderRadius: '12px', p: 1, maxWidth: '460px' } },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>AI Review Completed</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              AI feedback has been generated successfully. Do you want to view the feedback now?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setSuccessPopupOpen(false)}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Stay Here
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const testId = testData?.test?.id || testData?.id;
                if (testId) {
                  router.push(`/teacher/view-test/reading/${testId}/feedback`);
                }
              }}
              sx={{ borderRadius: '20px', textTransform: 'none', px: 3 }}
            >
              View Feedback
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={toast.severity}
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          '@media print': {
            display: 'none', // Hide on-screen preview when printing
          },
        }}
      >
        {ContentComponent ? (
          <ContentComponent {...transformedData.props} />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {parts.length === 0
                ? 'No parts added yet.'
                : 'This part type is not supported for preview yet or is invalid.'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Status Warning Dialog */}
      <Dialog
        open={statusAlert}
        onClose={() => setStatusAlert(false)}
        slotProps={{
          paper: { sx: { borderRadius: '12px', p: 1, maxWidth: '400px' } },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'warning.main',
            fontWeight: 700,
          }}
        >
          <WarningAmberIcon /> AI Review Unavailable
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This test must be <strong>In Review</strong> before you can request AI Review.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setStatusAlert(false)}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            sx={{ borderRadius: '20px', textTransform: 'none', px: 3 }}
          >
            Back to Upload Page
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success popup after AI review generation */}
      <Dialog
        open={successPopupOpen}
        onClose={() => setSuccessPopupOpen(false)}
        slotProps={{
          paper: { sx: { borderRadius: '12px', p: 1, maxWidth: '460px' } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>AI Review Completed</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            AI feedback has been generated successfully. Do you want to view the feedback now?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setSuccessPopupOpen(false)}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Stay Here
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const testId = testData?.test?.id || testData?.id;
              if (testId) {
                router.push(`/teacher/view-test/reading/${testId}/feedback`);
              }
            }}
            sx={{ borderRadius: '20px', textTransform: 'none', px: 3 }}
          >
            View Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden DOM source for AI review PDF generation */}
      <HiddenReviewContent
        ref={hiddenReviewRef}
        captureTargetRef={captureRef}
        testData={{
          title: testData?.test?.title || testData?.title || 'Reading Test',
          parts: testData?.parts || testData?.test?.parts || [],
        }}
      />

      {/* Invisible component for browser printing (kept for compatibility) */}
      <PrintView
        testData={{
          title: testData?.test?.title || testData?.title || 'Reading Test',
          parts: testData?.parts || testData?.test?.parts || [],
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReadingPreview;
