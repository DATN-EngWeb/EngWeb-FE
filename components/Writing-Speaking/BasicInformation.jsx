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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useState, useEffect } from 'react';
import {
  panelPaper,
  sectionHeader,
  accentBar,
  twoColRow,
  textInput,
} from '../../styles/Teacher/productive/ProductiveStyles';
import { getCriteria } from '../../api/test';

export default function BasicInformation({
  skill,
  testName,
  level,
  timeLimit,
  format,
  topics,
  onChange,
  errors,
}) {
  const [openCriteria, setOpenCriteria] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [criteriaData, setCriteriaData] = useState([]);
  const isSpeaking = skill === 'S';
  const criteriaColumns = isSpeaking
    ? [
        { key: 'grammar_and_vocabulary', label: 'Grammar & Vocabulary' },
        { key: 'discourse_management', label: 'Discourse Management' },
        { key: 'pronunciation', label: 'Pronunciation' },
        { key: 'task_achievement', label: 'Task Achievement' },
      ]
    : [
        { key: 'content', label: 'Content' },
        { key: 'organisation', label: 'Organisation' },
        { key: 'language', label: 'Language' },
      ];
  const writingFormats = [
    { value: 'Email', label: 'Email' },
    { value: 'Article', label: 'Article' },
    { value: 'Story', label: 'Story' },
    { value: 'Essay', label: 'Essay' },
    { value: 'Letter', label: 'Letter' },
    { value: 'Reviews', label: 'Reviews' },
  ];

  const speakingFormats = [
    { value: 'Narrative', label: 'Narrative' },
    { value: 'Description', label: 'Description' },
    { value: 'Social Argument', label: 'Social Argument' },
    { value: 'Reading Aloud', label: 'Reading Aloud' },
  ];

  useEffect(() => {
    const fetchCriteriaData = async () => {
      if (!level || !skill) return;
      setLoading(true);
      try {
        const data = await getCriteria(skill, level);

        setCriteriaData(Array.isArray(data) ? data : []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Fetch Error:', error);
        setCriteriaData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCriteriaData();
  }, [level, skill]);

  useEffect(() => {
    if (skill !== 'W' && skill !== 'S') {
      setCriteriaData([]);
    }
  }, [skill]);

  return (
    <Paper sx={panelPaper}>
      {/* ===== HEADER ===== */}
      <Box
        sx={{ ...sectionHeader, cursor: 'pointer' }}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box sx={accentBar} />
          <Typography fontWeight={600} sx={{ color: 'primary.main' }}>
            Basic information
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
        <Box sx={{ pt: 1 }}>
          <Box sx={twoColRow}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="text.primary"
                fontSize={{ xs: '0.75rem', md: '0.9rem' }}
                lineHeight={1.4}
                fontWeight={500}
                mb={0.5}
              >
                Title <span style={{ color: 'red', ml: 0.4 }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                sx={{
                  ...textInput,
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.7rem', md: '0.9rem' },
                  },
                }}
                placeholder="Enter title"
                value={testName}
                onChange={(e) => onChange('testName', e.target.value)}
                error={errors?.testName}
              />
            </Box>
            <Box sx={{ flex: 0.4 }}>
              <Typography
                variant="body2"
                color="text.primary"
                fontSize={{ xs: '0.75rem', md: '0.9rem' }}
                lineHeight={1.4}
                fontWeight={500}
                mb={0.5}
              >
                Time <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                sx={{
                  ...textInput,
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.7rem', md: '0.9rem' },
                  },
                }}
                placeholder="Enter time"
                value={timeLimit ?? ''}
                onChange={(e) => onChange('timeLimit', e.target.value)}
                error={errors?.timeLimit}
              />
            </Box>
          </Box>

          <Box sx={twoColRow}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="text.primary"
                fontSize={{ xs: '0.75rem', md: '0.9rem' }}
                lineHeight={1.4}
                fontWeight={500}
                mb={0.5}
              >
                Format <span style={{ color: 'red' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={errors?.format} sx={textInput}>
                <Select
                  size="small"
                  value={format || ''}
                  onChange={(e) => onChange('format', e.target.value)}
                  displayEmpty
                  sx={{
                    ...textInput,
                    fontSize: { xs: '0.7rem', md: '0.9rem' },
                    '& .MuiSelect-select': {
                      fontSize: { xs: '0.7rem', md: '0.9rem' },
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '& .MuiSelect-icon': {
                      color: 'text.gray',
                      fontSize: '1.6rem',
                      right: '8px',
                      transition: 'transform 0.2s',
                    },
                    '& .MuiSelect-iconOpen': {
                      transform: 'rotate(180deg)',
                      color: 'text.primary',
                    },
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                  renderValue={(selected) => {
                    if (selected === '' || !selected) {
                      return <span style={{ color: '#a0a0a0' }}>Choose format</span>;
                    }
                    return selected;
                  }}
                >
                  <MenuItem value="" disabled placeholder="Enter title">
                    Choose format
                  </MenuItem>
                  {(skill === 'W' ? writingFormats : skill === 'S' ? speakingFormats : []).map(
                    (item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="text.primary"
                fontSize={{ xs: '0.75rem', md: '0.9rem' }}
                lineHeight={1.4}
                fontWeight={500}
                mb={0.5}
              >
                Level <span style={{ color: 'red' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={errors?.level} sx={textInput}>
                <Select
                  size="small"
                  value={level || ''}
                  sx={{
                    ...textInput,
                    fontSize: { xs: '0.7rem', md: '0.9rem' },
                    '& .MuiSelect-select': {
                      fontSize: { xs: '0.7rem', md: '0.9rem' },
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '& .MuiSelect-icon': {
                      color: 'text.gray',
                      fontSize: '1.6rem',
                      right: '8px',
                      transition: 'transform 0.2s',
                    },
                    '& .MuiSelect-iconOpen': {
                      transform: 'rotate(180deg)',
                      color: 'text.primary',
                    },
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                  onChange={(e) => onChange('level', e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span style={{ color: '#a0a0a0' }}>Choose level</span>;
                    }
                    return selected;
                  }}
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
            <Typography
              variant="body2"
              color="text.primary"
              fontSize={{ xs: '0.75rem', md: '0.9rem' }}
              lineHeight={1.4}
              fontWeight={500}
              mb={0.5}
            >
              Topics <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g., Films"
              value={topics || ''}
              onChange={(e) => onChange('topics', e.target.value)}
              error={errors?.topics}
              sx={{
                ...textInput,
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.7rem', md: '0.9rem' },
                },
              }}
            />
          </Box>

          {level && criteriaData.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : <OpenInNewIcon />
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCriteria(true);
                }}
                disabled={loading}
                sx={{ textTransform: 'none', borderRadius: '8px', mt: 2 }}
              >
                {loading ? 'Loading...' : 'View Criteria'}
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>

      {/* ===== CRITERIA MODAL ===== */}

      <Dialog open={openCriteria} onClose={() => setOpenCriteria(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          {isSpeaking ? 'Speaking Criteria' : 'Writing Criteria'} – Level {level}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpenCriteria(false)}
          sx={{
            position: 'absolute',
            right: 1,
            top: 1,
            color: 'primary.main',
          }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : Array.isArray(criteriaData) && criteriaData.length > 0 ? (
            <TableContainer component={Box}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                      Band
                    </TableCell>
                    {criteriaColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {criteriaData.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontWeight: 'bold', color: 'orange' }}>
                        {item.band}
                      </TableCell>
                      {criteriaColumns.map((column) => (
                        <TableCell key={column.key}>{item[column.key]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No criteria data found.</Typography>
          )}
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
