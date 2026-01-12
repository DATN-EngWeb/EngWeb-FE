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
} from '@mui/material';
import { InfoOutlined, ExpandLess, ExpandMore } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import {
  panelPaper,
  sectionHeader,
  accentBar,
  twoColRow,
} from '../../styles/Teacher/productive/ProductiveStyles';
import { getCriteria } from '../../api/test';

export default function BasicInformation({
  skill,
  testName,
  level,
  format,
  topics,
  onChange,
  errors,
}) {
  const [openCriteria, setOpenCriteria] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [criteriaData, setCriteriaData] = useState([]);
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
    if (skill !== 'W') return;
    const fetchCriteriaData = async () => {
      if (!level) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const data = await getCriteria(level, token);

        setCriteriaData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Fetch Error:', error);
        setCriteriaData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCriteriaData();
  }, [level, skill]);

  useEffect(() => {
    if (skill !== 'W') {
      setCriteriaData([]);
    }
  }, [skill]);

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
          mr: 5,
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
          <Box sx={{ ...accentBar, backgroundColor: 'warning.dark' }} />
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
                renderValue={(selected) => {
                  if (!selected) {
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
            <Typography variant="body2" mb={1}>
              Level <span style={{ color: 'red' }}>*</span>
            </Typography>
            <FormControl fullWidth size="small" error={errors?.level}>
              <Select
                value={level}
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

      {level && skill === 'W' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant="contained"
            color="warning"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <InfoOutlined />}
            onClick={() => setOpenCriteria(true)}
            disabled={loading}
            sx={{ textTransform: 'none', borderRadius: '8px', mt: 2 }}
          >
            {loading ? 'Loading...' : 'View Criteria'}
          </Button>
        </Box>
      )}

      {/* ===== CRITERIA MODAL ===== */}
      {skill === 'W' && (
        <Dialog open={openCriteria} onClose={() => setOpenCriteria(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
            Writing Criteria – Level {level}
          </DialogTitle>
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
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Content
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Organisation
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        Language
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criteriaData.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 'bold', color: 'orange' }}>
                          {item.band}
                        </TableCell>
                        <TableCell>{item.content}</TableCell>
                        <TableCell>{item.organisation}</TableCell>
                        <TableCell>{item.language}</TableCell>
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
      )}
    </Paper>
  );
}
