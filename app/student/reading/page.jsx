'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Pagination, CircularProgress } from '@mui/material';
import { getTestOverview } from '../../../api/tests';
import TestCard from '../../../components/TestCard';
import { useAuth } from '../../../hooks/useAuth';
import FilterSidebar from '../../../components/Student/FilterSidebar';

const pageContainerStyles = {
  backgroundColor: 'background.default',
  pb: 8,
};

export default function ReadingHub() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    title: '',
    teacher: '',
    year: 'All years',
    level: [],
    status: '',
    my_progress: '',
    ordering: '-created_at',
    mine: false,
  });

  // Fetch tests (search fields debounced inside FilterSidebar)
  useEffect(() => {
    async function fetchTests() {
      if (hasLoadedOnce) {
        setIsFetching(true);
      } else {
        setLoading(true);
      }
      try {
        // Build API params from filters
        const params = {
          skill: 'R',
          type: 'R',
          page: page,
          ordering: filters.ordering,
          page_size: 6,
        };

        if (filters.title) params.title = filters.title;
        if (filters.level && filters.level.length > 0) params.level = filters.level;
        if (filters.mine) params.mine = 'true';
        if (filters.year !== 'All years') params.year = filters.year;
        if (filters.teacher) params.teacher_name = filters.teacher;
        if (filters.my_progress) params.my_progress = filters.my_progress;

        params.progress_status = true;
        params.submitted = 'true';

        if (user?.role === 'A') {
          if (filters.status) params.status = filters.status;
        } else {
          params.status = 'P';
        }

        const response = await getTestOverview(params);

        if (response && response.results) {
          setTests(response.results);
          const count = response.count || 0;
          setTotalPages(Math.ceil(count / 6) || 1);
        } else {
          setTests([]);
          setTotalPages(1);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch tests:', err);
        setError(err.message || 'Failed to load tests. Please try again later.');
      } finally {
        setLoading(false);
        setIsFetching(false);
        setHasLoadedOnce(true);
      }
    }

    fetchTests();
  }, [filters, page, user?.role]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(1); // Reset to page 1 on filter change
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={pageContainerStyles}>
      <Container
        maxWidth="lg"
        sx={{
          mx: 'auto',
          pt: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            alignItems: 'stretch',
            flexGrow: 1,
          }}
        >
          <Grid
            item
            sx={{
              width: { xs: '100%', md: '280px' },
              flexShrink: { md: 0 },
              display: 'block',
            }}
          >
            <FilterSidebar
              filters={filters}
              handleFilterChange={handleFilterChange}
              user={user}
              tests={tests}
            />
          </Grid>

          <Grid
            item
            sx={{
              flexGrow: 1,
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                position: 'relative',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr',
                  lg: '1fr 1fr',
                },
                gap: '24px',
                mb: 3,
                minHeight: { xs: '400px', md: '560px' },
                alignContent: 'start',
              }}
            >
              {loading && !hasLoadedOnce ? (
                <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 10 }}>
                  <CircularProgress color="warning" />
                </Box>
              ) : tests.length > 0 ? (
                tests.map((test) => <TestCard key={test.id} role="student" {...test} />)
              ) : (
                <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', py: 10 }}>
                  No tests found.
                </Typography>
              )}

              {isFetching && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(1px)',
                    zIndex: 2,
                  }}
                >
                  <CircularProgress color="warning" />
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="large"
                siblingCount={0}
                boundaryCount={2}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
