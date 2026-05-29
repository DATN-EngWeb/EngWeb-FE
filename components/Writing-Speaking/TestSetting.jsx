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
    <Paper id="tour-test-settings" sx={panelPaper}>
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
              <Typography
                variant="body2"
                color="text.primary"
                fontSize={{ xs: '0.75rem', md: '0.9rem' }}
                lineHeight={1.4}
                fontWeight={500}
                mb={0.5}
              >
                Min words <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                id="minWords"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
                sx={{
                  ...textInput,
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.7rem', md: '0.9rem' },
                  },
                }}
                placeholder="200"
                value={minWords ?? 200}
                onChange={(e) => {
                  const { value } = e.target;

                  if (value === '') {
                    onChange('minWords', '');
                    return;
                  }

                  const parsedValue = Number(value);
                  if (Number.isNaN(parsedValue)) return;

                  onChange('minWords', Math.max(0, parsedValue));
                }}
                size="small"
                error={errors?.minWords}
              />
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
