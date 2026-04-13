'use client';

import { useState, useEffect } from 'react';
import SkeletonStudentDashboard from './dashboardSkeleton';
import { Container, Box, Stack } from '@mui/material';
import LevelPointsPanel from '@/components/Dashboard/LevelPointsPanel';
import { getStudentProfile } from '@/api/accounts';
import { getUserProgressLevels } from '@/api/userProgress';
import {
  getListReceptiveTestHistory,
  getListProductiveTestHistory,
  getStatisticsForSkill,
} from '@/api/test';
import { useAuth } from '@/hooks/useAuth';
import OverallProgress from './overallProgress';
import StreakProgress from './streakProgress';
import ProgressHistory from './historyProgress';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
  const [filterLevelForTab, setFilterLevelForTab] = useState('A1');

  const [progressHistory, setProgressHistory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSkill, setFilterSkill] = useState('R');
  const [filterLevelForHistory, setFilterLevelForHistory] = useState('A1');
  const itemsPerPage = 20;

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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        setIsInitialMount(false);
      }
    };

    fetchProgressHistory();
  }, [filterSkill, currentPage, filterLevelForHistory]);

  if (isInitialMount) {
    return <SkeletonStudentDashboard />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 10, lg: 20 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
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
          <StreakProgress />
        </Stack>
        <Stack spacing={2}>
          <OverallProgress
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            historyData={historyData}
            statisticsData={statisticsData}
            filterLevelForTab={filterLevelForTab}
            setFilterLevelForTab={setFilterLevelForTab}
          />
          <ProgressHistory
            progressHistory={progressHistory}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            filterSkill={filterSkill}
            setFilterSkill={setFilterSkill}
            filterLevelForHistory={filterLevelForHistory}
            setFilterLevelForHistory={setFilterLevelForHistory}
          />
        </Stack>
      </Box>
    </Container>
  );
}
