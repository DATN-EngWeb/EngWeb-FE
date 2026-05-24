'use client';

import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  InputAdornment,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const filterSidebarStyles = {
  backgroundColor: 'background.paper',
  p: 2,
  borderRadius: 4,
  height: 'fit-content',
  position: 'sticky',
  top: 24,
};

const inputSx = {
  bgcolor: 'background.paper',
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  fontSize: 14,
  '& fieldset': { border: 'none' },
};

const dropdownMenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 150,
      '& .MuiMenuItem-root': {
        fontSize: 14,
      },
    },
  },
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
};

const YEARS = ['All years', '2024', '2025', '2026'];

const LEVELS = [
  { value: 'A1', label: 'Beginner (A1)' },
  { value: 'A2', label: 'Elementary (A2)' },
  { value: 'B1', label: 'Pre-intermediate (B1)' },
  { value: 'B2', label: 'Upper-intermediate (B2)' },
];

const ALL_LEVELS_VALUE = '__ALL_LEVELS__';

const renderLevelValue = (selected) => {
  if (!selected || selected.length === 0) return 'All levels';
  if (selected.length === 1) {
    const found = LEVELS.find((l) => l.value === selected[0]);
    return found ? found.label : selected[0];
  }
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <span>Levels</span>
      <Chip
        label={selected.length}
        size="small"
        sx={{
          height: 18,
          fontSize: 11,
          fontWeight: 600,
          bgcolor: 'warning.dark',
          color: '#fff',
          '.MuiChip-label': { px: '6px' },
        }}
      />
    </Stack>
  );
};

function FieldLabel({ children }) {
  return (
    <Typography
      variant="body2"
      sx={{
        display: 'block',
        mb: 0.5,
        fontWeight: 600,
        color: 'text.secondary',
        letterSpacing: '0.04em',
        fontSize: 15,
      }}
    >
      {children}
    </Typography>
  );
}

export default function FilterSidebar({ filters, handleFilterChange, user }) {
  // filters.level is array: [] = all, ['A1'], ['A1','B1'], ...
  const selectedLevels = (filters.level || []).filter((value) =>
    LEVELS.some((level) => level.value === value),
  );

  const handleLevelChange = (event) => {
    const value = event.target.value; // MUI returns array
    if (value.includes(ALL_LEVELS_VALUE)) {
      handleFilterChange('level', []);
      return;
    }

    const normalized = value.filter((item) => LEVELS.some((level) => level.value === item));
    handleFilterChange('level', normalized);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.title !== '' ||
      filters.teacher !== '' ||
      filters.year !== 'All years' ||
      (filters.level && filters.level.length > 0) ||
      filters.ordering !== '-created_at' ||
      filters.status !== '' ||
      filters.my_progress !== '' ||
      filters.mine === true
    );
  };

  return (
    <Grid
      item
      sx={{
        width: { xs: '100%', md: '280px' },
        flexShrink: { md: 0 },
        display: 'block',
      }}
    >
      <Box sx={filterSidebarStyles}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
          <Box sx={{ width: 4, height: 22, bgcolor: 'warning.main', borderRadius: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 20 }}>
            Search and Filter
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {/* Test name */}
          <Box>
            <FieldLabel>Test name</FieldLabel>
            <TextField
              fullWidth
              placeholder="Find test name"
              size="small"
              value={filters.title}
              onChange={(e) => handleFilterChange('title', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18 }} color="action" />
                  </InputAdornment>
                ),
                sx: inputSx,
              }}
            />
          </Box>

          {/* Teacher */}
          <Box>
            <FieldLabel>Teacher</FieldLabel>
            <TextField
              fullWidth
              placeholder="Find teacher"
              size="small"
              value={filters.teacher}
              onChange={(e) => handleFilterChange('teacher', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ fontSize: 18 }} color="action" />
                  </InputAdornment>
                ),
                sx: inputSx,
              }}
            />
          </Box>

          {/* Year */}
          <Box>
            <FieldLabel>Year</FieldLabel>
            <Select
              fullWidth
              size="small"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              sx={inputSx}
              MenuProps={dropdownMenuProps}
            >
              {YEARS.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Sort by — full width */}
          <Box>
            <FieldLabel>Sort by</FieldLabel>
            <Select
              fullWidth
              size="small"
              value={filters.ordering}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              sx={inputSx}
              MenuProps={dropdownMenuProps}
            >
              <MenuItem value="-created_at">Newest first</MenuItem>
              <MenuItem value="created_at">Oldest first</MenuItem>
              <MenuItem value="-updated_at">Recently updated</MenuItem>
              <MenuItem value="updated_at">Last updated</MenuItem>
              <MenuItem value="title">Title (A–Z)</MenuItem>
              <MenuItem value="-title">Title (Z–A)</MenuItem>
              <MenuItem value="-submitted">Most submitted</MenuItem>
              <MenuItem value="submitted">Least submitted</MenuItem>
            </Select>
          </Box>

          {/* Level — multi-select dropdown */}
          <Box>
            <FieldLabel>Level</FieldLabel>
            <Select
              fullWidth
              multiple
              displayEmpty
              size="small"
              value={selectedLevels}
              onChange={handleLevelChange}
              input={<OutlinedInput />}
              renderValue={renderLevelValue}
              sx={inputSx}
              MenuProps={dropdownMenuProps}
            >
              <MenuItem value={ALL_LEVELS_VALUE} dense>
                <Checkbox
                  checked={selectedLevels.length === 0}
                  indeterminate={selectedLevels.length > 0 && selectedLevels.length < LEVELS.length}
                  size="small"
                  sx={{
                    py: 0.5,
                    color: 'warning.main',
                    '&.Mui-checked': { color: 'warning.dark' },
                  }}
                />
                <ListItemText
                  primary="All levels"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                />
              </MenuItem>
              {LEVELS.map((level) => (
                <MenuItem key={level.value} value={level.value} dense>
                  <Checkbox
                    checked={selectedLevels.includes(level.value)}
                    size="small"
                    sx={{
                      py: 0.5,
                      color: 'warning.main',
                      '&.Mui-checked': { color: 'warning.dark' },
                    }}
                  />
                  <ListItemText primary={level.label} primaryTypographyProps={{ fontSize: 14 }} />
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* My Tests Only — only Teacher */}
          {user?.role === 'T' && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.mine}
                    onChange={(e) => handleFilterChange('mine', e.target.checked)}
                    size="small"
                    sx={{
                      color: 'warning.main',
                      '&.Mui-checked': { color: 'warning.dark' },
                    }}
                  />
                }
                label={
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
                    My tests only
                  </Typography>
                }
              />
            </Box>
          )}

          {/* Progress — only Student */}
          {user?.role === 'S' && (
            <Box>
              <FieldLabel>My Progress</FieldLabel>
              <Select
                fullWidth
                displayEmpty
                size="small"
                value={filters.my_progress || ''}
                onChange={(e) => handleFilterChange('my_progress', e.target.value)}
                sx={inputSx}
                MenuProps={dropdownMenuProps}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                        All statuses
                      </Typography>
                    );
                  }
                  if (selected === 'completed') return 'Done';
                  if (selected === 'draft') return 'Draft';
                  if (selected === 'none') return 'New';
                  return selected;
                }}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="completed">Done</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="none">New</MenuItem>
              </Select>
            </Box>
          )}

          {/* Status — only Admin */}
          {user?.role === 'A' && (
            <Box>
              <FieldLabel>Status</FieldLabel>
              <Select
                fullWidth
                size="small"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={inputSx}
                MenuProps={dropdownMenuProps}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="P">Published</MenuItem>
                <MenuItem value="D">Draft</MenuItem>
                <MenuItem value="I">In review</MenuItem>
                <MenuItem value="R">Removed</MenuItem>
              </Select>
            </Box>
          )}

          {/* Clear all filters button — hidding if non filter */}
          {hasActiveFilters() && (
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => {
                  handleFilterChange('title', '');
                  handleFilterChange('teacher', '');
                  handleFilterChange('year', 'All years');
                  handleFilterChange('level', []);
                  handleFilterChange('ordering', '-created_at');
                  handleFilterChange('status', '');
                  handleFilterChange('my_progress', '');
                  handleFilterChange('mine', false);
                }}
                sx={{
                  borderColor: 'warning.main',
                  color: 'warning.main',
                  fontWeight: 600,
                  fontSize: 14,
                  py: 1,
                  '&:hover': {
                    borderColor: 'warning.dark',
                    bgcolor: 'rgba(251, 192, 45, 0.05)',
                  },
                }}
              >
                Clear all filters
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </Grid>
  );
}
