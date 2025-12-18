'use client';

import React, { useState, useMemo } from 'react';
import Header from '../../components/Home/Header';
import Footer from '../../components/Home/Footer';
import TestCard from '../../components/TestCard.jsx';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Button,
  IconButton,
} from '@mui/material';
import {
  MenuBook as LibraryIcon,
  AutoAwesome as SparklesIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as PlusIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { TeacherHomepageStyles as styles } from '../../styles/Teacher/TeacherHomepageStyles.js';

const StatCard = ({ icon, value, variant }) => (
  <Box sx={styles.statBadge(variant)}>
    <Typography component="span" sx={{ fontSize: '1.2rem' }}>
      {icon}
    </Typography>
    {value}
  </Box>
);

export default function TeacherHomepage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [sortBy, setSortBy] = useState('Newest List');
  const [currentPage, setCurrentPage] = useState(1);

  const mockTests = [
    {
      id: 1,
      title: 'Writing Test Name',
      description: 'Short quiz to evaluate your understanding of basic concepts',
      skill: 'Writing',
      date: '2024-01-15',
      submissions: 24,
      format: 'Essay',
      level: 'A1',
    },
    {
      id: 2,
      title: 'Speaking Test Name',
      description: 'Short quiz to evaluate your understanding of basic concepts',
      skill: 'Speaking',
      date: '2024-01-15',
      submissions: 24,
      format: 'Individual speaking',
      level: 'A2',
    },
    {
      id: 3,
      title: 'Listening Test Name',
      description: 'Short quiz to evaluate your understanding of basic concepts',
      skill: 'Listening',
      date: '2024-01-15',
      submissions: 24,
      level: 'B2',
    },
    {
      id: 4,
      title: 'Reading Test Name',
      description: 'Short quiz to evaluate your understanding of basic concepts',
      skill: 'Reading',
      date: '2024-01-15',
      submissions: 24,
      level: 'B1',
    },
    {
      id: 5,
      title: 'Listening Test Name',
      description: 'Short quiz to evaluate your understanding of basic concepts',
      skill: 'Listening',
      date: '2024-01-15',
      submissions: 24,
      level: 'B2',
    },
    {
      id: 6,
      title: 'Writing Test Name',
      description: 'Short quiz to evaluate your understanding of basic concepts',
      skill: 'Writing',
      date: '2024-01-15',
      submissions: 24,
      format: 'Translate',
      level: 'A2',
    },
  ];

  const filteredAndSortedTests = useMemo(() => {
    let result = [...mockTests];

    // 1. Filter by Search Query
    if (searchQuery) {
      result = result.filter((test) =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // 2.Filter by Skill
    if (skillFilter !== 'All Skills') {
      result = result.filter((test) => {
        return test.skill && test.skill.includes(skillFilter);
      });
    }

    // 3. Filter by Level
    if (levelFilter !== 'All Levels') {
      result = result.filter((test) => test.level === levelFilter);
    }

    // 4. (Sort)
    result.sort((a, b) => {
      if (sortBy === 'Newest List') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'Oldest List') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === 'Most Submissions') {
        return b.submissions - a.submissions;
      }
      return 0;
    });

    return result;
  }, [searchQuery, skillFilter, levelFilter, sortBy]);

  return (
    <Box sx={styles.mainContainer}>
      <Header />

      <Box component="main" sx={styles.contentWrapper}>
        {/* Welcome Section */}
        <Box sx={styles.welcomeHeader}>
          <Typography variant="h1" sx={styles.welcomeTitle}>
            Welcome to Teacher homepage
          </Typography>
          <Typography variant="body1" sx={styles.welcomeSub}>
            Manage and track all your tests in one place
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <StatCard
              icon={<LibraryIcon fontSize="medium" sx={{ color: 'warning.dark' }} />}
              value="120+ tests"
              variant="yellow"
            />
            <StatCard
              icon={<SparklesIcon fontSize="medium" sx={{ color: 'warning.dark' }} />}
              value="162 total submissions"
              variant="green"
            />
          </Box>
        </Box>

        {/* Search and Filters */}
        <Box sx={styles.filterSection}>
          <TextField
            placeholder="Search by name or topic"
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

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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

            <Button variant="contained" startIcon={<PlusIcon />} sx={styles.createBtn}>
              Create Test
            </Button>
          </Box>
        </Box>

        {/* Test Cards Grid */}
        <Box sx={styles.testGrid}>
          {filteredAndSortedTests.length > 0 ? (
            filteredAndSortedTests.map((test) => <TestCard key={test.id} {...test} />)
          ) : (
            <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', py: 12 }}>
              No tests found matching your filters.
            </Typography>
          )}
        </Box>

        {/* Pagination */}
        <Box sx={styles.paginationContainer}>
          <IconButton onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft />
          </IconButton>

          {[1, 2, 3].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'contained' : 'text'}
              onClick={() => setCurrentPage(page)}
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '8px',
                bgcolor: currentPage === page ? 'warning.light' : 'transparent',
                color: 'primary.dark',
                '&:hover': {
                  bgcolor: currentPage === page ? 'yellow.main' : 'primary.contrastText',
                },
              }}
            >
              {page}
            </Button>
          ))}
          <Typography sx={{ color: 'primary.dark', px: 1 }}>...</Typography>
          <Button sx={{ minWidth: 40, color: 'primary.dark', '&:hover': 'primary.contrastText' }}>
            10
          </Button>

          <IconButton onClick={() => setCurrentPage((p) => Math.min(10, p + 1))}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
