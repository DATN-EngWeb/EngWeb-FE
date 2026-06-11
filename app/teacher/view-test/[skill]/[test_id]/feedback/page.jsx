'use client';

import { forwardRef, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import { generateAIReadingFeedback, getTestFeedbacks } from '../../../../../../api/feedback';
import FeedbackCard from '../../../../../../components/Teacher/Feedback/FeedbackCard';
import {
  confirmUpload,
  fetchHtmlContent,
  getPresignedUrl,
  getProductiveTestDetails,
  getReceptiveTestDetails,
  getRecepiveTestDetails,
  uploadToObjectStorage,
} from '../../../../../../api/test';
import chatBotIcon from '../../../../../../assets/img/chat-bot.png';

const STATUS_LABELS = {
  D: 'Draft',
  I: 'In Review',
  P: 'Published',
};

const SKILL_LABELS = {
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
  speaking: 'Speaking',
};

const TEST_DETAIL_FETCHERS = {
  reading: getReceptiveTestDetails,
  listening: getReceptiveTestDetails,
  writing: getProductiveTestDetails,
  speaking: getProductiveTestDetails,
};

const FEEDBACK_PAGE_SIZE = 5;
const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;

const HiddenReviewContent = forwardRef(({ testData, captureTargetRef }, ref) => (
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

async function transformReadingData(data) {
  const parts = data?.receptive_test?.receptive_parts ?? [];

  return Promise.all(
    parts.map(async (part) => {
      const { format } = part;

      const newPart = {
        id: part.id,
        order: part.order,
        format,
        description: part.description || '',
        content: part.content || '',
      };

      if (newPart.content?.startsWith('http')) {
        newPart.content = await fetchHtmlContent(newPart.content);
      }

      newPart.questions = await Promise.all(
        (part.receptive_questions || []).map(async (q) => {
          const newQ = {
            id: q.id,
            question_number: q.question_number,
            explanation: q.explanation || '',
            score: q.score,
            content: !['I'].includes(format) ? q.content || '' : undefined,
          };

          if (newQ.content?.startsWith?.('http')) {
            newQ.content = await fetchHtmlContent(newQ.content);
          }

          newQ.answers = (q.receptive_answers || []).map(({ resources, ...ans }) => {
            if (format === 'I') {
              const { option_label, ...ansNoLabel } = ans;
              return ansNoLabel;
            }
            return ans;
          });

          return newQ;
        }),
      );

      return newPart;
    }),
  );
}

function normalizeFeedbackResponse(data) {
  if (Array.isArray(data)) {
    return {
      items: data,
      next: null,
      count: data.length,
    };
  }

  return {
    items: data?.results ?? [],
    next: data?.next ?? null,
    count: typeof data?.count === 'number' ? data.count : (data?.results ?? []).length,
  };
}

export default function ViewTestFeedbackPage({ params }) {
  const { skill, test_id } = use(params);

  const normalizedSkill = (skill || '').toLowerCase();

  const [testTitle, setTestTitle] = useState('Test Feedback');
  const [testStatus, setTestStatus] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [aiFeedback, setAiFeedback] = useState(null);
  const [teacherFeedbacks, setTeacherFeedbacks] = useState([]);
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherTotalCount, setTeacherTotalCount] = useState(0);
  const [teacherOrdering, setTeacherOrdering] = useState('-created_at');
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [feedbackError, setFeedbackError] = useState(null);
  const [loadingTeacherPage, setLoadingTeacherPage] = useState(false);
  const [readingReviewData, setReadingReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [confirmAISendOpen, setConfirmAISendOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, severity: 'info', message: '' });
  const hiddenReviewRef = useRef(null);
  const captureRef = useRef(null);

  const showAiFeedbackSection = normalizedSkill === 'reading';

  const skillLabel = useMemo(
    () => SKILL_LABELS[normalizedSkill] || (skill ? String(skill) : 'Unknown'),
    [normalizedSkill, skill],
  );

  const loadFeedbacks = useCallback(async () => {
    setLoadingFeedbacks(true);
    setFeedbackError(null);

    try {
      const [aiFeedbackData, teacherFeedbackData] = await Promise.all([
        getTestFeedbacks({ test_id, created_by: 'A', page_size: FEEDBACK_PAGE_SIZE }),
        getTestFeedbacks({
          test_id,
          created_by: 'T',
          page_size: FEEDBACK_PAGE_SIZE,
          ordering: teacherOrdering,
        }),
      ]);

      const aiPayload = normalizeFeedbackResponse(aiFeedbackData);
      const teacherPayload = normalizeFeedbackResponse(teacherFeedbackData);

      setAiFeedback(aiPayload.items[0] || null);
      setTeacherFeedbacks(teacherPayload.items);
      setTeacherPage(1);
      setTeacherTotalCount(teacherPayload.count || teacherPayload.items.length);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to load feedback list.');
    } finally {
      setLoadingFeedbacks(false);
    }
  }, [test_id, teacherOrdering]);

  useEffect(() => {
    const fetchPageData = async () => {
      setPageLoading(true);
      setPageError(null);

      try {
        const detailFetcher = TEST_DETAIL_FETCHERS[normalizedSkill];
        if (!detailFetcher) {
          throw new Error('Unsupported skill type in feedback route.');
        }

        const details = await detailFetcher(test_id);
        if (!details.is_owner) {
          throw new Error('You do not have permission to view feedback for this test.');
        }
        setTestTitle(details?.title || `${skillLabel} Test Feedback`);
        setTestStatus(details?.status || null);

        if (normalizedSkill === 'reading') {
          const parts = await transformReadingData(details);
          setReadingReviewData({
            id: details.id,
            status: details.status,
            title: details.title || '',
            parts,
          });
        }
      } catch (err) {
        setPageError(err.message || 'Failed to load test details.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchPageData();
  }, [normalizedSkill, skillLabel, test_id]);

  useEffect(() => {
    if (!pageLoading && !pageError) {
      loadFeedbacks();
    }
  }, [loadFeedbacks, pageLoading, pageError]);

  const showToast = useCallback((severity, message) => {
    setToast({ open: true, severity, message });
  }, []);

  const handleSendAI = useCallback(async () => {
    const testId = Number(test_id);
    const canReview = testStatus === 'I' && testId;

    if (!canReview) {
      showToast('warning', 'This test must be In Review before you can request AI Review.');
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
        test_id: testId,
        pdf_gcs_uri: pdfGcsUri,
      });

      await loadFeedbacks();
      showToast('success', 'AI feedback generated successfully.');
    } catch (error) {
      showToast('error', error?.message || 'Failed to generate AI review. Please try again.');
    } finally {
      setReviewLoading(false);
      setConfirmAISendOpen(false);
    }
  }, [loadFeedbacks, showToast, testStatus, test_id]);

  const teacherTotalPages = useMemo(() => {
    if (teacherTotalCount <= FEEDBACK_PAGE_SIZE) return 1;
    return Math.max(1, Math.ceil(teacherTotalCount / FEEDBACK_PAGE_SIZE));
  }, [teacherTotalCount]);

  const handleTeacherPageChange = async (_, page) => {
    if (loadingTeacherPage || page === teacherPage) return;

    setLoadingTeacherPage(true);
    setFeedbackError(null);
    try {
      const data = await getTestFeedbacks({
        test_id,
        created_by: 'T',
        page,
        page_size: FEEDBACK_PAGE_SIZE,
        ordering: teacherOrdering,
      });
      const payload = normalizeFeedbackResponse(data);

      setTeacherFeedbacks(payload.items);
      setTeacherPage(page);
      setTeacherTotalCount(payload.count || payload.items.length);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to change feedback page.');
    } finally {
      setLoadingTeacherPage(false);
    }
  };

  const handleTeacherOrderingChange = (event) => {
    setTeacherOrdering(event.target.value);
    setTeacherPage(1);
  };

  if (pageLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (pageError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Alert severity="error">{pageError}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {testTitle}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Chip
              label={skillLabel}
              sx={{ color: 'primary.dark', fontWeight: 700, bgcolor: 'warning.main' }}
            />
            <Chip
              label={STATUS_LABELS[testStatus] || testStatus || 'Unknown'}
              sx={{
                fontWeight: 700,
                bgcolor:
                  testStatus === 'P'
                    ? 'success.pastel'
                    : testStatus === 'I'
                      ? 'info.pastel'
                      : 'warning.pastel',
                color:
                  testStatus === 'P'
                    ? 'success.dark'
                    : testStatus === 'I'
                      ? 'info.dark'
                      : 'warning.dark',
              }}
            />
          </Stack>
        </Box>
      </Stack>

      {feedbackError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {feedbackError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: showAiFeedbackSection ? { xs: '1fr', md: '1fr 1fr' } : '1fr',
          alignItems: 'stretch',
        }}
      >
        {showAiFeedbackSection && (
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: { xs: 'auto', md: 620 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <Box
                  component="img"
                  src={chatBotIcon.src ?? chatBotIcon}
                  alt="AI Feedback"
                  sx={{ width: 24, height: 24, objectFit: 'contain', color: 'white' }}
                />
                <Typography variant="h6" fontWeight={700}>
                  AI Feedback
                </Typography>
              </Stack>

              <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
                {loadingFeedbacks ? (
                  <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress size={24} />
                  </Box>
                ) : aiFeedback ? (
                  <FeedbackCard feedback={aiFeedback} isAi />
                ) : (
                  <Box
                    sx={{
                      minHeight: 260,
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 2,
                      py: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: 1.5,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Box
                      component="img"
                      src={chatBotIcon.src ?? chatBotIcon}
                      alt="AI Feedback"
                      sx={{ width: 34, height: 34, objectFit: 'contain', opacity: 0.9 }}
                    />
                    <Typography fontWeight={700} color="text.primary">
                      No AI feedback yet
                    </Typography>
                    {testStatus === 'I' && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Generate AI review to see summarized insights for this test.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => setConfirmAISendOpen(true)}
                          disabled={reviewLoading || !readingReviewData}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          {reviewLoading ? 'Sending...' : 'Send AI'}
                        </Button>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            height: showAiFeedbackSection ? { xs: 'auto', md: 620 } : 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={1.5}
              mb={1.5}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <ForumIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Teacher Feedback
                </Typography>
              </Stack>
              <FormControl
                size="small"
                sx={{ minWidth: 145, alignSelf: { xs: 'flex-end', sm: 'auto' } }}
              >
                <Select
                  value={teacherOrdering}
                  onChange={handleTeacherOrderingChange}
                  sx={{
                    minWidth: 130,
                    height: 40,
                    borderRadius: 2,
                    fontSize: '14px',
                    color: 'primary.main',
                    '& .MuiSelect-select': {
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      py: 0,
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mt: 1,
                      },
                    },
                    MenuListProps: { sx: { py: 0.5 } },
                  }}
                >
                  <MenuItem value="-created_at" sx={{ fontSize: '14px', color: 'primary.main' }}>
                    Newest
                  </MenuItem>
                  <MenuItem value="created_at" sx={{ fontSize: '14px', color: 'primary.main' }}>
                    Oldest
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
              {loadingFeedbacks || loadingTeacherPage ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={24} />
                </Box>
              ) : teacherFeedbacks.length === 0 ? (
                <Box
                  sx={{
                    minHeight: showAiFeedbackSection ? 260 : 360,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    px: 2,
                    py: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 1,
                    bgcolor: 'background.default',
                  }}
                >
                  <ForumIcon sx={{ color: 'primary.main', fontSize: 30 }} />
                  <Typography fontWeight={700} color="text.primary">
                    No teacher feedback yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Feedback from teachers will appear here once available.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {teacherFeedbacks.map((feedback) => (
                    <FeedbackCard key={feedback.id} feedback={feedback} />
                  ))}

                  {teacherTotalPages > 1 && (
                    <Box display="flex" justifyContent="center" pt={0.5}>
                      <Pagination
                        count={teacherTotalPages}
                        page={teacherPage}
                        onChange={handleTeacherPageChange}
                        color="primary"
                        shape="rounded"
                        size="large"
                      />
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={confirmAISendOpen}
        onClose={() => setConfirmAISendOpen(false)}
        slotProps={{
          paper: { sx: { borderRadius: '12px', p: 1, maxWidth: '420px' } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm AI Feedback Generation</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Send this test to AI for evaluation now? You can stay on this page and wait for result.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmAISendOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendAI}
            disabled={reviewLoading}
            sx={{ textTransform: 'none' }}
          >
            {reviewLoading ? 'Sending...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <HiddenReviewContent
        ref={hiddenReviewRef}
        captureTargetRef={captureRef}
        testData={{
          title: readingReviewData?.title || testTitle || 'Reading Test',
          parts: readingReviewData?.parts || [],
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
