'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getListTest } from '../../api/test';
import { ReviewTestPageStyles as styles } from '../../styles/Teacher/ReviewTest/ReviewTestPageStyles';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  AssignmentInd as AssignmentIndIcon,
  ChevronLeft,
  ChevronRight,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';

// --- Constants ---
const PAGE_SIZE = 10;
const STATUS_MAP = {
  I: { label: 'In Review', color: 'warning.main' },
};

const SKILL_LABELS = {
  R: 'Reading',
  L: 'Listening',
  S: 'Speaking',
  W: 'Writing',
};

export default function ReviewTestPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tests, setTests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMine, setIsMine] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [sortBy, setSortBy] = useState('Newest List');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Mappings ---
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
    }),
    [],
  );

  const getSkillPath = useCallback((skill) => {
    if (skill === 'S') return 'speaking';
    if (skill === 'W') return 'writing';
    if (skill === 'R') return 'reading';
    return 'listening';
  }, []);

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

  // --- Fetch Logic ---
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: PAGE_SIZE,
        mine: isMine,
        status: 'I',
        ordering: orderingMap[sortBy] || '-created_at',
      };

      if (searchQuery) params.search = searchQuery;
      if (levelFilter !== 'All Levels') params.level = levelFilter;
      if (skillFilter !== 'All Skills') params.skill = skillMap[skillFilter];

      // Xử lý logic sortby
      params.ordering = orderingMap[sortBy] || '-created_at';

      const result = await getListTest(params);
      setTests(result?.results || []);
      setTotalCount(result?.count || 0);
    } catch (error) {
      console.error('Fetch Error:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [isMine, currentPage, searchQuery, levelFilter, skillFilter, sortBy, skillMap, orderingMap]);

  // start mounting and initial fetch
  useEffect(() => {
    setMounted(true);
    fetchTests();
  }, [fetchTests]);

  // Reset page when switching Tab or changing Filter
  useEffect(() => {
    setCurrentPage(1);
  }, [isMine, searchQuery, skillFilter, levelFilter, sortBy]);

  if (!mounted) return null;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  return (
    <Box component="main" sx={styles.contentWrapper}>
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: 3,
          p: 3,
          mb: 4,
        }}
      >
        <Typography variant="h3" fontWeight={600} color="primary.main">
          {isMine ? 'My Test Collection' : 'Review Test Center'}
        </Typography>
        <Typography color="text.secondary">
          {isMine
            ? 'Manage and track the status of your created exam questions.'
            : 'Review exam questions from colleagues to ensure quality.'}
        </Typography>
      </Box>

      {/* Switcher */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1, mb: 3 }}>
        <Box sx={styles.switcherWrapper}>
          <Stack direction="row" sx={styles.switcher}>
            <Button
              startIcon={<RateReviewIcon />}
              sx={{ ...styles.switchButton, ...(!isMine && styles.switchActive) }}
              onClick={() => {
                setIsMine(false);
                setSortBy('Newest List');
              }}
            >
              Needs My Review
            </Button>
            <Button
              startIcon={<AssignmentIndIcon />}
              sx={{ ...styles.switchButton, ...(isMine && styles.switchActive) }}
              onClick={() => {
                setIsMine(true);
                setSortBy('Newest List');
              }}
            >
              My Pending Reviews
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Filter Section */}
      <Box sx={styles.filterSection}>
        <TextField
          placeholder="Search by name or topic"
          size="small"
          sx={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

        <Stack direction="row" spacing={1.5}>
          <Select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={styles.selectFilter}
            displayEmpty
            renderValue={(value) => value}
          >
            {['Newest List', 'Oldest List'].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            sx={styles.selectFilter}
            displayEmpty
            renderValue={(value) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                {value}
              </Box>
            )}
          >
            {['All Skills', 'Writing', 'Speaking', 'Reading', 'Listening'].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            sx={styles.selectFilter}
            displayEmpty
            renderValue={(value) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                {value === 'All Levels' ? value : `Level ${value}`}
              </Box>
            )}
          >
            <MenuItem value="All Levels">All Levels</MenuItem>
            {['A1', 'A2', 'B1', 'B2'].map((l) => (
              <MenuItem key={l} value={l}>
                Level {l}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper} elevation={0} sx={styles.tableContainer}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {!isMine && <TableCell sx={styles.tableHeadCell}>Teacher</TableCell>}
                <TableCell sx={styles.tableHeadCell}>Test Name</TableCell>
                <TableCell sx={styles.tableHeadCell}>Skill</TableCell>
                <TableCell sx={styles.tableHeadCell}>Level</TableCell>
                <TableCell sx={styles.tableHeadCell}>Created Date</TableCell>
                <TableCell sx={styles.tableHeadCell}>Status</TableCell>
                <TableCell sx={styles.tableHeadCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.length > 0 ? (
                tests.map((item) => (
                  <TableRow key={item.id} hover sx={styles.tableRow}>
                    {!isMine && (
                      <TableCell sx={styles.tableBodyCell}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar src={item.created_by?.avatar} sx={{ width: 28, height: 28 }} />
                          <Typography variant="body2" fontWeight={500}>
                            {item.created_by?.full_name}
                          </Typography>
                        </Stack>
                      </TableCell>
                    )}
                    <TableCell sx={styles.tableBodyCell}>
                      <Typography fontWeight={500}>{item.title}</Typography>
                    </TableCell>
                    <TableCell sx={styles.tableBodyCell}>
                      {SKILL_LABELS[item.skill] || item.skill}
                    </TableCell>
                    <TableCell sx={styles.tableBodyCell}>{item.level}</TableCell>
                    <TableCell sx={styles.tableBodyCell}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-GB')
                        : 'N/A'}
                    </TableCell>
                    <TableCell sx={styles.tableBodyCell}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: STATUS_MAP[item.status]?.color,
                          fontWeight: 700,
                          backgroundColor: `${STATUS_MAP[item.status]?.color}15`,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '6px',
                          display: 'inline-block',
                        }}
                      >
                        {STATUS_MAP[item.status]?.label || item.status}
                      </Typography>
                    </TableCell>
                    <TableCell sx={styles.tableBodyCell}>
                      {isMine ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                            onClick={() =>
                              router.push(
                                `/teacher/view-test/${getSkillPath(item.skill)}/${item.id}/feedback`,
                              )
                            }
                          >
                            View Feedback
                          </Button>
                        </Stack>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          color={item.status === 'I' ? 'primary' : 'inherit'}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                          onClick={() => {
                            router.push(
                              `/teacher/review-test/${getSkillPath(item.skill)}/${item.id}`,
                            );
                          }}
                        >
                          {item.status === 'I' ? 'Review Now' : 'Detail'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      No data found matching your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Pagination Info */}
      {totalPages > 1 && (
        <Box sx={styles.paginationContainer}>
          {/* Back button */}
          <IconButton disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft />
          </IconButton>

          {/* Pagination */}
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

          {/* Next button */}
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
