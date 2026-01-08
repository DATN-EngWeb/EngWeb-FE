import { Paper, Typography, Box } from '@mui/material';

export default function PartTypeCard({ icon, title, description, onClick, selected }) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: selected ? '2px solid #000000ff' : '1px solid #e0e0e0',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: '#000000ff',
          boxShadow: 2,
        },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ color: '#000000ff', display: 'flex' }}>{icon}</Box>
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
