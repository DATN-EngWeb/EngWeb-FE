'use client';

import { Paper, Typography } from '@mui/material';

export default function TestEditorHeader({ title, description }) {
  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Typography variant="h4" fontWeight={700} color="#5D2E1A">
        {title}
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Paper>
  );
}
