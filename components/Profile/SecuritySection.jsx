import { Paper, Box, Typography, Button, TextField, Divider } from '@mui/material';
import { useState } from 'react';

export default function SecuritySection({ username }) {
  const [editUsername, setEditUsername] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={3}>
        Security
      </Typography>

      <Box mb={3}>
        <Typography fontWeight={500}>Username</Typography>

        {!editUsername ? (
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography color="text.secondary">{username}</Typography>
            <Button size="small" onClick={() => setEditUsername(true)}>
              Change
            </Button>
          </Box>
        ) : (
          <Box
            display="flex"
            gap={2}
            mt={1}
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: 'column', sm: 'row' }}
            sx={{ '@media (max-width: 600px)': { flexDirection: 'column', alignItems: 'stretch' } }}
          >
            <TextField size="small" defaultValue={username} fullWidth />
            <Box display="flex" gap={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button variant="outlined" onClick={() => setEditUsername(false)} fullWidth>
                Cancel
              </Button>
              <Button variant="contained" onClick={() => setEditUsername(false)} fullWidth>
                Save
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography fontWeight={500}>Password</Typography>
        {!editPassword ? (
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography color="text.secondary">••••••••••••</Typography>
            <Button size="small" onClick={() => setEditPassword(true)}>
              Change
            </Button>
          </Box>
        ) : (
          <Box
            display="flex"
            gap={2}
            mt={1}
            justifyContent="space-between"
            flexDirection={{ xs: 'column', sm: 'row' }}
          >
            <Box display="flex" flexDirection="column" gap={2} flex={1}>
              <TextField label="Old password" type="password" size="small" />
              <TextField label="New password" type="password" size="small" />
            </Box>
            <Box
              display="flex"
              gap={2}
              alignItems="flex-end"
              sx={{ width: { xs: '100%', sm: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}
            >
              <Button
                variant="outlined"
                onClick={() => setEditPassword(false)}
                fullWidth={window.innerWidth < 600}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => setEditPassword(false)}
                fullWidth={window.innerWidth < 600}
              >
                Save
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
