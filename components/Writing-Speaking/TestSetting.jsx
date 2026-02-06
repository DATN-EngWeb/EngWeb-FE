'use client';

import { Paper, Typography, TextField, Box, Button } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import {
  panelPaper,
  sectionHeader,
  accentBar,
  twoColRow,
} from '../../styles/Teacher/productive/ProductiveStyles';

export default function TestSetting({ skill, timeLimit, minWords, score, onChange, errors }) {
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
        Edit Test Settings
      </Button>
    );
  }

  return (
    <Paper sx={panelPaper}>
      <Box sx={sectionHeader}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box sx={{ ...accentBar, backgroundColor: 'success.main' }} />
          <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
            Test settings
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

      <Box sx={twoColRow}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" mb={1}>
            Time (minutes) <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            id="timeLimit"
            fullWidth
            placeholder="30"
            value={timeLimit ?? 30}
            type={'number'}
            onChange={(e) => onChange('timeLimit', e.target.value)}
            size="small"
            error={errors?.timeLimit}
          />
        </Box>
        {skill === 'W' && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" mb={1}>
              Min words <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              id="minWords"
              fullWidth
              placeholder="200"
              type={'number'}
              value={minWords ?? 200}
              onChange={(e) => onChange('minWords', e.target.value)}
              size="small"
              error={errors?.minWords}
            />
          </Box>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" mb={1}>
            Score <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            id="score"
            fullWidth
            placeholder="30"
            type={'number'}
            value={score ?? 30}
            onChange={(e) => onChange('score', e.target.value)}
            size="small"
            error={errors?.score}
          />
        </Box>
      </Box>
    </Paper>
  );
}
