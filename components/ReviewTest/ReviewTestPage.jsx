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
} from '@mui/material';
import {
  RateReview as RateReviewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  HourglassBottom as WaitingIcon,
  AssignmentInd as AssignmentIndIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
} from '@mui/icons-material';

// --- Constants ---
const STATUS_MAP = {
  P: { label: 'Published', color: 'success.main' },
  D: { label: 'Draft', color: 'text.secondary' },
  I: { label: 'In Review', color: 'warning.main' },
  R: { label: 'Removed', color: 'error.main' },
};

// --- Sub-components ---
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
  const [loading, setLoading] = useState(false);
  const [isMine, setIsMine] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // 1. Fetch Data
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      // Fix logic: isMine ? true (lấy của mình) : false (lấy của người khác để review)
      const result = await getListTest(token, isMine, isMine ? undefined : 'I');
      setTests(result?.results || []);
    } catch (error) {
      console.error(error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [isMine]);

  useEffect(() => {
    setMounted(true);
    fetchTests();
  }, [fetchTests]);

  // 2. Logic lọc dữ liệu (Client-side filtering)
  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        test.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.created_by?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkill = skillFilter === 'All Skills' || test.skill === skillFilter;
      const matchesLevel = levelFilter === 'All Levels' || test.level === levelFilter;
      // Thêm logic lọc theo status nếu cần
      return matchesSearch && matchesSkill && matchesLevel;
    });
  }, [tests, searchQuery, skillFilter, levelFilter]);

  if (!mounted) return null;

  const statusOptions = isMine
    ? ['All Status', 'Published', 'In Review', 'Draft', 'Removed']
    : ['All Status', 'Reviewed', 'Wait Review'];

  return (
    <Box component="main" sx={styles.contentWrapper}>
      {/* Header Section */}
      <Box sx={styles.welcomeHeader}>
        <Typography variant="h1" sx={styles.welcomeTitle}>
          List Review Test
        </Typography>
        <Typography variant="body1" sx={styles.welcomeSub} mb={3}>
          Review exam questions from colleagues or follow up on review requests from others.
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
          placeholder="Search by test name or teacher"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={styles.searchInput}
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
              onClick={() => setIsMine(false)}
            >
              Waiting for Review
            </Button>
            <Button
              startIcon={<AssignmentIndIcon />}
              sx={{ ...styles.switchButton, ...(isMine && styles.switchActive) }}
              onClick={() => setIsMine(true)}
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
              {filteredTests.length > 0 ? (
                filteredTests.map((item) => (
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
                      <Typography variant="body2" sx={{ color: STATUS_MAP[item.status]?.color }}>
                        {STATUS_MAP[item.status]?.label || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        {item.status === 'I' ? 'Review Now' : 'View Feedback'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No tests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
}
