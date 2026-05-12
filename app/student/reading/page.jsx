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
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { getTestOverview } from '../../../api/tests';
import TestCard from '../../../components/TestCard';
import { useAuth } from '../../../hooks/useAuth';

const pageContainerStyles = {
  backgroundColor: 'background.default',
  minHeight: '100vh',
  pb: 8,
};

const filterSidebarStyles = {
  backgroundColor: 'background.paper',
  p: 2,
  borderRadius: 4,
  height: 'fit-content',
  position: 'sticky',
  top: 24,
};

const currentYear = new Date().getFullYear();

const YEARS = [
  'All years',
  currentYear.toString(),
  (currentYear - 1).toString(),
  (currentYear - 2).toString(),
];
const LEVELS = [
  { value: 'A1', label: 'Basic (A1)' },
  { value: 'A2', label: 'Basic (A2)' },
  { value: 'B1', label: 'Intermediate (B1)' },
  { value: 'B2', label: 'Intermediate (B2)' },
];

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
    level: '',
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
        if (filters.level) params.level = filters.level;
        if (filters.mine) params.mine = 'true';
        if (filters.year !== 'All years') params.year = filters.year;
        if (filters.teacher) params.teacher_name = filters.teacher;
        params.progress_status = true;

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
            <Box sx={filterSidebarStyles}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Box sx={{ width: 4, height: 24, bgcolor: 'warning.main', borderRadius: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Search and Filter
                </Typography>
              </Stack>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Test name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Find test name"
                    size="small"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '& fieldset': { border: 'none' },
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Teacher
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Find teacher"
                    size="small"
                    value={localTeacher}
                    onChange={(e) => setLocalTeacher(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '& fieldset': { border: 'none' },
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Year
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '& fieldset': { border: 'none' },
                    }}
                  >
                    {YEARS.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Sort by
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={filters.ordering}
                    onChange={(e) => handleFilterChange('ordering', e.target.value)}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '& fieldset': { border: 'none' },
                    }}
                  >
                    <MenuItem value="-created_at">Newest First</MenuItem>
                    <MenuItem value="created_at">Oldest First</MenuItem>
                    <MenuItem value="-updated_at">Recently Updated</MenuItem>
                    <MenuItem value="title">Title (A-Z)</MenuItem>
                    <MenuItem value="-title">Title (Z-A)</MenuItem>
                  </Select>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Level
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    displayEmpty
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '& fieldset': { border: 'none' },
                    }}
                  >
                    <MenuItem value="">All Levels</MenuItem>

                    {LEVELS.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                {user?.role === 'T' && (
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.mine}
                          onChange={(e) => handleFilterChange('mine', e.target.checked)}
                          size="small"
                          sx={{ color: 'warning.main', '&.Mui-checked': { color: 'warning.dark' } }}
                        />
                      }
                      label={
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          My Tests Only
                        </Typography>
                      }
                    />
                  </Box>
                )}
                {user?.role === 'A' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Status
                    </Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '& fieldset': { border: 'none' },
                      }}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="P">Published</MenuItem>
                      <MenuItem value="D">Draft</MenuItem>
                      <MenuItem value="I">In Review</MenuItem>
                      <MenuItem value="R">Removed</MenuItem>
                    </Select>
                  </Box>
                )}
              </Stack>
            </Box>
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
