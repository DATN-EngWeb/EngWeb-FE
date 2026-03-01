import { Paper, Typography, Box } from '@mui/material';
import { partTypeCard } from '../../styles/Teacher/Listening/ListeningStyles';

export default function PartTypeCard({ icon, title, description, onClick, selected }) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        ...partTypeCard,
        border: '1px solid',
        borderColor: selected ? 'yellow.main' : 'gray.main',
        backgroundColor: selected ? 'natural.main' : 'background.paper',
        '&:hover': {
          borderColor: 'yellow.main',
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'primary.main' }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.gray' }}>
          {description}
        </Typography>
      </Box>
    </Paper>
  );
}
