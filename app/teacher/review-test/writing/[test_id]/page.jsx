/* global fetch */
'use client';

import { use, useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Container } from '@mui/material';
import ProductivePreview from '../../../../../components/Writing-Speaking/ProductivePreview';
import FeedbackTestLayout from '../../../../../components/Teacher/Feedback/FeedbackTestLayout';
import { getProductiveTestDetails } from '../../../../../api/test';

export default function FeedbackWritingTestPage({ params }) {
  const { test_id } = use(params);
  const [previewData, setPreviewData] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProductiveTestDetails(test_id);
        if (response.status !== 'I' || response.is_owner) {
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
          image={previewData.image}
          preview={false}
        />
      </Container>
    </FeedbackTestLayout>
  );
}
