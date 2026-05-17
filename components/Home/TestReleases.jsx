'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { testReleasesStyles } from '../../styles/Home/TestReleasesStyles';
import { getTestOverview } from '../../api/tests';
import { transformTestOverview } from '../../utils/testDataTransform';

export default function TestReleases() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTests() {
      try {
        setLoading(true);
        setError(null);

        const result = await getTestOverview({
          status: 'P',
          page_size: 4,
          ordering: '-created_at',
        });

        const transformedTests = transformTestOverview(result.results || []);
        setTests(transformedTests);
      } catch (err) {
        setError(err.message || 'Failed to load tests');
      } finally {
        setLoading(false);
      }
    }

    fetchTests();
  }, []);

  return (
    <Box sx={testReleasesStyles.mainContainer}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={testReleasesStyles.title}>
          Latest test releases:
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && tests.length === 0 && (
          <Alert severity="info">No published tests available at the moment.</Alert>
        )}

        {!loading && !error && tests.length > 0 && (
          <Grid container spacing={3}>
            {tests.map((test) => (
              <Grid item xs={12} sm={6} md={3} key={test.id}>
                <Card
                  sx={{
                    ...testReleasesStyles.cardBase,
                    backgroundColor: test.color,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.3s ease',
                    },
                  }}
                >
                  <CardContent sx={testReleasesStyles.cardContent}>
                    <Box sx={testReleasesStyles.iconContainer}>{test.icon}</Box>
                    <Typography variant="h6" sx={testReleasesStyles.cardTitle}>
                      {test.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'white', opacity: 0.9 }}>
                      {test.level} •{' '}
                      {test.skill === 'R'
                        ? 'Reading'
                        : test.skill === 'L'
                          ? 'Listening'
                          : test.skill === 'S'
                            ? 'Speaking'
                            : 'Writing'}
                    </Typography>
                    <Box sx={testReleasesStyles.decorativeCircle} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
