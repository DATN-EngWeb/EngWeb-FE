import { Paper, Box, Typography, Grid, TextField, Button, Select, MenuItem } from '@mui/material';
import { useState, useRef } from 'react';
import { informationSectionStyles } from '../../styles/Profile/ProfileStyles';

const getEmploymentTypeLabel = (type) => {
  const labels = {
    F: 'Freelance Teacher',
    S: 'School Teacher',
    C: 'Center Teacher',
  };
  return labels[type] || type;
};

export default function InformationSection({ profile, setProfile, onSave, isSaving, onError }) {
  const [edit, setEdit] = useState(false);
  const originalProfileRef = useRef(null);

  const handleEditToggle = async () => {
    if (!edit) {
      originalProfileRef.current = { ...profile };
      setEdit(true);
      return;
    }

    try {
      if (onSave) {
        await onSave();
      }
      setEdit(false);
    } catch (err) {
      if (onError) onError(err.message || 'Failed to update information', 'error');
    }
  };

  const handleCancel = () => {
    if (originalProfileRef.current) {
      setProfile(originalProfileRef.current);
    }
    setEdit(false);
  };

  return (
    <Paper sx={{ mb: 3, p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Information</Typography>
        <Box gap={1} display="flex">
          {edit && (
            <Button variant="outlined" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button onClick={handleEditToggle} disabled={isSaving}>
            {edit ? 'Save' : 'Edit'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={informationSectionStyles.gridContainer}>
        <Grid item>
          <Typography variant="caption">EMPLOYMENT TYPE</Typography>
          {edit ? (
            <Select
              fullWidth
              size="small"
              value={profile.employmentType || ''}
              onChange={(e) => setProfile({ ...profile, employmentType: e.target.value })}
            >
              <MenuItem value="F">Freelance Teacher</MenuItem>
              <MenuItem value="S">School Teacher</MenuItem>
              <MenuItem value="C">Center Teacher</MenuItem>
            </Select>
          ) : (
            <Typography>{getEmploymentTypeLabel(profile.employmentType)}</Typography>
          )}
        </Grid>

        <Grid item>
          <Typography variant="caption">EXPERIENCE YEAR</Typography>
          {edit ? (
            <TextField
              fullWidth
              size="small"
              value={profile.experienceYear}
              onChange={(e) => setProfile({ ...profile, experienceYear: e.target.value })}
            />
          ) : (
            <Typography>{profile.experienceYear}</Typography>
          )}
        </Grid>

        <Grid item>
          <Typography variant="caption">WORKPLACE</Typography>
          {edit ? (
            <TextField
              fullWidth
              size="small"
              value={profile.workplace}
              onChange={(e) => setProfile({ ...profile, workplace: e.target.value })}
            />
          ) : (
            <Typography>{profile.workplace}</Typography>
          )}
        </Grid>

        <Grid item>
          <Typography variant="caption">INTRODUCTION</Typography>
          {edit ? (
            <TextField
              fullWidth
              size="small"
              value={profile.introduction}
              onChange={(e) => setProfile({ ...profile, introduction: e.target.value })}
            />
          ) : (
            <Typography>{profile.introduction}</Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
