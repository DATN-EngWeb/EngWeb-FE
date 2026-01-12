import { Box, Typography } from '@mui/material';

export default function CreateTestHeader() {
  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: 3,
        p: 3,
        mb: 4,
      }}
    >
      <Typography variant="h3" fontWeight={600} color="primary.main">
        Create New Test
      </Typography>
      <Typography color="text.secondary">
        Choose test type below to create a new test for your students
      </Typography>
    </Box>
  );
}
