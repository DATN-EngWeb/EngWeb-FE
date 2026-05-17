import { Box } from '@mui/material';

export default function InstructionIcon() {
  const size = '40px';

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F5',
        padding: '8px',
        borderRadius: '0.5rem',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          border: '2.5px solid',
          borderColor: 'red.text',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            height: '30%',
            borderBottom: '2.5px solid',
            borderColor: 'red.text',
            width: '100%',
          }}
        />

        <Box sx={{ display: 'flex', flex: 1 }}>
          <Box
            sx={{
              width: '35%',
              borderRight: '2.5px solid',
              borderColor: 'red.text',
              height: '100%',
            }}
          />
          <Box sx={{ flex: 1, height: '100%' }} />
        </Box>
      </Box>
    </Box>
  );
}
