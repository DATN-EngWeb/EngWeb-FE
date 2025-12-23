'use client';

import { Paper, Typography, TextField, Select, MenuItem, FormControl, Box } from '@mui/material';

export default function BasicInformation({ testName, level, onTestNameChange, onLevelChange }) {
  return (
    <Paper sx={{ p: 3, mb: 4, border: '2px solid', borderColor: 'yellow.main', borderRadius: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: '4px',
            height: '36px',
            backgroundColor: 'yellow.main',
            borderRadius: '1rem',
          }}
        />
        <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
          Basic information
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" mb={1}>
          Test name
        </Typography>
        <TextField
          id="testname"
          fullWidth
          placeholder="Enter test name"
          value={testName}
          onChange={(e) => onTestNameChange(e.target.value)}
          size="small"
        />
      </Box>

      <Box>
        <Typography variant="body2" mb={1}>
          Level
        </Typography>
        <FormControl fullWidth size="small" sx={{ borderRadius: '5px' }}>
          <Select value={level} onChange={(e) => onLevelChange(e.target.value)} displayEmpty>
            <MenuItem value="" disabled>
              Choose level
            </MenuItem>
            <MenuItem value="A1">A1</MenuItem>
            <MenuItem value="A2">A2</MenuItem>
            <MenuItem value="B1">B1</MenuItem>
            <MenuItem value="B2">B2</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
}
