'use client';

import React from 'react';
import { Typography, Button, Box, Stack } from '@mui/material';
import { uploadReadingStyles } from '../../styles/Teacher/Reading/UploadReadingStyles';

export default function SelectPartType({ partTypes, onSelectType, onCancel }) {
  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: '4px',
            height: '36px',
            backgroundColor: 'yellow.main',
            borderRadius: '1rem',
          }}
        />
        <Typography sx={uploadReadingStyles.basicInfoHeading}>Select Part Type</Typography>
      </Stack>
      <Box sx={uploadReadingStyles.partContentContainer}>
        {partTypes.map((type) => (
          <Button
            key={type.id}
            sx={uploadReadingStyles.selectedPart}
            onClick={() => onSelectType(type.id)}
          >
            {React.cloneElement(type.icon, {
              sx: [type.icon.props?.sx, uploadReadingStyles.iconSelectedPart],
            })}
            <Box sx={uploadReadingStyles.partTextContainer}>
              <Typography sx={uploadReadingStyles.partTitle}>{type.title}</Typography>
              <Typography sx={uploadReadingStyles.partDescription}>{type.description}</Typography>
            </Box>
          </Button>
        ))}
      </Box>
      <Button
        sx={{
          color: 'text.gray',
          fontSize: { xs: '0.7rem', md: '0.9rem' },
          textTransform: 'none',
          px: 2,
        }}
        onClick={onCancel}
      >
        Cancel
      </Button>
    </>
  );
}
