import { Box, Container, Typography } from '@mui/material';
import { listeningtestStyles } from '@/styles/Student/Listening/listeningTestStyles';
import Spinner from '../../../components/spinner';

export default function Skeleton() {
  return (
    <Box
      sx={{
        ...listeningtestStyles.mainContainer,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
      }}
    >
      {/* -------- Test Heading Section --------- */}
      <Box sx={{ ...listeningtestStyles.testHeadingContainer, justifyContent: 'center' }}>
        <Box sx={listeningtestStyles.nameTestAndFormatPart}>
          <Typography sx={listeningtestStyles.nameTestSkeleton}></Typography>
          <Typography sx={listeningtestStyles.formatNameSkeleton}></Typography>
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
      <Box
        sx={{
          flex: 1,
          width: '100%',
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
