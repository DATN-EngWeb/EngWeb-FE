'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getListTest } from '../../api/test';
import Link from 'next/link';
import TestCard from '../TestCard.jsx';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  MenuBook as LibraryIcon,
  AutoAwesome as SparklesIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { TeacherHomepageStyles as styles } from '../../styles/Teacher/TeacherHomepageStyles.js';

const PAGE_SIZE = 9;

const StatCard = ({ icon, value, variant }) => (
  <Box sx={styles.statBadge(variant)}>
    <Typography component="span" sx={{ fontSize: '1.2rem' }}>
      {icon}
    </Typography>
    <Typography
      component="span"
      sx={{
        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default function ProductiveHub({ skill }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [sortBy, setSortBy] = useState('Newest List');
  const [currentPage, setCurrentPage] = useState(1);

  const [mounted, setMounted] = useState(false);

  const [tests, setTests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const orderingMap = useMemo(
    () => ({
      'Newest List': '-created_at',
      'Oldest List': 'created_at',
      'Most Submissions': '-submissions',
    }),
    [],
  );

  const getPaginationRange = (current, total) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  // 3. Fetch data from Server
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      const params = {
        page: currentPage,
        page_size: PAGE_SIZE,
        mine: false,
      };

      if (searchQuery) params.search = searchQuery;
      if (levelFilter !== 'All Levels') params.level = levelFilter;
      params.skill = skill;
      params.status = 'P';
      params.progress_status = true;
      params.ordering = orderingMap[sortBy] || '-created_at';

      const result = await getListTest(token, params);
      setTests(result?.results || []);
      console.log('Fetched Tests:', result?.results || []);
      setTotalCount(result?.count || 0);
    } catch (error) {
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, levelFilter, statusFilter, sortBy, orderingMap]);

  // Call fetch when any filter changes
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Reset page 1 when filter changes
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  return (
    <Box component="main" sx={styles.contentWrapper}>
      <Box sx={styles.welcomeHeader}>
        <Typography variant="h1" sx={styles.welcomeTitle}>
          {skill === 'W' ? 'Writing Hub' : 'Speaking Hub'}
        </Typography>
        <Typography variant="body1" sx={styles.welcomeSub}>
          {skill === 'W'
            ? 'Improve your English writing skills with carefully prepared tests.'
            : 'Improve your English speaking skills with carefully prepared tests.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <StatCard
            icon={<LibraryIcon fontSize="medium" sx={{ color: 'warning.dark' }} />}
            value="120+ tests"
            variant="yellow"
          />
          <StatCard
            icon={<SparklesIcon fontSize="medium" sx={{ color: 'warning.dark' }} />}
            value="162 total submissions"
            variant="green"
          />
        </Box>
      </Box>

      <Box sx={styles.filterSection}>
        <TextField
          placeholder="Search by name or topic"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          sx={styles.searchInput}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'darkGrey.light' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            size="small"
            sx={styles.selectFilter}
            displayEmpty
            renderValue={(value) =>
              value === 'All Status' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon fontSize="small" /> All Status
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon fontSize="small" /> {value}
                </Box>
              )
            }
          >
            <MenuItem value="All Status">All Status</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="none">None</MenuItem>
          </Select>

          <Select
            value={levelFilter}
            onChange={handleFilterChange(setLevelFilter)}
            size="small"
            sx={styles.selectFilter}
            displayEmpty
            renderValue={(v) => (v === 'All Levels' ? 'All Levels' : `Level ${v}`)}
          >
            <MenuItem value="All Levels">All Levels</MenuItem>
            <MenuItem value="A1">Level A1</MenuItem>
            <MenuItem value="A2">Level A2</MenuItem>
            <MenuItem value="B1">Level B1</MenuItem>
            <MenuItem value="B2">Level B2</MenuItem>
          </Select>

          <Select
            value={sortBy}
            onChange={handleFilterChange(setSortBy)}
            size="small"
            sx={styles.selectFilter}
            displayEmpty
            renderValue={(value) =>
              value === 'all' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> Newest List</Box>
              ) : (
                value
              )
            }
          >
            <MenuItem value="Newest List">Newest List</MenuItem>
            <MenuItem value="Oldest List">Oldest List</MenuItem>
            <MenuItem value="Most Submissions">Most Submissions</MenuItem>
          </Select>
        </Box>
      </Box>

      <Box sx={styles.testGrid}>
        {loading ? (
          <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 10 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : tests.length > 0 ? (
          tests.map((test) => <TestCard key={test.id} {...test} />)
        ) : (
          <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', py: 10 }}>
            No tests found.
          </Typography>
        )}
      </Box>

      {/* Dynamic Pagination Section */}
      {totalPages > 1 && (
        <Box sx={styles.paginationContainer}>
          {/* Back */}
          <IconButton disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft />
          </IconButton>

          {/* pagination */}
          {getPaginationRange(currentPage, totalPages).map((page, i) => {
            if (page === '...') {
              return (
                <Typography key={`dots-${i}`} sx={{ mx: 1, color: 'text.secondary' }}>
                  ...
                </Typography>
              );
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? 'contained' : 'text'}
                onClick={() => setCurrentPage(page)}
                sx={{
                  minWidth: 40,
                  height: 40,
                  mx: 0.5,
                  borderRadius: '8px',
                  fontWeight: currentPage === page ? 700 : 400,
                }}
              >
                {page}
              </Button>
            );
          })}

          {/* Next */}
          <IconButton
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
