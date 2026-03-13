/* global fetch */
'use client';

import { use, useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Container } from '@mui/material';
import ProductivePreview from '../../../../../components/Writing-Speaking/ProductivePreview';
import FeedbackTestLayout from '../../../../../components/Teacher/FeedbackTestLayout';
import { getProductiveTestDetails } from '../../../../../api/test';

export default function FeedbackSpeakingTestPage({ params }) {
  const { test_id } = use(params);
  const [previewData, setPreviewData] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProductiveTestDetails(test_id);
        const currentUserId = localStorage.getItem('userId');
        const isOwner =
          String(response.created_by_id ?? response.teacher_id ?? '') === String(currentUserId);
        if (response.status !== 'I' || isOwner) {
          setForbidden(true);
          setLoading(false);
          return;
        }
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

  if (forbidden) {
    return <FeedbackTestLayout testId={test_id} forbidden />;
  }

  return (
    <FeedbackTestLayout testId={test_id}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ProductivePreview
          title={previewData.title}
          description={previewData.description}
          suggestion={previewData.suggestion}
          audio={previewData.audio}
          preview={false}
        />
      </Container>
    </FeedbackTestLayout>
  );
}
