import { Box, Container } from '@mui/material';
import CreateTestHeader from '../../../components/CreateTest/CreateTestHeader';
import TestTypeGrid from '../../../components/CreateTest/TestTypeGrid';

export default function UploadTestPage() {
  return (
    <Box
      sx={{
        backgroundColor: '#FFF5EB',
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <CreateTestHeader />
        <TestTypeGrid />
      </Container>
    </Box>
  );
}
