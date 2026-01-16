'use client';
import { useState, useEffect, useCallback } from 'react';
import { getListTest } from '../../api/test';
import { ReviewTestPageStyles as styles } from '../../styles/Teacher/ReviewTest/ReviewTestPageStyles';
import RateReviewIcon from '@mui/icons-material/RateReview';
import FilterIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import WaitingIcon from '@mui/icons-material/HourglassBottom';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
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
  Link,
} from '@mui/material';
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
  const [error, setError] = useState(null);
  const [isMined, setIsMinded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [sortBy, setSortBy] = useState('All Status');
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const result = isMined
        ? await getListTest(token, true)
        : await getListTest(token, false, 'I');
      const testsArray = result?.results || [];
      setTests(testsArray);
    } catch (error) {
      setError('Failed to fetch tests. Please try again later.');
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [isMined]);

  useEffect(() => {
    setMounted(true);
    fetchTests();
  }, [isMined]);

  if (!mounted) return null;

  const options = isMined
    ? [
        { label: 'All Status', value: 'All Status' },
        { label: 'Published', value: 'Published' },
        { label: 'In Review', value: 'In Review' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Removed', value: 'Removed' },
      ]
    : [
        { label: 'All Status', value: 'All Status' },
        { label: 'Reviewed', value: 'Reviewed' },
        { label: 'Wait Review', value: 'Wait Review' },
      ];

  return (
    <Box component="main" sx={styles.contentWrapper}>
      <Box sx={styles.welcomeHeader}>
        <Typography variant="h1" sx={styles.welcomeTitle}>
          List Review Test
        </Typography>
        <Typography variant="body1" sx={styles.welcomeSub}>
          Review exam questions from colleagues or follow up on review requests from others.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 11 }}>
          <StatCard
            icon={<WaitingIcon fontSize="medium" sx={{ color: 'warning.dark' }} />}
            count="2"
            value="Waiting for Review"
            variant="purple"
          />
          <StatCard
            icon={<SendIcon fontSize="medium" sx={{ color: 'warning.dark' }} />}
            count="3"
            value="My test are waiting feedback"
            variant="yellow"
          />
          <StatCard
            icon={<CheckCircleIcon fontSize="medium" sx={{ color: 'success.dark' }} />}
            count="5"
            value="Has been reviewed"
            variant="green"
          />
        </Box>
      </Box>

      <Box sx={styles.filterSection}>
        <TextField
          placeholder="Search by test name or teacher"
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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            sx={styles.selectFilter}
            displayEmpty
            renderValue={(value) =>
              value === 'all' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> Status</Box>
              ) : (
                value
              )
            }
          >
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
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
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={styles.switcherWrapper}>
          <Stack direction="row" sx={styles.switcher} onClick={() => setIsMinded(!isMined)}>
            <Button
              disableElevation
              startIcon={<RateReviewIcon />}
              sx={{ ...styles.switchButton, ...(!isMined ? styles.switchActive : {}) }}
            >
              Waiting for Review
            </Button>

            <Button
              disableElevation
              startIcon={<AssignmentIndIcon />}
              sx={{
                ...styles.switchButton,
                ...(isMined ? styles.switchActive : {}),
              }}
              onClick={() => setIsMinded(true)}
            >
              My List Tests
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ mt: 4, mb: 15 }}>
        {isMined ? (
          <Paper>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : Array.isArray(tests) && tests.length > 0 ? (
              <TableContainer component={Box}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Test Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Skill
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Level
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Reviewed By
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Created At
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tests.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.skill}</TableCell>
                        <TableCell>{item.level}</TableCell>
                        <TableCell>{item.reviewedBy}</TableCell>
                        <TableCell>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.status === 'P'
                            ? 'Published'
                            : item.status === 'D'
                              ? 'Draft'
                              : item.status === 'I'
                                ? 'In Review'
                                : 'Removed'}
                        </TableCell>
                        <TableCell>
                          <Button>{item.status === 'I' ? 'View Test' : 'View Feedback'}</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ justifyContent: 'center', display: 'flex' }}>
                No test created.
              </Typography>
            )}
          </Paper>
        ) : (
          <Paper>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : Array.isArray(tests) && tests.length > 0 ? (
              <TableContainer component={Box}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Teacher
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Test Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Skill
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Level
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Created Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tests.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.created_by}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.skill}</TableCell>
                        <TableCell>{item.level}</TableCell>
                        <TableCell>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.status === 'P'
                            ? 'Published'
                            : item.status === 'D'
                              ? 'Draft'
                              : item.status === 'I'
                                ? 'In Review'
                                : 'Removed'}
                        </TableCell>
                        <TableCell>
                          <Button>{item.status === 'I' ? 'View Test' : 'View Feedback'}</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ justifyContent: 'center', display: 'flex' }}>
                No test wait for review.
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}
