import { Box, TextField, Typography } from '@mui/material';

export default function TimeBox() {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <TextField size="small" type="number" placeholder="MM" sx={{ width: 80 }} />
      <Typography>:</Typography>
      <TextField size="small" type="number" placeholder="SS" sx={{ width: 80 }} />
    </Box>
  );
}
