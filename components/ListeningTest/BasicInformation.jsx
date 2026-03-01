'use client';

import { Paper, Typography, TextField, Select, MenuItem, FormControl, Box } from '@mui/material';
import {
  panelPaper,
  sectionHeader,
  accentBar,
  twoColRow,
  labelText,
  textInput,
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
          <Typography sx={{ ...labelText, mb: 0.5 }}>
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
            sx={textInput}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ ...labelText, mb: 0.5 }}>
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
            sx={textInput}
          />
        </Box>
      </Box>

      <Box>
        <Typography sx={{ ...labelText, mb: 0.5 }}>
          Level <span style={{ color: 'red' }}>*</span>
        </Typography>
        <FormControl
          fullWidth
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '1rem',
              height: 44,
              fontSize: { xs: '0.7rem', md: '0.9rem' },
            },
            '& .MuiSelect-select': {
              py: 1,
              display: 'flex',
              alignItems: 'center',
            },
          }}
          error={errors?.level}
        >
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
        <Typography sx={{ ...labelText, mb: 0.5 }}>
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
          sx={textInput}
        />
      </Box>
    </Paper>
  );
}
