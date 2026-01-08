'use client';

import { Typography, Button, Box } from '@mui/material';
import PartTypeCard from './PartTypeCard';

export default function SelectPartType({ partTypes, onSelectType, onCancel }) {
  return (
    <>
      <Typography fontWeight={600} mb={2} sx={{ color: 'primary.main' }}>
        Select Part Type
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        {partTypes.map((type) => (
          <PartTypeCard
            key={type.id}
            icon={type.icon}
            title={type.title}
            description={type.description}
            onClick={() => onSelectType(type.id)}
          />
        ))}
      </Box>

      <Button variant="text" onClick={onCancel}>
        Cancel
      </Button>
    </>
  );
}
