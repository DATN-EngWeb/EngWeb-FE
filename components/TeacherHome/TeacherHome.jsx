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

const ITEMS_PER_PAGE = 8;

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
  const [loading, setLoading] = useState(false);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const result = await getListTest(token, true, null);
      setTests(result?.results || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bài test:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const filteredAndSortedTests = useMemo(() => {
    let result = [...tests];

    // Filter theo tìm kiếm
    if (searchQuery) {
      result = result.filter((test) =>
        test.title?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter theo kỹ năng
    if (skillFilter !== 'All Skills') {
      result = result.filter((test) => test.skill?.includes(skillFilter));
    }

    // Filter theo cấp độ
    if (levelFilter !== 'All Levels') {
      result = result.filter((test) => test.level === levelFilter);
    }

    // Sắp xếp
    result.sort((a, b) => {
      if (sortBy === 'Newest List') return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortBy === 'Oldest List') return new Date(a.date || 0) - new Date(b.date || 0);
      if (sortBy === 'Most Submissions') return (b.submissions || 0) - (a.submissions || 0);
      return 0;
    });

    return result;
  }, [tests, searchQuery, skillFilter, levelFilter, sortBy]);

  // 3. Logic Phân trang (Cắt mảng dữ liệu)
  const totalPages = Math.ceil(filteredAndSortedTests.length / ITEMS_PER_PAGE);

  const paginatedTests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTests, currentPage]);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, skillFilter, levelFilter, sortBy]);

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
          onChange={(e) => setSearchQuery(e.target.value)}
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
            onChange={(e) => setSkillFilter(e.target.value)}
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
            onChange={(e) => setLevelFilter(e.target.value)}
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
            onChange={(e) => setSortBy(e.target.value)}
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
            <Typography sx={{ mt: 2 }}>Loading tests...</Typography>
          </Box>
        ) : filteredAndSortedTests.length > 0 ? (
          filteredAndSortedTests.map((test) => <TestCard key={test.id} {...test} />)
        ) : (
          <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', py: 12 }}>
            No tests found matching your filters.
          </Typography>
        )}
      </Box>

      {/* Dynamic Pagination Section */}
      {totalPages > 1 && (
        <Box sx={styles.paginationContainer}>
          <IconButton disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft />
          </IconButton>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'contained' : 'text'}
                onClick={() => setCurrentPage(pageNum)}
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: currentPage === pageNum ? 'warning.light' : 'transparent',
                  color: 'primary.dark',
                  mx: 0.5,
                  '&:hover': {
                    bgcolor: currentPage === pageNum ? 'yellow.main' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                {pageNum}
              </Button>
            );
          })}

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
