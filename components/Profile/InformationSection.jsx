import { Paper, Box, Typography, Grid, TextField, Button } from '@mui/material';
import { useState } from 'react';

export default function InformationSection({ profile, setProfile }) {
  const [edit, setEdit] = useState(false);

  return (
    <Paper sx={{ mb: 3, p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Information</Typography>
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
          <Typography variant="caption">EMPLOYMENT TYPE</Typography>
          {edit ? (
            <TextField
              fullWidth
              size="small"
              value={profile.employmentType}
              onChange={(e) => setProfile({ ...profile, employmentType: e.target.value })}
            />
          ) : (
            <Typography>{profile.employmentType}</Typography>
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
