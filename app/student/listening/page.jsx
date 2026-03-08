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
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  Card,
  Pagination,
  InputAdornment,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import UpdateIcon from '@mui/icons-material/Update';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTestOverview } from '../../../api/tests';
import TestCard from '../../../components/TestCard';
import { useAuth } from '../../../hooks/useAuth';

const pageContainerStyles = {
  backgroundColor: 'background.default',
  minHeight: '100vh',
  pb: 8,
};

const headerSectionStyles = {
  bgcolor: 'background.paper',
  p: 4,
  borderRadius: 4,
};

const filterSidebarStyles = {
  backgroundColor: 'background.paper',
  p: 2,
  borderRadius: 4,
  height: 'fit-content',
};

const YEARS = ['2024', '2023', '2022', 'All years'];
const LEVELS = [
  { value: 'A1', label: 'Basic (A1)' },
  { value: 'A2', label: 'Basic (A2)' },
  { value: 'B1', label: 'Intermediate (B1)' },
  { value: 'B2', label: 'Intermediate (B2)' },
];

export default function ListeningHub() {
  const router = useRouter();
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

  useEffect(() => {
    async function fetchTests() {
      setLoading(true);
      try {
        // Build API params from filters
        const params = {
          skill: 'L',
          type: 'R',
          page: page,
          ordering: filters.ordering,
        };

        if (filters.title) params.title = filters.title;
        if (filters.level) params.level = filters.level;
        if (filters.mine) params.mine = 'true';
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

  const handleApplyFilters = () => {
    console.log('Applying filters:', filters);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={pageContainerStyles}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 8, lg: 15 }, mx: 'auto', mt: 4, mb: 4 }}>
        <Box sx={headerSectionStyles}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Listening Hub
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
            Improve your English listening skills with carefully prepared tests.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Chip
              icon={<MenuBookIcon sx={{ fontSize: 18, color: 'inherit !important' }} />}
              label="120+ tests"
              sx={{ bgcolor: 'warning.pastel', color: 'orange.main', fontWeight: 600 }}
            />
            <Chip
              icon={<UpdateIcon sx={{ fontSize: 18, color: 'inherit !important' }} />}
              label="Update daily"
              sx={{ bgcolor: 'success.pastel', color: 'success.dark', fontWeight: 600 }}
            />
          </Stack>
        </Box>
      </Container>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 8, lg: 15 }, mx: 'auto' }}>
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
                    value={filters.title}
                    onChange={(e) => handleFilterChange('title', e.target.value)}
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
                    value={filters.teacher}
                    onChange={(e) => handleFilterChange('teacher', e.target.value)}
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
                    Level
                  </Typography>
                  <Stack>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.level === ''}
                          onChange={() => handleFilterChange('level', '')}
                          size="small"
                          sx={{ color: 'warning.main', '&.Mui-checked': { color: 'warning.dark' } }}
                        />
                      }
                      label={<Typography variant="body2">All Levels</Typography>}
                    />
                    {LEVELS.map((level) => (
                      <FormControlLabel
                        key={level.value}
                        control={
                          <Checkbox
                            checked={filters.level === level.value}
                            onChange={() => handleFilterChange('level', level.value)}
                            size="small"
                            sx={{
                              color: 'warning.main',
                              '&.Mui-checked': { color: 'warning.dark' },
                            }}
                          />
                        }
                        label={<Typography variant="body2">{level.label}</Typography>}
                      />
                    ))}
                  </Stack>
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

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleApplyFilters}
                  sx={{
                    bgcolor: 'warning.main',
                    color: 'dark.main',
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'warning.dark' },
                  }}
                >
                  Apply
                </Button>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                List Reading Test
              </Typography>
              <Select
                value={filters.ordering}
                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                size="small"
                sx={{
                  minWidth: 160,
                  bgcolor: 'background.paper',
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
            </Stack>

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
