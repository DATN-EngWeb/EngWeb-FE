import { Paper, Box, Typography, Grid, TextField, Button } from '@mui/material';
import { useState, useRef } from 'react';
import { profileSettingsSectionStyles } from '../../styles/Profile/ProfileStyles';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

export default function ProfileSettingSection({ profile, setProfile, onSave, isSaving, onError }) {
  const [edit, setEdit] = useState(false);
  const originalProfile = useRef(null);

  const handleEdit = () => {
    if (!edit) {
      originalProfile.current = { ...profile };
    }
    setEdit(!edit);
  };

  const handleCancel = () => {
    if (originalProfile.current) {
      setProfile(originalProfile.current);
    }
    setEdit(false);
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave(profile);
      }
      originalProfile.current = { ...profile };
      setEdit(false);
    } catch (err) {
      if (onError) {
        onError(err.message || 'Failed to save profile', 'error');
      }
    }
  };

  return (
    <Paper sx={{ mb: 3, p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Profile Setting</Typography>
        <Box gap={1} display="flex">
          {edit && (
            <Button onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button variant="outlined" onClick={edit ? handleSave : handleEdit} disabled={isSaving}>
            {edit ? 'Save' : 'Edit'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={profileSettingsSectionStyles.gridContainer}>
        <Grid item>
          <Typography variant="caption">FULL NAME</Typography>
          {edit ? (
            <TextField
              fullWidth
              size="small"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              disabled={isSaving}
              sx={{
                borderRadius: '1rem',
                '& .MuiInputBase-root': {
                  borderRadius: '1rem',
                },
              }}
            />
          ) : (
            <Typography>{profile.fullName || '-'}</Typography>
          )}
        </Grid>

        <Grid item>
          <Typography variant="caption">EMAIL</Typography>
          <Typography>{profile.email || '-'}</Typography>
        </Grid>

        <Grid item>
          <Typography variant="caption">DATE OF BIRTH</Typography>
          {edit ? (
            <TextField
              type="date"
              fullWidth
              size="small"
              value={profile.dateOfBirth}
              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
              disabled={isSaving}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '1rem',
                },
              }}
            />
          ) : (
            <Typography>{formatDate(profile.dateOfBirth) || '-'}</Typography>
          )}
        </Grid>

        <Grid item>
          <Typography variant="caption">ROLE</Typography>
          <Typography>{profile.role === 'S' ? 'Student' : 'Teacher'}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
