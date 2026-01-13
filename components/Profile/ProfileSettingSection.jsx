import { Paper, Box, Typography, Grid, TextField, Button } from '@mui/material';
import { useState } from 'react';

export default function ProfileSettingSection({ profile, setProfile }) {
  const [edit, setEdit] = useState(false);

  return (
    <Paper sx={{ mb: 3, p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Profile Setting</Typography>
        <Box gap={1} display="flex">
          {edit && (
            <Button variant="outlined" onClick={() => setEdit(false)}>
              Cancel
            </Button>
          )}
          <Button onClick={() => setEdit(!edit)}>{edit ? 'Save' : 'Edit'}</Button>
        </Box>
      </Box>

      <Grid
        container
        spacing={2}
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}
      >
        <Grid item>
          <Typography variant="caption">FULL NAME</Typography>
          {edit ? (
            <TextField
              fullWidth
              size="small"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
          ) : (
            <Typography>{profile.fullName}</Typography>
          )}
        </Grid>

        <Grid item>
          <Typography variant="caption">EMAIL</Typography>
          {edit ? (
            <TextField
              fullWidth
              size="small"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          ) : (
            <Typography>{profile.email}</Typography>
          )}
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
            />
          ) : (
            <Typography>{profile.dateOfBirth}</Typography>
          )}
        </Grid>

        <Grid item>
          <Typography variant="caption">ROLE</Typography>
          <Typography>{profile.role}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
