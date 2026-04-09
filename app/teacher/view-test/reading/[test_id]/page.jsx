'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert, Container, Snackbar } from '@mui/material';
import ReadingPreview from '../../../../../components/Teacher/ReadingTest/ReadingPreview';
import ViewTestHeader from '../../../../../components/Teacher/ViewTestHeader';
import DeleteConfirmSnackbar from '../../../../../components/Teacher/DeleteConfirmSnackbar';
import {
  getReceptiveTestDetails,
  fetchHtmlContent,
  deleteReceptiveTest,
  updateTestParts,
} from '../../../../../api/test';

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
            content: !['I', 'J'].includes(format) ? q.content || '' : undefined,
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

export default function ViewReadingTestPage({ params }) {
  const { test_id } = use(params);
  const router = useRouter();
  const [testData, setTestData] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReceptiveTestDetails(test_id);
        setStatus(data.status);

        const parts = await transformReadingData(data);
        setTestData({
          id: data.id,
          status: data.status,
          title: data.title || '',
          level: data.level || '',
          time: data.time?.toString() || '',
          parts,
        });
      } catch (err) {
        setError(`Failed to load test: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [test_id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const handleDelete = async () => {
    if (deleting) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false);

    try {
      setDeleting(true);
      await deleteReceptiveTest(test_id);
      router.push('/teacher');
    } catch (err) {
      setError(`Failed to delete test: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (updatingStatus) return;
    try {
      setUpdatingStatus(true);
      await updateTestParts({ testId: test_id, basicInfo: { status: status } });
      setStatus(status);
      setTestData((prev) => (prev ? { ...prev, status: status } : prev));
      setSnackbar({
        open: true,
        message: `Status updated to ${status === 'I' ? 'In Review' : 'Published'}`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to update status: ${err.message}`,
        severity: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <ViewTestHeader
        title={testData?.title || 'Reading Test'}
        subtitle="Preview passages, questions, and answers exactly as learners will see them."
        skillLabel="Reading"
        status={status}
        showViewFeedback
        onViewFeedback={() => router.push(`/teacher/view-test/reading/${test_id}/feedback`)}
        showDelete
        deleting={deleting}
        onDelete={handleDelete}
        onInReview={() => handleUpdateStatus('I')}
        onPublished={() => handleUpdateStatus('P')}
        updatingStatus={updatingStatus}
        showEdit={status === 'D' || status === 'I'}
        onEdit={() => router.push(`/teacher/update-test/reading/${test_id}`)}
      />
      <ReadingPreview
        inline
        open={false}
        onClose={() => router.back()}
        testData={testData}
        showBackButton={false}
      />
      <DeleteConfirmSnackbar
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
