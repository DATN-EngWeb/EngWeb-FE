'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  P: { label: 'Published', color: 'success.main' },
  D: { label: 'Draft', color: 'text.secondary' },
  I: { label: 'In Review', color: 'warning.main' },
  R: { label: 'Removed', color: 'error.main' },
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
  const [mounted, setMounted] = useState(false);
  const [tests, setTests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMine, setIsMine] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [statusFilter, setStatusFilter] = useState('All Status');
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

  const statusMap = useMemo(
    () => ({
      Published: 'P',
      Draft: 'D',
      'In Review': 'I',
      Removed: 'R',
      'Wait Review': 'I',
      Reviewed: 'P',
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

  // --- Fetch Logic ---
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = {
        page: currentPage,
        page_size: PAGE_SIZE,
        mine: isMine,
        ordering: orderingMap[sortBy] || '-created_at',
      };

      if (searchQuery) params.search = searchQuery;
      if (levelFilter !== 'All Levels') params.level = levelFilter;
      if (skillFilter !== 'All Skills') params.skill = skillMap[skillFilter];

      // Xử lý logic Status
      if (statusFilter !== 'All Status') {
        params.status = statusMap[statusFilter];
      } else if (!isMine) {
        params.status = 'I';
      }

      const result = await getListTest(token, params);
      setTests(result?.results || []);
      setTotalCount(result?.count || 0);
    } catch (error) {
      console.error('Fetch Error:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [
    isMine,
    currentPage,
    searchQuery,
    levelFilter,
    skillFilter,
    statusFilter,
    sortBy,
    skillMap,
    statusMap,
    orderingMap,
  ]);

  // Khởi chạy khi mount và khi filters thay đổi
  useEffect(() => {
    setMounted(true);
    fetchTests();
  }, [fetchTests]);

  // Reset page khi đổi Tab hoặc đổi Filter
  useEffect(() => {
    setCurrentPage(1);
  }, [isMine, searchQuery, skillFilter, levelFilter, statusFilter]);

  if (!mounted) return null;

  const statusOptions = isMine
    ? ['All Status', 'Published', 'In Review', 'Draft', 'Removed']
    : ['All Status', 'Wait Review', 'Reviewed'];

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={styles.selectFilter}
          >
            {statusOptions.map((opt) => (
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
                setStatusFilter('All Status');
              }}
            >
              Waiting for Review
            </Button>
            <Button
              startIcon={<AssignmentIndIcon />}
              sx={{ ...styles.switchButton, ...(isMine && styles.switchActive) }}
              onClick={() => {
                setIsMine(true);
                setStatusFilter('All Status');
              }}
            >
              My List Tests
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
                      <Button
                        size="small"
                        variant="contained"
                        color={item.status === 'I' ? 'primary' : 'inherit'}
                      >
                        {item.status === 'I' ? 'Review' : 'Detail'}
                      </Button>
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
