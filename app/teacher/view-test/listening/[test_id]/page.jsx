'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert, Container, Snackbar } from '@mui/material';
import ListeningPreview from '../../../../../components/Teacher/ListeningPreview';
import ViewTestHeader from '../../../../../components/Teacher/ViewTestHeader';
import DeleteConfirmSnackbar from '../../../../../components/Teacher/DeleteConfirmSnackbar';
import {
  getReceptiveTestDetails,
  fetchHtmlContent,
  deleteReceptiveTest,
  updateTestParts,
} from '../../../../../api/test';
import { transformApiResponseToParts } from '../../../../../utils/testTransformers';

export default function ViewListeningTestPage({ params }) {
  const { test_id } = use(params);
  const router = useRouter();
  const [basicInfo, setBasicInfo] = useState(null);
  const [parts, setParts] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const data = await getReceptiveTestDetails(test_id);
        if (cancelled) return;

        if (!data.is_owner) {
          setSnackbar({
            open: true,
            message: 'You do not have permission to view this test',
            severity: 'error',
          });
          setTimeout(() => router.push('/teacher'), 1500);
          setLoading(false);
          return;
        }
        setStatus(data.status);
        setBasicInfo({
          testName: data.title || '',
          level: data.level || '',
          time: data.time?.toString() || '',
          description: data.description || '',
        });

        let transformedParts = transformApiResponseToParts(data);
        transformedParts = await Promise.all(
          transformedParts.map(async (part) => {
            if (part._contentUrl) {
              const htmlContent = await fetchHtmlContent(part._contentUrl);
              return { ...part, content: htmlContent };
            }
            return part;
          }),
        );

        // Sort parts by order
        transformedParts.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Sort questions within each part by question_number
        transformedParts = transformedParts.map((part) => ({
          ...part,
          questions: Array.isArray(part.questions)
            ? part.questions.sort((a, b) => (a.question_number || 0) - (b.question_number || 0))
            : part.questions,
        }));

        if (cancelled) return;

        setParts(transformedParts);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setLoading(false);
        setError(`Failed to load test: ${err.message}`);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
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
        title={basicInfo?.testName || 'Listening Test'}
        subtitle="Review the full listening structure and verify all parts before publishing."
        skillLabel="Listening"
        status={status}
        showViewFeedback
        onViewFeedback={() => router.push(`/teacher/view-test/listening/${test_id}/feedback`)}
        showDelete
        deleting={deleting}
        onDelete={handleDelete}
        onInReview={() => handleUpdateStatus('I')}
        onPublished={() => handleUpdateStatus('P')}
        updatingStatus={updatingStatus}
        showEdit={status === 'D' || status === 'I'}
        onEdit={() => router.push(`/teacher/update-test/listening/${test_id}`)}
      />
      <ListeningPreview
        basicInfo={basicInfo}
        parts={parts}
        onPreview={() => router.back()}
        showHeaderActions={false}
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
