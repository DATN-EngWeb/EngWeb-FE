'use client';

import { Paper, Typography, TextField, Select, MenuItem, FormControl, Box } from '@mui/material';
import {
  panelPaper,
  sectionHeader,
  accentBar,
  twoColRow,
} from '../../styles/Teacher/Listening/ListeningStyles';

export default function BasicInformation({ testName, level, time, description, onChange, errors }) {
  return (
    <Paper sx={panelPaper}>
      <Box sx={sectionHeader}>
        <Box sx={accentBar} />
        <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
          Basic information
        </Typography>
      </Box>

      <Box sx={twoColRow}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" mb={1}>
            Title <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            id="testname"
            fullWidth
            placeholder="Enter title"
            value={testName}
            onChange={(e) => onChange('testName', e.target.value)}
            size="small"
            error={errors?.testName}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" mb={1}>
            Time (minutes) <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder="Enter time in minutes"
            value={time ?? ''}
            onChange={(e) => onChange('time', e.target.value)}
            error={errors?.time}
          />
        </Box>
      </Box>

      <Box>
        <Typography variant="body2" mb={1}>
          Level <span style={{ color: 'red' }}>*</span>
        </Typography>
        <FormControl fullWidth size="small" sx={{ borderRadius: '5px' }} error={errors?.level}>
          <Select value={level} onChange={(e) => onChange('level', e.target.value)} displayEmpty>
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

      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="body2" mb={1}>
          Description <span style={{ color: 'red' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Enter test description"
          value={description ?? ''}
          onChange={(e) => onChange('description', e.target.value)}
          error={errors?.description}
        />
      </Box>
    </Paper>
  );
}
