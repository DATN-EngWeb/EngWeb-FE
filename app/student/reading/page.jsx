'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Select,
  Checkbox,
  FormControlLabel,
  Pagination,
  InputAdornment,
  Stack,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTestOverview } from '../../../api/tests';
import TestCard from '../../../components/TestCard';
import { useAuth } from '../../../hooks/useAuth';
import FilterSidebar from '../../../components/Student/FilterSidebar';

const pageContainerStyles = {
  backgroundColor: 'background.default',
  minHeight: '100vh',
  pb: 8,
};

const headerSectionStyles = {
  bgcolor: 'background.paper',
  px: 4,
  py: 3,
  borderRadius: 4,
};

export default function ReadingHub() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    title: '',
    teacher: '',
    year: 'All years',
    level: [],
    status: '',
    ordering: '-created_at',
    mine: false,
  });

  const [localTitle, setLocalTitle] = useState(filters.title);
  const [localTeacher, setLocalTeacher] = useState(filters.teacher);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.title !== localTitle || prev.teacher !== localTeacher) {
          setPage(1);
          return { ...prev, title: localTitle, teacher: localTeacher };
        }
        return prev;
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [localTitle, localTeacher]);

  // Fetch tests
  useEffect(() => {
    async function fetchTests() {
      setLoading(true);
      try {
        // Build API params from filters
        const params = {
          skill: 'R',
          type: 'R',
          page: page,
          ordering: filters.ordering,
        };

        if (filters.title) params.title = filters.title;
        if (filters.level && filters.level.length > 0) params.level = filters.level;
        if (filters.mine) params.mine = 'true';
        if (filters.year !== 'All years') params.year = filters.year;
        if (filters.teacher) params.teacher_name = filters.teacher;
        params.progress_status = true;
        params.submitted = 'true';
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
          setTotalPages(Math.ceil(count / 10) || 1);
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
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 8, lg: 15 }, mx: 'auto', pt: 4 }}>
        <Grid container spacing={2} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Grid
            item
            sx={{
              width: { xs: '100%', md: '280px' },
              flexShrink: { md: 0 },
              display: 'block',
            }}
          >
            <FilterSidebar filters={filters} handleFilterChange={handleFilterChange} user={user} />
          </Grid>

          <Grid
            item
            sx={{
              flexGrow: 1,
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr',
                  lg: '1fr 1fr',
                },
                gap: '24px',
                marginBottom: '48px',
                minHeight: '400px',
                alignContent: 'start',
              }}
            >
              {loading ? (
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
            </Box>

            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
