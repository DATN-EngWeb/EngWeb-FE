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
  Add as PlusIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { TeacherHomepageStyles as styles } from '../../styles/Teacher/TeacherHomepageStyles.js';

const PAGE_SIZE = 8;

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

export default function TeacherHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [sortBy, setSortBy] = useState('Newest List');
  const [currentPage, setCurrentPage] = useState(1);

  const [mounted, setMounted] = useState(false);

  const [tests, setTests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const skillMap = useMemo(
    () => ({
      Reading: 'R',
      Listening: 'L',
      Speaking: 'S',
      Writing: 'W',
    }),
    [],
  );

  const orderingMap = useMemo(
    () => ({
      'Newest List': '-created_at',
      'Oldest List': 'created_at',
      'Most Submissions': '-submissions',
    }),
    [],
  );

  // 3. Fetch data from Server
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      const params = {
        page: currentPage,
        page_size: PAGE_SIZE,
        mine: true,
      };

      if (searchQuery) params.search = searchQuery;
      if (levelFilter !== 'All Levels') params.level = levelFilter;
      if (skillFilter !== 'All Skills') params.skill = skillMap[skillFilter];

      // Get ordering value from map, use default if not found
      params.ordering = orderingMap[sortBy] || '-created_at';

      const result = await getListTest(token, params);

      setTests(result?.results || []);
      setTotalCount(result?.count || 0);
    } catch (error) {
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, levelFilter, skillFilter, sortBy, skillMap, orderingMap]);

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
          Welcome to Teacher homepage
        </Typography>
        <Typography variant="body1" sx={styles.welcomeSub}>
          Manage and track all your tests in one place
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
            value={skillFilter}
            onChange={handleFilterChange(setSkillFilter)}
            size="small"
            sx={styles.selectFilter}
            displayEmpty
            renderValue={(value) =>
              value === 'All Skills' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon fontSize="small" /> All Skills
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon fontSize="small" /> {value}
                </Box>
              )
            }
          >
            <MenuItem value="All Skills">All Skills</MenuItem>
            <MenuItem value="Writing">Writing</MenuItem>
            <MenuItem value="Speaking">Speaking</MenuItem>
            <MenuItem value="Reading">Reading</MenuItem>
            <MenuItem value="Listening">Listening</MenuItem>
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
          <Link href="/teacher/upload-test" passHref>
            <Button variant="contained" startIcon={<PlusIcon />} sx={styles.createBtn}>
              Create Test
            </Button>
          </Link>
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
          <IconButton disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft />
          </IconButton>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? 'contained' : 'text'}
              onClick={() => setCurrentPage(i + 1)}
              sx={{ minWidth: 40, mx: 0.5 }}
            >
              {i + 1}
            </Button>
          ))}
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
