'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ForumIcon from '@mui/icons-material/Forum';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useRouter } from 'next/navigation';
import { getTestOverview } from '../../api/tests';
import { useAuth } from '../../hooks/useAuth';
import { levelTheme } from '../TestCard';
import { formatDate } from '../../utils/stringFormat';

const SKILL_LABELS = {
  W: 'Writing',
  S: 'Speaking',
};

const LEVEL_OPTIONS = ['A2', 'B1', 'B2'];
const SKILL_OPTIONS = ['W', 'S'];

const FORMAT_LABELS = {
  A: 'Email',
  B: 'Article',
  C: 'Story',
  D: 'Essay',
  E: 'Letter',
  F: 'Reviews',
  G: 'Narrative',
  H: 'Description',
  I: 'Social argument',
  J: 'Read Aloud',
};

const FORMAT_THEME = {
  A: { bg: 'success.greenLight', text: 'success.green_dark' },
  B: { bg: 'info.light', text: 'info.dark' },
  C: { bg: 'success.highlight', text: 'success.main_dark' },
  D: { bg: 'background.paper', text: 'error.main' },
  E: { bg: 'text.gray', text: 'background.paper' },
  F: { bg: 'success.greenLight', text: 'success.main_dark' },
  G: { bg: 'success.highlight', text: 'success.main_dark' },
  H: { bg: 'error.main', text: 'background.paper' },
  I: { bg: 'purple.pastel', text: 'purple.main' },
  J: { bg: 'text.gray', text: 'warning.main' },
};

function extractYear(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return String(date.getFullYear());
}

const selectSx = {
  bgcolor: 'background.paper',
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  '& fieldset': { border: 'none' },
};

export default function ForumHub({
  getForumUrl,
  requireAuth = false,
  showMyPostsFilter = false,
  description = 'Browse all published tests.',
}) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, isLoading: authLoading } = useAuth(null);

  const [tests, setTests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [titleInput, setTitleInput] = useState('');

  const [filters, setFilters] = useState({
    title: '',
    year: 'all',
    level: 'all',
    skill: 'all',
    ordering: '-created_at',
    myPosts: 'all',
  });

  const yearOptions = ['all', 2025, 2026];

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((prev) => ({ ...prev, title: titleInput }));
      setPage(1);
    }, 500);
    return () => clearTimeout(handle);
  }, [titleInput]);

  useEffect(() => {
    let active = true;

    const fetchTests = async () => {
      setLoading(true);

      try {
        const params = {
          page,
          page_size: 6,
          ordering: filters.ordering,
          status: 'P',
          post_count: true,
        };

        if (filters.title) params.title = filters.title;
        if (filters.level !== 'all') params.level = filters.level;
        if (filters.skill !== 'all') params.skill = filters.skill;
        if (filters.year !== 'all') params.year = filters.year;
        if (showMyPostsFilter && isAuthenticated) {
          params.my_posts = filters.myPosts === 'mine';
        } else {
          params.type = 'P';
        }

        const response = await getTestOverview(params);
        const results = response?.results || [];
        const count = response?.count || 0;

        if (!active) return;

        setTests(results);
        setTotalPages(Math.ceil(count / 6) || 1);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load forum tests:', error);
        if (active) {
          setTests([]);
          setTotalPages(1);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTests();

    return () => {
      active = false;
    };
  }, [filters, page, showMyPostsFilter, isAuthenticated]);

  const handleViewForum = (test) => {
    const url = getForumUrl(test);
    if (requireAuth && !isAuthenticated) {
      router.push(`/login?role=student&redirect=${encodeURIComponent(url)}`);
      return;
    }
    router.push(url);
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Box
        component="main"
        sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px 24px',
          flex: 1,
          width: '100%',
        }}
      >
        <Grid container spacing={2} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {/* Sidebar filters */}
          <Grid
            item
            sx={{ width: { xs: '100%', md: '280px' }, flexShrink: { md: 0 }, display: 'block' }}
          >
            <Box
              sx={{
                backgroundColor: 'background.paper',
                p: { xs: 1.5, sm: 2 },
                borderRadius: 4,
                height: 'fit-content',
                position: { xs: 'relative', md: 'sticky' },
                top: { md: 24 },
                mb: { xs: 2, md: 0 },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
                <Box sx={{ width: 4, height: 24, bgcolor: 'warning.main', borderRadius: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  Search and Filter
                </Typography>
              </Stack>

              <Stack spacing={2.25}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Test name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Find test name"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
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
                    Year
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    sx={selectSx}
                  >
                    <MenuItem value="all">All years</MenuItem>
                    {yearOptions
                      .filter((y) => y !== 'all')
                      .map((year) => (
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
                  <Select
                    fullWidth
                    size="small"
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    sx={selectSx}
                  >
                    <MenuItem value="all">All levels</MenuItem>
                    {LEVEL_OPTIONS.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Skill
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={filters.skill}
                    onChange={(e) => handleFilterChange('skill', e.target.value)}
                    sx={selectSx}
                  >
                    <MenuItem value="all">All skills</MenuItem>
                    {SKILL_OPTIONS.map((skill) => (
                      <MenuItem key={skill} value={skill}>
                        {SKILL_LABELS[skill]}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {showMyPostsFilter && !authLoading && isAuthenticated && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      My participation
                    </Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={filters.myPosts}
                      onChange={(e) => handleFilterChange('myPosts', e.target.value)}
                      sx={selectSx}
                    >
                      <MenuItem value="all">All forums</MenuItem>
                      <MenuItem value="mine">Forums I&apos;ve posted in</MenuItem>
                    </Select>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Sort by
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={filters.ordering}
                    onChange={(e) => handleFilterChange('ordering', e.target.value)}
                    sx={selectSx}
                  >
                    <MenuItem value="-created_at">Newest First</MenuItem>
                    <MenuItem value="created_at">Oldest First</MenuItem>
                  </Select>
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Test cards */}
          <Grid item sx={{ flexGrow: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="h4"
                fontWeight={700}
                color="primary.main"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}
              >
                Forum by Test
              </Typography>
              <Typography color="text.secondary">{description}</Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr' },
                gap: { xs: 2, sm: 2.5, md: 3 },
                marginBottom: { xs: '32px', md: '48px' },
                minHeight: { xs: 'auto', md: '400px' },
                alignContent: 'start',
              }}
            >
              {loading ? (
                <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 10 }}>
                  <CircularProgress color="warning" />
                </Box>
              ) : tests.length > 0 ? (
                tests.map((test) => {
                  const currentLevelTheme = levelTheme[test.level] || levelTheme.A1;
                  const formatCode = test?.test_details?.format;
                  const formatText = FORMAT_LABELS[formatCode];
                  const currentFormatStyle = FORMAT_THEME[formatCode] || {
                    bg: currentLevelTheme.badge,
                    text: 'background.paper',
                  };
                  const skillLabel = SKILL_LABELS[test.skill] || test.skill || 'Unknown';

                  return (
                    <Card
                      key={test.id}
                      sx={{
                        backgroundColor: currentLevelTheme.bg,
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: currentLevelTheme.border,
                        p: { xs: 2, sm: 2.5, md: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <Box
                          sx={{
                            display: 'flex',
                            mb: 2,
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          {formatText && (
                            <Typography
                              sx={{
                                bgcolor: currentFormatStyle.bg,
                                color: currentFormatStyle.text,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                lineHeight: 1,
                              }}
                            >
                              {formatText}
                            </Typography>
                          )}
                          <Typography
                            sx={{
                              marginLeft: 'auto',
                              border: '1px solid',
                              borderColor: currentLevelTheme.badge,
                              color: currentLevelTheme.badge,
                              px: 1.2,
                              py: 0.4,
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              bgcolor: 'background.paper',
                              lineHeight: 1,
                            }}
                          >
                            Level {test.level || '--'}
                          </Typography>
                        </Box>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            mb: 0.5,
                            fontSize: '1rem',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 1,
                          }}
                        >
                          {test.title || 'Untitled test'}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            mb: 1.5,
                            lineHeight: 1.4,
                            fontSize: '0.8rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {test.description || 'No description provided.'}
                        </Typography>

                        <Divider
                          sx={{
                            borderStyle: 'dashed',
                            mb: 1,
                            borderColor: currentLevelTheme.border,
                            opacity: 0.3,
                          }}
                        />

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            justifyContent: 'space-between',
                            gap: { xs: 1, sm: 0 },
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}
                          >
                            {formatDate(test.created_at)}
                          </Typography>

                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1.5,
                              alignItems: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: currentLevelTheme.badge,
                                bgcolor: 'background.paper',
                                borderRadius: '999px',
                                py: 0.4,
                                px: 1.1,
                                border: '1px solid',
                                borderColor: currentLevelTheme.badge,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                              }}
                            >
                              <Typography
                                sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 0.2 }}
                              >
                                {skillLabel}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.65,
                                color: 'secondary.main',
                                bgcolor: 'background.paper',
                                borderRadius: '999px',
                                py: 0.4,
                                px: 1.1,
                                border: '1px solid',
                                borderColor: 'secondary.light',
                              }}
                            >
                              <ForumIcon sx={{ fontSize: '1rem' }} />
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                {test.post_count || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewForum(test)}
                          startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                          sx={{
                            bgcolor: 'background.paper',
                            color: currentLevelTheme.badge,
                            borderColor: currentLevelTheme.badge,
                            textTransform: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: currentLevelTheme.badge,
                              bgcolor: currentLevelTheme.badge,
                              color: 'background.paper',
                            },
                          }}
                        >
                          View forum
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
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
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
                size={isMobile ? 'small' : 'large'}
                siblingCount={0}
                boundaryCount={isMobile ? 1 : 2}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
