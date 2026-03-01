import { Box, Container, Typography, Button } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { listeningtestStyles } from '../../../styles/Student/Listening/listeningTestStyles';
import Spinner from '../../../components/spinner';

export default function Skeleton() {
  return (
    <Box sx={{ ...listeningtestStyles.mainContainer, overflow: 'hidden' }}>
      <Container maxWidth="lg">
        {/* -------- Test Heading Section --------- */}
        <Box sx={listeningtestStyles.testHeadingContainer}>
          <Typography sx={listeningtestStyles.backButton}>
            <ExpandLessIcon
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.6rem', md: '1.8rem' },
                color: 'gray.main',
                transform: 'rotate(270deg)',
              }}
            />
            Back to homepage
          </Typography>
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
