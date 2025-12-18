import { Paper, Typography, Box } from '@mui/material';

export default function PartTypeCard({ icon, title, description, onClick, selected }) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: '#1976d2',
          boxShadow: 2,
        },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ color: '#1976d2', display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" fontWeight="600">
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Paper>
  );
}
