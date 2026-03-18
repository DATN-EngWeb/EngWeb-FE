/* global fetch */
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert, Container } from '@mui/material';
import ProductivePreview from '../../../../../components/Writing-Speaking/ProductivePreview';
import ViewTestHeader from '../../../../../components/Teacher/ViewTestHeader';
import DeleteConfirmSnackbar from '../../../../../components/Teacher/DeleteConfirmSnackbar';
import ProductiveMetaPanel from '../../../../../components/Teacher/ProductiveMetaPanel';
import { getProductiveTestDetails, deleteProductiveTest } from '../../../../../api/test';

export default function ViewSpeakingTestPage({ params }) {
  const { test_id } = use(params);
  const router = useRouter();
  const [previewData, setPreviewData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProductiveTestDetails(test_id);
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
    </Container>
  );
}
