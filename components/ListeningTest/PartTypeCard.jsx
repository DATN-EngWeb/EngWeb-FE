import { Paper, Typography, Box } from '@mui/material';
import { partTypeCard } from '../../styles/Teacher/Listening/ListeningStyles';

export default function PartTypeCard({ icon, title, description, onClick, selected }) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        ...partTypeCard,
        border: selected ? '2px solid #000000ff' : '1px solid #e0e0e0',
        '&:hover': {
          borderColor: '#000000ff',
          boxShadow: 2,
        },
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
