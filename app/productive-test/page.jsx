'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CircularProgress,
  Box,
  Alert,
  Paper,
  Typography,
  Divider,
  Chip,
  Container,
} from '@mui/material';
import { getFullProductiveTest } from '@/api/tests';

function ProductiveTestContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTestData() {
      if (!testId) {
        setError('Test ID is required. Please provide testId in URL params.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const backendTest = await getFullProductiveTest(testId);
        setTestData(backendTest);
      } catch (err) {
        setError(err.message || 'Failed to load test data');
      } finally {
        setLoading(false);
      }
    }

    fetchTestData();
  }, [testId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!testData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">No test data found.</Alert>
      </Container>
    );
  }

  const formatLabels = {
    A: 'Writing - Email',
    B: 'Writing - Article',
    C: 'Writing - Tell a story based on pictures',
    D: 'Writing - Essay',
    E: 'Writing - Letter',
    F: 'Writing - Reviews',
    G: 'Speaking - Narrative',
    H: 'Speaking - Description',
    I: 'Speaking - Social argument',
    J: 'Speaking - Reading aloud',
  };

  const skillLabels = {
    W: 'Writing',
    S: 'Speaking',
  };

  const levelLabels = {
    A1: 'A1',
    A2: 'A2',
    B1: 'B1',
    B2: 'B2',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            {testData.title || 'Productive Test'}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
            <Chip label={`Type: Productive`} color="primary" size="small" />
            <Chip
              label={`Skill: ${skillLabels[testData.skill] || testData.skill}`}
              color="secondary"
              size="small"
            />
            <Chip
              label={`Level: ${levelLabels[testData.level] || testData.level}`}
              color="info"
              size="small"
            />
            <Chip label={`Time: ${testData.time} minutes`} size="small" />
            {testData.productive_test?.format && (
              <Chip
                label={
                  formatLabels[testData.productive_test.format] ||
                  `Format: ${testData.productive_test.format}`
                }
                color="success"
                size="small"
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {testData.description && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {testData.description}
            </Typography>
          </Box>
        )}

        {testData.productive_test && (
          <>
            <Divider sx={{ my: 3 }} />

            {testData.productive_test.topic && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Topic
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {testData.productive_test.topic}
                </Typography>
              </Box>
            )}

            {testData.productive_test.description && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Description Content
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href={testData.productive_test.description}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'primary.main', textDecoration: 'underline' }}
                >
                  {testData.productive_test.description}
                </Typography>
              </Box>
            )}

            {testData.productive_test.min_word > 0 && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Minimum Words
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {testData.productive_test.min_word} words
                </Typography>
              </Box>
            )}

            {testData.productive_test.glue_text && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Instructions
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {testData.productive_test.glue_text}
                </Typography>
              </Box>
            )}

            {testData.productive_test.glue_resources &&
              Object.keys(testData.productive_test.glue_resources).length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Resources
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      bgcolor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(testData.productive_test.glue_resources, null, 2)}
                  </Box>
                </Box>
              )}
          </>
        )}

        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="h6" gutterBottom>
            Test Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {testData.status || 'N/A'}
          </Typography>
          {testData.created_at && (
            <Typography variant="body2" color="text.secondary">
              Created: {new Date(testData.created_at).toLocaleString()}
            </Typography>
          )}
          {testData.updated_at && (
            <Typography variant="body2" color="text.secondary">
              Updated: {new Date(testData.updated_at).toLocaleString()}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default function ProductiveTestPage() {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      }
    >
      <ProductiveTestContent />
    </Suspense>
  );
}
