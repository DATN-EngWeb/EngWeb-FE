/* global fetch */
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert, Container, Snackbar } from '@mui/material';
import ProductivePreview from '../../../../../components/Writing-Speaking/ProductivePreview';
import ViewTestHeader from '../../../../../components/Teacher/ViewTestHeader';
import DeleteConfirmSnackbar from '../../../../../components/Teacher/DeleteConfirmSnackbar';
import ProductiveMetaPanel from '../../../../../components/Teacher/ProductiveMetaPanel';
import {
  getProductiveTestDetails,
  deleteProductiveTest,
  updateProductiveTest,
} from '../../../../../api/test';

export default function ViewSpeakingTestPage({ params }) {
  const { test_id } = use(params);
  const router = useRouter();
  const [previewData, setPreviewData] = useState(null);
  const [metadata, setMetadata] = useState(null);
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
    const fetchData = async () => {
      try {
        const response = await getProductiveTestDetails(test_id);
        if (!response.is_owner) {
          setSnackbar({
            open: true,
            message: 'You do not have permission to view this test',
            severity: 'error',
          });
          setTimeout(() => router.push('/teacher'), 1500);
          setLoading(false);
          return;
        }
        setStatus(response.status);

        const descUrl = response.productive_test?.description;
        let description = descUrl || '';
        if (descUrl?.startsWith('http')) {
          const res = await fetch(descUrl);
          description = await res.text();
        }

        setPreviewData({
          title: response.title || '',
          description,
          suggestion: response.productive_test?.glue_text || '',
          audio: response.productive_test?.glue_resources?.audio || null,
        });
        setMetadata({
          level: response.level || '',
          time: response.time,
          topic: response.productive_test?.topic || '',
          format: response.productive_test?.format || '',
          minWord: response.productive_test?.min_word,
          showMinWord: false,
          audio: response.productive_test?.glue_resources?.audio || null,
          image: response.productive_test?.glue_resources?.image || null,
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
      await deleteProductiveTest(test_id);
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
      await updateProductiveTest(test_id, { status: status });
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ViewTestHeader
        title={previewData?.title || 'Speaking Test'}
        subtitle="Inspect prompt, guidance, and media resources before your final release."
        skillLabel="Speaking"
        status={status}
        showViewFeedback
        onViewFeedback={() => router.push(`/teacher/view-test/speaking/${test_id}/feedback`)}
        showDelete
        deleting={deleting}
        onDelete={handleDelete}
        onInReview={() => handleUpdateStatus('I')}
        onPublished={() => handleUpdateStatus('P')}
        updatingStatus={updatingStatus}
        showEdit={status === 'D' || status === 'I'}
        onEdit={() => router.push(`/teacher/update-test/speaking/${test_id}`)}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr)' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <ProductiveMetaPanel metadata={metadata} />
        <ProductivePreview
          title={previewData.title}
          description={previewData.description}
          suggestion={previewData.suggestion}
          audio={previewData.audio}
          preview={false}
        />
      </Box>
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
