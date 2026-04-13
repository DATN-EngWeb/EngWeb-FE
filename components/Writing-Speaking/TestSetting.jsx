'use client';

import { Paper, Typography, TextField, Box, Button, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import {
  panelPaper,
  sectionHeader,
  accentBar,
  twoColRow,
  textInput,
} from '../../styles/Teacher/productive/ProductiveStyles';

export default function TestSetting({ skill, timeLimit, minWords, score, onChange, errors }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Paper sx={panelPaper}>
      <Box
        sx={{ ...sectionHeader, cursor: 'pointer' }}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box sx={accentBar} />
          <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
            Test settings
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {collapsed ? (
            <ExpandMore sx={{ color: 'primary.main' }} />
          ) : (
            <ExpandLess sx={{ color: 'primary.main' }} />
          )}
        </Box>
      </Box>

      <Collapse in={!collapsed}>
        <Box sx={{ ...twoColRow, pt: 1 }}>
          {skill === 'W' && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" mb={1}>
                Min words <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                id="minWords"
                fullWidth
                sx={textInput}
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
              sx={textInput}
              placeholder="30"
              type={'number'}
              value={score ?? 30}
              onChange={(e) => onChange('score', e.target.value)}
              size="small"
              error={errors?.score}
            />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
