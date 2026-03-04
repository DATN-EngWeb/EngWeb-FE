import { Box, Container, Typography, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { listeningtestStyles } from '../../../styles/Student/Listening/listeningTestStyles';
import { formatTimeFromMinutes } from '../../../utils/stringFormat';
import Spinner from '../../../components/spinner';

export default function Skeleton() {
  return (
    <Box sx={{ ...listeningtestStyles.mainContainer, overflow: 'hidden' }}>
      <Container maxWidth="lg">
        {/* -------- Test Heading Section --------- */}
        <Box sx={listeningtestStyles.testHeadingContainer}>
          <Box sx={{ width: '200px' }}>
            <Box sx={listeningtestStyles.timeLeftSkeleton}></Box>
          </Box>
          <Box sx={listeningtestStyles.nameTestAndFormatPart}>
            <Typography sx={listeningtestStyles.nameTestSkeleton}></Typography>
            <Typography sx={listeningtestStyles.formatNameSkeleton}></Typography>
          </Box>
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            <Button sx={listeningtestStyles.submitButton}>Submit Test</Button>
          </Box>
        </Box>
        <Box sx={listeningtestStyles.separatorLine}></Box>
        {/* -------- List Part Selection --------- */}
        <Box sx={listeningtestStyles.listPartContainer}>
          {[1, 2, 3, 4].map((part, index) => (
            <Box sx={listeningtestStyles.boxPartSkeleton} key={index}></Box>
          ))}
        </Box>
        <Box
          sx={{
            ...listeningtestStyles.separatorLine,
            backgroundColor: 'gray.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            justifyItems: 'center',
          }}
        ></Box>
      </Container>
      <Box
        sx={{
          width: '100%',
          height: '330px',
          backgroundColor: 'background.gray',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: 2,
        }}
      >
        <Spinner color="text.gray" />
      </Box>
    </Box>
  );
}
