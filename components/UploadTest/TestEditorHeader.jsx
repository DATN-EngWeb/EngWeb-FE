import { Paper, Typography } from '@mui/material';

export default function TestEditorHeader({ title, description, sx }) {
  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: 'none', ...sx }}>
      <Typography variant="h4" fontWeight={700} color="primary.main">
        {title}
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Paper>
  );
}
