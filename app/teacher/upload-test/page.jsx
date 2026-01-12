import { Box } from '@mui/material';
import CreateTestHeader from '../../../components/CreateTest/CreateTestHeader';
import TestTypeGrid from '../../../components/CreateTest/TestTypeGrid';

export default function UploadTestPage() {
  return (
    <Box
      sx={{
        backgroundColor: '#FFF5EB',
        minHeight: '100vh',
        p: 4,
        px: 20,
      }}
    >
      <CreateTestHeader />
      <TestTypeGrid />
    </Box>
  );
}
