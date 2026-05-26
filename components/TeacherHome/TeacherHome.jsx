'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getListTest } from '../../api/test';
import { getTeacherSummary } from '../../api/test';
import Link from 'next/link';
import TestCard from '../TestCard.jsx';
import {
  Box,
  Grid,
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
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as PlusIcon,
  ChevronLeft,
  ChevronRight,
  AssignmentOutlined,
  CheckCircle as SuccessIcon,
  Description as DraftIcon,
  Autorenew as PendingIcon,
} from '@mui/icons-material';
import { TeacherHomepageStyles as styles } from '../../styles/Teacher/TeacherHomepageStyles.js';
import { useAuth } from '../../hooks/useAuth';

const PAGE_SIZE = 9;

export default function TeacherHome() {
  const { user } = useAuth(null);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [sortBy, setSortBy] = useState('Newest List');
  const [currentPage, setCurrentPage] = useState(1);

  const [mounted, setMounted] = useState(false);

  const [tests, setTests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_test: 0,
    published: 0,
    draft: 0,
    reviewed: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  const skillMap = useMemo(
    () => ({
      Reading: 'R',
      Listening: 'L',
      Speaking: 'S',
      Writing: 'W',
    }),
    [],
  );

  const StatusMap = useMemo(
    () => ({
      Publish: 'P',
      'In Review': 'I',
      Draft: 'D',
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

  // Compute a stable minHeight for the test grid to avoid layout jumps
  const columnsEarly = isMdUp ? 3 : isSmUp ? 2 : 1;
  const maxRowsForFullPage = Math.ceil(PAGE_SIZE / columnsEarly);
  // Cap reserved rows so minHeight doesn't become excessively large on very small screens
  const reservedRows = Math.min(maxRowsForFullPage, 3);
  const rowHeightEarly = isMdUp ? 320 : isSmUp ? 260 : 180; // estimated card heights per breakpoint
  const gapEarly = isMdUp ? 24 : 16;
  const gridMinHeightEarly = reservedRows * rowHeightEarly + (reservedRows - 1) * gapEarly;

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
      const params = {
        page: currentPage,
        page_size: PAGE_SIZE,
        mine: true,
      };

      if (searchQuery) params.search = searchQuery;
      if (levelFilter !== 'All Levels') params.level = levelFilter;
      if (skillFilter !== 'All Skills') params.skill = skillMap[skillFilter];
      if (statusFilter !== 'All Status') params.status = StatusMap[statusFilter];
      // Get ordering value from map, use default if not found
      params.ordering = orderingMap[sortBy] || '-created_at';

      const result = await getListTest(params);

      setTests(result?.results || []);
      setTotalCount(result?.count || 0);
    } catch (error) {
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchQuery,
    levelFilter,
    skillFilter,
    statusFilter,
    sortBy,
    skillMap,
    StatusMap,
    orderingMap,
  ]);

  // Call fetch when any filter changes
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const result = await getTeacherSummary();
        if (!cancelled && result) {
          setSummary({
            total_test: Number(result.total_test) || 0,
            published: Number(result.published) || 0,
            draft: Number(result.draft) || 0,
            reviewed: Number(result.reviewed) || 0,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setSummary({
            total_test: 0,
            published: 0,
            draft: 0,
            reviewed: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
  const displayName = user?.username || 'Teacher';
  const summaryCards = [
    {
      label: 'TOTAL TESTS',
      value: summary.total_test,
      helper: 'All time',
      tint: '#ffffff',
      border: 'rgba(148, 163, 184, 0.22)',
      icon: AssignmentOutlined,
      color: '#64748b',
    },
    {
      label: 'PUBLISHED',
      value: summary.published,
      helper: 'Active now',
      tint: '#fff',
      border: 'rgba(251, 146, 60, 0.22)',
      icon: SuccessIcon,
      color: 'success.main',
    },
    {
      label: 'DRAFTS',
      value: summary.draft,
      helper: 'In progress',
      tint: '#fff',
      border: 'rgba(245, 158, 11, 0.18)',
      icon: DraftIcon,
      color: 'primary.main',
    },
    {
      label: 'REVIEWS',
      value: summary.reviewed,
      helper: 'From others',
      tint: '#ffffff',
      border: 'rgba(148, 163, 184, 0.22)',
      icon: PendingIcon,
      color: 'warning.main',
    },
  ];

  // Use the early computed gridMinHeight (from hooks above)
  // Compute current page content height and prefer it when available to reduce gap
  const currentRows = Math.ceil(Math.max(tests.length || 0, 1) / columnsEarly);
  const currentContentHeight = currentRows * rowHeightEarly + (currentRows - 1) * gapEarly;
  // Prefer actual content height (when tests loaded) but don't exceed reserved gridMinHeight
  const gridMinHeight =
    tests && tests.length > 0
      ? Math.min(gridMinHeightEarly, currentContentHeight)
      : gridMinHeightEarly;

  return (
    <Box component="main" sx={styles.contentWrapper}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          mb: 4,
          borderRadius: 4,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,248,238,0.98) 100%)',
          border: '1px solid rgba(194, 122, 54, 0.10)',
          boxShadow: '0 18px 40px rgba(83, 40, 34, 0.06)',
          p: { xs: 2.5, md: 3 },
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 2,
            alignItems: { xs: 'flex-start', sm: 'center' },
            pt: 1,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: { xs: '1.5rem', md: '2.5rem' }, // nhỏ lại trên mobile
                  display: 'block',
                  fontFamily: 'Plus Jakarta Sans',
                  fontStyle: 'italic',
                }}
              >
                Welcome,
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: { xs: '2rem', md: '3.5rem' }, // nhỏ lại trên mobile
                  ml: 2,
                  display: 'block',
                  fontFamily: 'Clash Display',
                  color: 'warning.main',
                }}
              >
                {displayName}
              </Box>
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
                fontSize: { xs: '0.8rem', md: '1rem' }, // nhỏ lại trên mobile
                fontStyle: 'italic',
              }}
            >
              Manage and track all your tests in one place
            </Typography>
          </Box>

          <Link href="/teacher/upload-test" passHref>
            <Button variant="outlined" startIcon={<PlusIcon />} sx={styles.createBtn}>
              Create Test
            </Button>
          </Link>
        </Box>

        <Box
          sx={{
            mt: 1.5,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, // 2 cột trên mobile, 4 cột trên desktop
            gap: 2,
            width: '100%',
          }}
        >
          {summaryCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Box key={card.label}>
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: card.tint,
                    border: '1px solid',
                    borderColor: card.border,
                    boxShadow: '0 10px 24px rgba(83, 40, 34, 0.04)',
                    p: { xs: 1.5, md: 2.25 }, // padding nhỏ hơn trên mobile
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 16px 32px rgba(83, 40, 34, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        display: 'block',
                        color: 'text.secondary',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        lineHeight: 1.2,
                        flex: 1,
                        fontSize: { xs: '0.6rem', md: '0.75rem' }, // nhỏ lại trên mobile
                      }}
                    >
                      {card.label}
                    </Typography>
                    <IconComponent
                      sx={{
                        color: card.color,
                        opacity: 0.6,
                        fontSize: { xs: '1.1rem', md: '1.5rem' }, // nhỏ lại trên mobile
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2.25rem' }, // nhỏ lại trên mobile
                      lineHeight: 1,
                      fontWeight: 700,
                      color:
                        card.label === 'PUBLISHED'
                          ? 'success.main'
                          : card.label === 'REVIEWS'
                            ? 'warning.main'
                            : 'primary.main',
                      mb: 1,
                    }}
                  >
                    {summaryLoading ? <CircularProgress size={24} sx={{ my: 0.5 }} /> : card.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.7rem', md: '0.875rem' }, // nhỏ lại trên mobile
                    }}
                  >
                    {card.helper}
                  </Typography>
                </Box>
              </Box>
            );
          })}
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
            <MenuItem value="Publish">Publish</MenuItem>
            <MenuItem value="In Review">In Review</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
          </Select>

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
        </Box>
      </Box>

      <Box
        sx={{
          ...styles.testGrid,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: { xs: '16px', md: '24px' },
          mb: 3,
        }}
      >
        {loading ? (
          <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 10 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : tests.length > 0 ? (
          tests.map((test) => <TestCard key={test.id} {...test} onDelete={fetchTests} />)
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
