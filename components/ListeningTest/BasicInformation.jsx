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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function BasicInformation({ testName, level, time, description, onChange }) {
  return (
    <Paper sx={{ ...panelPaper, mb: 0, p: { xs: 2, md: 3 } }}>
      <Box sx={{ ...sectionHeader, gap: 2 }}>
        <Box sx={accentBar} />
        <Typography
          fontWeight={600}
          sx={{ color: 'primary.main', fontSize: { xs: '1rem', md: '1.2rem' } }}
        >
          Basic infomation
        </Typography>
      </Box>

      <Box sx={twoColRow}>
        <Box>
          <Typography sx={{ ...labelText, mb: 0.5 }}>
            Test title <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            id="testname"
            fullWidth
            placeholder="Enter test title here"
            value={testName}
            onChange={(e) => onChange('testName', e.target.value)}
            size="small"
            sx={textInput}
          />
        </Box>
        <Box>
          <Typography sx={{ ...labelText, mb: 0.5 }}>
            Time <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder="60"
            value={time ?? ''}
            onChange={(e) => onChange('time', e.target.value)}
            sx={textInput}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ ...labelText, mb: 0.5 }}>
          Description <span style={{ color: 'red' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter description here"
          value={description ?? ''}
          onChange={(e) => onChange('description', e.target.value)}
          sx={textInput}
        />
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
              fontSize: { xs: '0.7rem', md: '0.9rem' },
            },
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          <Select
            value={level}
            onChange={(e) => onChange('level', e.target.value)}
            displayEmpty
            sx={{
              '& .MuiSelect-icon': {
                color: 'text.gray',
                fontSize: '1.6rem',
                right: '12px',
                transition: 'transform 0.2s',
              },
              '& .MuiSelect-iconOpen': {
                color: 'text.primary',
                transform: 'rotate(180deg)',
              },
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
            IconComponent={KeyboardArrowDownIcon}
          >
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
