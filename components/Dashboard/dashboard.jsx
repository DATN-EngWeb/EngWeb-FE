'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import SkeletonStudentDashboard from './dashboardSkeleton';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Tooltip,
  Stack,
  Pagination,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { listeningtestStyles } from '@/styles/student/Listening/listeningTestStyles';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ProgressTracking from '@/components/Dashboard/progressTracking';
import HistoryItem from '@/components/Dashboard/historyItem';
import LevelPointsPanel from '@/components/Dashboard/LevelPointsPanel';
import { getStudentProfile } from '@/api/accounts';
import { getUserProgressLevels } from '@/api/userProgress';
import {
  getListReceptiveTestHistory,
  getListProductiveTestHistory,
  getStatisticsForSkill,
} from '@/api/test';
import { minutesToHour } from '@/utils/stringFormat';
import { useAuth } from '@/hooks/useAuth';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const statCardStyle = {
  p: 1,
  borderRadius: 4,
  textAlign: 'center',
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'start',
  alignItems: 'center',
  border: '1px solid',
  borderColor: 'divider',
  transition: '0.3s',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    borderColor: 'primary.light',
  },
};

const StatItem = ({ icon: Icon, label, value, helpText, unit }) => (
  <Paper variant="outlined" sx={statCardStyle}>
    <Tooltip title={helpText || 'Thông tin thêm'} placement="top">
      <HelpOutlineIcon
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          fontSize: { xs: '1rem', md: '1.2rem' },
          color: 'text.disabled',
          cursor: 'help',
        }}
      />
    </Tooltip>

    <Box
      sx={{
        bgcolor: 'primary.lighter',
        p: { xs: 1, md: 1.5 },
        borderRadius: '50%',
        display: 'flex',
      }}
    >
      <Icon sx={{ fontSize: { xs: 24, md: 28 }, color: 'primary.main' }} />
    </Box>
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontWeight: 600,
        mb: 0.5,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="h5"
      sx={{ fontWeight: 800, color: 'primary.main', fontSize: { xs: 16, md: 20 } }}
    >
      {value}
      {unit && (
        <span style={{ fontSize: '0.8em', marginLeft: '2px', fontWeight: 600 }}>{unit}</span>
      )}
    </Typography>
  </Paper>
);

export default function StudentDashboard() {
  const { user } = useAuth(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('READING');
  const [historyData, setHistoryData] = useState([]);
  const [statisticsData, setStatisticsData] = useState({});
  const [studentProfile, setStudentProfile] = useState(null);
  const [userLevels, setUserLevels] = useState([]);
  const [isLevelLoading, setIsLevelLoading] = useState(true);
  const router = useRouter();
  const historyRef = useRef(null);
  const tabs = [
    { id: 'READING', label: 'READING', icon: <MenuBookOutlinedIcon fontSize="small" /> },
    { id: 'LISTENING', label: 'LISTENING', icon: <HeadsetMicIcon fontSize="small" /> },
    { id: 'WRITING', label: 'WRITING', icon: <EditOutlinedIcon fontSize="small" /> },
    { id: 'SPEAKING', label: 'SPEAKING', icon: <CampaignOutlinedIcon fontSize="small" /> },
  ];
  const [filterLevelForTab, setFilterLevelForTab] = useState('A1');

  const [progressHistory, setProgressHistory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSkill, setFilterSkill] = useState('R');
  const [filterLevelForHistory, setFilterLevelForHistory] = useState('A1');
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const fallbackStudentId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const studentId = user?.id || fallbackStudentId;

  const currentLevel =
    studentProfile?.level ||
    userLevels.find((item) => item.id === studentProfile?.level?.id) ||
    null;
  const cumulativePoint = studentProfile?.cumulative_point || 0;
  const sortedLevels = [...userLevels].sort((a, b) => (a.min_xp || 0) - (b.min_xp || 0));

  const nextLevel = sortedLevels.find((item) => (item.min_xp || 0) > cumulativePoint) || null;
  const currentLevelMinXp = currentLevel?.min_xp || 0;
  const currentLevelMaxXp = currentLevel?.max_xp || 0;
  const currentLevelRange = Math.max(currentLevelMaxXp - currentLevelMinXp, 1);
  const currentLevelProgress = currentLevel
    ? clamp(((cumulativePoint - currentLevelMinXp) / currentLevelRange) * 100, 0, 100)
    : 0;
  const pointsToNextLevel = nextLevel ? Math.max((nextLevel.min_xp || 0) - cumulativePoint, 0) : 0;

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const skillMap = {
          READING: 'R',
          LISTENING: 'L',
          WRITING: 'W',
          SPEAKING: 'S',
        };
        const skill = skillMap[activeTab];

        const statsPromise = getStatisticsForSkill(skill, filterLevelForTab);

        const statsResponse = await statsPromise;

        if (statsResponse) {
          setStatisticsData(statsResponse);
          setHistoryData(statsResponse?.last_30_attempts || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
        setIsInitialMount(false);
      }
    };

    fetchData();
  }, [activeTab, filterLevelForTab]);

  useEffect(() => {
    const fetchStudentLevelData = async () => {
      if (!studentId) {
        setIsLevelLoading(false);
        return;
      }

      setIsLevelLoading(true);
      try {
        const [profileResponse, levelsResponse] = await Promise.all([
          getStudentProfile(studentId),
          getUserProgressLevels(),
        ]);

        setStudentProfile(profileResponse || null);
        setUserLevels(Array.isArray(levelsResponse) ? levelsResponse : []);
      } catch (error) {
        console.error('Error fetching student level data:', error);
        setStudentProfile(null);
        setUserLevels([]);
      } finally {
        setIsLevelLoading(false);
      }
    };

    fetchStudentLevelData();
  }, [studentId]);

  useEffect(() => {
    const fetchProgressHistory = async () => {
      setIsLoading(true);
      try {
        let res;
        if (filterSkill === 'R' || filterSkill === 'L') {
          res = await getListReceptiveTestHistory(
            'S',
            filterSkill,
            currentPage,
            itemsPerPage,
            filterLevelForHistory,
          );
        } else {
          res = await getListProductiveTestHistory(
            'S',
            filterSkill,
            currentPage,
            itemsPerPage,
            filterLevelForHistory,
          );
        }

        if (res) {
          setProgressHistory(res.results || []);
          setTotalItems(res.count || 0);
        }
      } catch (error) {
        setProgressHistory([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressHistory();
  }, [filterSkill, currentPage, filterLevelForHistory]);

  if (isInitialMount) {
    return <SkeletonStudentDashboard />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 10, md: 20 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <LevelPointsPanel
          isLevelLoading={isLevelLoading}
          currentLevel={currentLevel}
          cumulativePoint={cumulativePoint}
          currentLevelProgress={currentLevelProgress}
          nextLevel={nextLevel}
          pointsToNextLevel={pointsToNextLevel}
          sortedLevels={sortedLevels}
          currentLevelId={studentProfile?.level?.id}
        />

        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              gap: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: '1rem',
            }}
          >
            <Typography
              variant="h1"
              sx={{ fontWeight: 800, color: 'primary.main', fontSize: { xs: 20, md: 24 } }}
            >
              Overall progress
            </Typography>
            {/* Header Tabs */}
            <Box
              sx={{
                display: { xs: 'grid', md: 'flex' },
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'none' },
                justifyContent: { xs: 'center', md: 'space-between' },
                flexWrap: { md: 'wrap' },
                alignItems: { md: 'center' },
                gap: 1,
                width: '100%',
              }}
            >
              <Stack
                direction="row"
                gap={1}
                sx={{ display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap', flex: 1, minWidth: 0 }}
              >
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disableElevation
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      px: { xs: 1, sm: 3 },
                      py: 1,
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      width: { xs: '100%', sm: 'auto' },
                      borderStyle: { xs: 'solid', sm: 'none' },
                      borderWidth: { xs: '1.5px', sm: 0 },
                      borderColor: 'yellow.main',
                      ...(activeTab === tab.id
                        ? {
                            bgcolor: 'yellow.main',
                            color: 'primary.main',
                          }
                        : {
                            bgcolor: 'transparent',
                            color: 'primary.main',
                            '&:hover': { bgcolor: 'action.hover' },
                          }),
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </Button>
                ))}
              </Stack>

              <FormControl size="small" sx={{ minWidth: 120, display: { xs: 'flex', md: 'none' } }}>
                <Select
                  value={activeTab}
                  onChange={(e) => {
                    setActiveTab(e.target.value);
                  }}
                  displayEmpty
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    color: 'primary.main',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '& .MuiSelect-icon': {
                      transition: 'transform 0.2s ease-in-out',
                    },
                    '& .MuiSelect-iconOpen': {
                      transform: 'rotate(180deg)',
                    },
                  }}
                >
                  {tabs.map((tab) => (
                    <MenuItem key={tab.id} value={tab.id}>
                      {tab.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filterLevelForTab}
                  onChange={(e) => {
                    setFilterLevelForTab(e.target.value);
                  }}
                  displayEmpty
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    color: 'primary.main',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '& .MuiSelect-icon': {
                      transition: 'transform 0.2s ease-in-out',
                    },
                    '& .MuiSelect-iconOpen': {
                      transform: 'rotate(180deg)',
                    },
                  }}
                >
                  <MenuItem value="A1">A1</MenuItem>
                  <MenuItem value="A2">A2</MenuItem>
                  <MenuItem value="B1">B1</MenuItem>
                  <MenuItem value="B2">B2</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {/* Content Area */}
            <Box
              sx={{
                width: '100%',
                bgcolor: 'background.gray',
                borderRadius: '1rem',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1, md: 2 },
                p: 2,
              }}
            >
              {historyData.length === 0 ? (
                <Stack spacing={1} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    You haven't taken any test yet.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    How about give it a try?
                  </Typography>
                  <Button
                    variant="contained"
                    disableElevation
                    sx={listeningtestStyles.submitButton}
                    onClick={() => router.push(`/student/${activeTab.toLowerCase()}`)}
                  >
                    Take a free test
                  </Button>
                </Stack>
              ) : (
                <>
                  <ProgressTracking
                    historyData={historyData}
                    type={activeTab === 'READING' || activeTab === 'LISTENING' ? 'R' : 'P'}
                    activeTab={activeTab}
                  />
                  {/* ------------------ 4grid Thông tin ------------------ */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                      gap: { xs: 1, md: 2 },
                      width: '100%',
                    }}
                  >
                    <StatItem
                      icon={TrendingUpIcon}
                      label="Average score"
                      value={`${statisticsData?.average_score || 0}`}
                      helpText="Average score based on all tests"
                    />
                    <StatItem
                      icon={AssignmentOutlinedIcon}
                      label="Completed tests"
                      value={`${statisticsData?.completed_tests_count}`}
                      helpText="Number of completed tests"
                    />
                    <StatItem
                      icon={AccessTimeOutlinedIcon}
                      label="Average time"
                      value={
                        statisticsData?.average_completion_time > 120
                          ? minutesToHour(statisticsData.average_completion_time)
                          : `${statisticsData?.average_completion_time || 0}`
                      }
                      unit={statisticsData?.average_completion_time > 120 ? 'hours' : 'minutes'}
                      helpText="Average time per test"
                    />
                    <StatItem
                      icon={TrackChangesIcon}
                      label="Accuracy"
                      value={`${statisticsData?.accuracy || 0}%`}
                      helpText="Average accuracy based on all tests"
                    />
                  </Box>
                </>
              )}
            </Box>
          </Paper>
          <Paper
            ref={historyRef}
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              gap: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: '1rem',
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: '100%' }}
            >
              <Typography
                variant="h1"
                sx={{ fontWeight: 800, color: 'primary.main', fontSize: { xs: 20, md: 24 } }}
              >
                Progress history
              </Typography>
              <Stack direction="row" gap={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: { xs: 80, sm: 120 } }}>
                  <Select
                    value={filterLevelForHistory}
                    onChange={(e) => {
                      setFilterLevelForHistory(e.target.value);
                    }}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      color: 'primary.main',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'divider',
                      },
                      '& .MuiSelect-icon': {
                        transition: 'transform 0.2s ease-in-out',
                      },
                      '& .MuiSelect-iconOpen': {
                        transform: 'rotate(180deg)',
                      },
                    }}
                  >
                    <MenuItem value="A1">A1</MenuItem>
                    <MenuItem value="A2">A2</MenuItem>
                    <MenuItem value="B1">B1</MenuItem>
                    <MenuItem value="B2">B2</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filterSkill}
                    onChange={(e) => {
                      setFilterSkill(e.target.value);
                      setCurrentPage(1);
                    }}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      color: 'primary.main',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'divider',
                      },
                      '& .MuiSelect-icon': {
                        transition: 'transform 0.2s ease-in-out',
                      },
                      '& .MuiSelect-iconOpen': {
                        transform: 'rotate(180deg)',
                      },
                    }}
                  >
                    <MenuItem value="R">Reading</MenuItem>
                    <MenuItem value="L">Listening</MenuItem>
                    <MenuItem value="W">Writing</MenuItem>
                    <MenuItem value="S">Speaking</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                width: '100%',
              }}
            >
              {progressHistory.length > 0 ? (
                progressHistory.map((test, _index) => (
                  <HistoryItem key={test.id} data={test} filterSkill={filterSkill} />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No submissions yet.
                </Typography>
              )}
            </Box>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, width: '100%' }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  variant="outlined"
                  shape="rounded"
                />
              </Box>
            )}
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
