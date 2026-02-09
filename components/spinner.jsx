import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const Spinner = ({ size = 40, color = 'primary.main', stroke = 3.5, _hidden = false }) => {
  if (_hidden) return null;

  return (
    <CircularProgress
      size={size}
      thickness={stroke}
      sx={{
        color: color,
        display: 'block',
      }}
    />
  );
};

export default Spinner;
