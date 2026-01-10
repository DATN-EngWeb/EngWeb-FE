'use client';

import {
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { InfoOutlined, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useState } from 'react';

import {
  panelPaper,
  sectionHeader,
  accentBar,
  twoColRow,
} from '../../styles/Teacher/writing/WritingStyles';

const CRITERIA_DATA = {
  A1: 'Criteria for A1: Focus on basic vocabulary and simple sentence structures...',
  A2: 'Criteria for A2: Focus on routine tasks and direct exchange of information...',
  B1: 'Criteria for B1: Focus on main points of clear standard input on familiar matters...',
  B2: 'Criteria for B2: Focus on complex text, technical discussions, and fluency...',
};

export default function BasicInformation({ testName, level, format, topics, onChange, errors }) {
  const [openCriteria, setOpenCriteria] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <Button
        size="small"
        variant="outlined"
        onClick={() => setCollapsed(false)}
        sx={{
          mb: 2,
          alignSelf: 'flex-start',
          textTransform: 'none',
        }}
      >
        Edit Basic Information
      </Button>
    );
  }

  return (
    <Paper sx={panelPaper}>
      {/* ===== HEADER ===== */}
      <Box sx={sectionHeader}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box sx={accentBar} />
          <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
            Basic information
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setCollapsed((prev) => !prev)}
            startIcon={collapsed ? <ExpandMore /> : <ExpandLess />}
            sx={{ textTransform: 'none' }}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </Button>
        </Box>
      </Box>

      <Box>
        <Box sx={twoColRow}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" mb={1}>
              Title <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter title"
              value={testName}
              onChange={(e) => onChange('testName', e.target.value)}
              error={errors?.testName}
            />
          </Box>
        </Box>

        <Box sx={twoColRow}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" mb={1}>
              Format <span style={{ color: 'red' }}>*</span>
            </Typography>
            <FormControl fullWidth size="small" error={errors?.format}>
              <Select
                value={format}
                onChange={(e) => onChange('format', e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Choose format
                </MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="article">Article</MenuItem>
                <MenuItem value="story">Story</MenuItem>
                <MenuItem value="essay">Essay</MenuItem>
                <MenuItem value="letter">Letter</MenuItem>
                <MenuItem value="reviews">Reviews</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" mb={1}>
              Level <span style={{ color: 'red' }}>*</span>
            </Typography>
            <FormControl fullWidth size="small" error={errors?.level}>
              <Select
                value={level}
                onChange={(e) => onChange('level', e.target.value)}
                displayEmpty
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
        </Box>

        <Box>
          <Typography variant="body2" mb={1}>
            Topics <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g., Films"
            value={topics}
            onChange={(e) => onChange('topics', e.target.value)}
            error={errors?.topics}
            sx={{ mb: 2 }}
          />
        </Box>
      </Box>

      {level && format && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant="contained"
            color="warning"
            startIcon={<InfoOutlined />}
            onClick={() => setOpenCriteria(true)}
            sx={{ textTransform: 'none', borderRadius: '8px', mgt: 2 }}
          >
            View Criteria
          </Button>
        </Box>
      )}

      {/* ===== CRITERIA MODAL ===== */}
      <Dialog open={openCriteria} onClose={() => setOpenCriteria(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          Writing Criteria – Level {level}
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ whiteSpace: 'pre-line' }}>
            {CRITERIA_DATA[level] || 'No criteria available.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCriteria(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
