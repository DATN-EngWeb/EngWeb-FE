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
  RateReview as RateReviewIcon,
  Search as SearchIcon,
  HourglassBottom as WaitingIcon,
  AssignmentInd as AssignmentIndIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

// --- Constants ---
const PAGE_SIZE = 10;
const STATUS_MAP = {
  I: { label: 'In Review', color: 'warning.main' },
};

const StatCard = ({ icon, count, value, variant }) => (
  <Box sx={styles.statBadge(variant)}>
    <Box sx={styles.iconWrapper(variant)}>{icon}</Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      <Typography sx={styles.statValue}>{count}</Typography>
      <Typography sx={styles.statLabel}>{value}</Typography>
    </Box>
  </Box>
);

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
      const token = localStorage.getItem('accessToken');
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

      const result = await getListTest(token, params);
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
      {/* Header Section */}
      <Box sx={styles.welcomeHeader}>
        <Typography variant="h1" sx={styles.welcomeTitle}>
          {isMine ? 'My Test Collection' : 'Review Test Center'}
        </Typography>
        <Typography variant="body1" sx={styles.welcomeSub} mb={3}>
          {isMine
            ? 'Manage and track the status of your created exam questions.'
            : 'Review exam questions from colleagues to ensure quality.'}
        </Typography>

        <Stack direction="row" spacing={4}>
          <StatCard
            icon={<WaitingIcon sx={{ color: 'warning.dark' }} />}
            count="2"
            value="Waiting Review"
            variant="purple"
          />
          <StatCard
            icon={<SendIcon sx={{ color: 'warning.dark' }} />}
            count="3"
            value="My Feedbacks"
            variant="yellow"
          />
          <StatCard
            icon={<CheckCircleIcon sx={{ color: 'success.dark' }} />}
            count="5"
            value="Reviewed"
            variant="green"
          />
        </Stack>
      </Box>

      {/* Filter Section */}
      <Box sx={styles.filterSection}>
        <TextField
          placeholder="Search by title..."
          size="small"
          sx={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={2}>
          <Select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={styles.selectFilter}
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

      {/* Switcher */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', my: 2 }}>
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

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
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
                  <TableRow key={item.id} hover>
                    {!isMine && (
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar src={item.created_by?.avatar} sx={{ width: 24, height: 24 }} />
                          <Typography variant="body2">{item.created_by?.full_name}</Typography>
                        </Stack>
                      </TableCell>
                    )}
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.skill}</TableCell>
                    <TableCell>{item.level}</TableCell>
                    <TableCell>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: STATUS_MAP[item.status]?.color, fontWeight: 'bold' }}
                      >
                        {STATUS_MAP[item.status]?.label || item.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {isMine ? (
                        // case 1: (My List Tests)
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            onClick={() => router.push(`/teacher/ViewFeedback/${item.id}`)}
                          >
                            View Feedback
                          </Button>
                        </Stack>
                      ) : (
                        // case 2: (Tests I Need to Review)
                        <Button
                          size="small"
                          variant="contained"
                          color={item.status === 'I' ? 'primary' : 'inherit'}
                          onClick={() => {
                            router.push(`/teacher/ReviewTest/${item.id}`); // Review Page
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
