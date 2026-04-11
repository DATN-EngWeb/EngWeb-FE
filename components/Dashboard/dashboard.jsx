'use client';

import { useState, useEffect } from 'react';
import SkeletonStudentDashboard from './dashboardSkeleton';
import { Container, Grid } from '@mui/material';
import {
  getListReceptiveTestHistory,
  getListProductiveTestHistory,
  getStatisticsForSkill,
} from '@/api/test';
import OverallProgress from './overallProgress';
import StreakProgress from './streakProgress';
import ProgressHistory from './historyProgress';

export default function StudentDashboard() {
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('READING');
  const [historyData, setHistoryData] = useState([]);
  const [statisticsData, setStatisticsData] = useState({});
  const [filterLevelForTab, setFilterLevelForTab] = useState('A1');

  const [progressHistory, setProgressHistory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSkill, setFilterSkill] = useState('R');
  const [filterLevelForHistory, setFilterLevelForHistory] = useState('A1');
  const itemsPerPage = 20;

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
    <Container maxWidth="lg" sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid
        container
        spacing={2}
        alignItems="start"
        justifyContent="space-between"
        sx={{
          flexDirection: { xs: 'column-reverse', sm: 'row' },
        }}
      >
        <Grid size={{ xs: 12, sm: 9 }}>
          <OverallProgress
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            historyData={historyData}
            statisticsData={statisticsData}
            filterLevelForTab={filterLevelForTab}
            setFilterLevelForTab={setFilterLevelForTab}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <StreakProgress />
        </Grid>
      </Grid>
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
    </Container>
  );
}
