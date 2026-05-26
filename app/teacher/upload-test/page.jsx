import { Box } from '@mui/material';
import CreateTestHeader from '../../../components/CreateTest/CreateTestHeader';
import TestTypeGrid from '../../../components/CreateTest/TestTypeGrid';

export default function UploadTestPage() {
  return (
    <Box
      sx={{
        backgroundColor: '#FFF5EB',
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        px: { xs: 2, sm: 4, md: 10, lg: 20 },
      }}
    >
      <CreateTestHeader />
      <TestTypeGrid />
    </Box>
  );
}
