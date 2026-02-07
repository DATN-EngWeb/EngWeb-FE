/* eslint-env browser */
/* eslint-disable no-console */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Container, Typography, Button, Snackbar, Alert } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getRecepiveTestDetails } from '../../../../../api/teacher/upload-reading';
import { listeningtestStyles } from '../../../../../styles/Student/Listening/listeningTestStyles';
import { getListeningTestTypeLabel } from '../../../../../utils/stringFormat';

export default function Page() {
  const { test_id } = useParams();
  const [testData, setTestData] = useState(null);
  const [indexPart, setIndexPart] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchTestData = async () => {
      if (!test_id) return;

      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setSnackbar({ open: true, message: 'Authentication required', severity: 'error' });
          return;
        }

        const svData = await getRecepiveTestDetails(test_id, accessToken);
        setTestData(svData);
      } catch (error) {
        console.error('Lỗi tải dữ liệu bài thi:', error);
      }
    };

    fetchTestData();
  }, [test_id]);

  return (
    <Box sx={{ ...listeningtestStyles.mainContainer, overflow: 'hidden' }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
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
            <Typography sx={listeningtestStyles.nameTest}>{testData?.title}</Typography>
            <Typography sx={listeningtestStyles.formatName}>
              {`Part ${indexPart + 1}: `}
              {getListeningTestTypeLabel(
                testData?.receptive_test.receptive_parts[indexPart]?.format,
              )}
            </Typography>
          </Box>
          <Button sx={listeningtestStyles.submitButton}>Submit Test</Button>
        </Box>
        <Box sx={listeningtestStyles.separatorLine}></Box>
        {/* -------- List Part Selection --------- */}
        <Box sx={listeningtestStyles.listPartContainer}>
          {testData?.receptive_test.receptive_parts.map((part, index) => (
            <Box
              sx={{
                ...listeningtestStyles.boxPart,
                ...(index === indexPart && {
                  backgroundColor: 'background.default',
                  borderColor: 'orange.light',
                  color: 'orange.dark',
                }),
              }}
              key={part.id}
              onClick={() => setIndexPart(index)}
            >
              Part {index + 1}
            </Box>
          ))}
        </Box>
        <Box sx={{ ...listeningtestStyles.separatorLine, backgroundColor: 'gray.main' }}></Box>
      </Container>
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}>
        <Container maxWidth="lg"></Container>
      </Box>
    </Box>
  );
}
