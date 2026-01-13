import { Paper, Box, Button, Avatar, Typography } from '@mui/material';
import { useState } from 'react';

export default function CoverSection() {
  const [editing, setEditing] = useState(false);
  const [cover, setCover] = useState(null);

  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      <Box
        sx={{
          height: 200,
          bgcolor: '#FDB954',
          position: 'relative',
          backgroundImage: cover ? `url(${cover})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Button
          size="small"
          variant="contained"
          sx={{ position: 'absolute', top: 16, right: 16 }}
          component="label"
          onClick={() => setEditing(true)}
        >
          Change cover
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => setCover(URL.createObjectURL(e.target.files[0]))}
          />
        </Button>

        {editing && (
          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={() => setEditing(false)}>
              Save
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', p: 3, gap: 2, mt: -6 }}>
        <Avatar sx={{ width: 100, height: 100, border: '4px solid white' }} />
        <Box>
          <Typography variant="h6">Teacher</Typography>
          <Typography color="text.secondary">Sarah Wilson</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
