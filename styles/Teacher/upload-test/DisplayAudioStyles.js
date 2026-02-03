export const playerContainer = {
  width: '100%',
  maxWidth: 750,
  height: 50,
  bgcolor: 'primary.contrastText',
  borderRadius: '20px',
  border: '1px solid',
  borderColor: 'warning.main',
  p: 2,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
};

export const playButton = {
  bgcolor: 'warning.light',
  color: 'white',
  width: 35,
  height: 35,
  '&:hover': { bgcolor: 'warning.main' },
};

export const audioSlider = {
  color: 'warning.main',
  height: 12,
  '& .MuiSlider-track': { border: 'none' },
  '& .MuiSlider-rail': { bgcolor: 'darkGrey.light' },
  '& .MuiSlider-thumb': { display: 'none' },
};

export const timeText = {
  color: 'darkGrey.light',
  minWidth: 100,
};
