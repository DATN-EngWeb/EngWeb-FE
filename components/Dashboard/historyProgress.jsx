'use client';

import { useRef } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HistoryItem from '@/components/Dashboard/historyItem';

export default function ProgressHistory({
  progressHistory,
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  filterSkill,
  setFilterSkill,
  filterLevelForHistory,
  setFilterLevelForHistory,
}) {
  const historyRef = useRef(null);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
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
  );
}
