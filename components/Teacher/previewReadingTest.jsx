'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { listeningtestStyles } from '../../styles/Student/Listening/listeningTestStyles';
import { getListeningTestTypeLabel } from '../../utils/stringFormat';
import MultipleChoiceImagePart from '../Student/ListeningTest/part/multipleChoiceImage';
import FillBlankPart from '../Student/ListeningTest/part/fillBlanks';
import MultipleChoiceSingleAudio from '../Student/ListeningTest/part/multipleChoiceSingleAudio';
import MultipleChoiceQuestionAudio from '../Student/ListeningTest/part/multipleChoiceMultiQuestionAudio';
import Matching from '../Student/ListeningTest/part/matching';

export default function PreviewReadingTest({ basicInfo, parts, onPreview }) {
  const [indexPart, setIndexPart] = useState(0);
  const [receptiveParts, setReceptiveParts] = useState([]);

  const goNextPart = () => {
    if (indexPart < parts.length - 1) {
      window.scrollTo({ top: 64, behavior: 'smooth' });
      setIndexPart(indexPart + 1);
    }
  };

  const goPrevPart = () => {
    if (indexPart > 0) {
      window.scrollTo({ top: 64, behavior: 'smooth' });
      setIndexPart(indexPart - 1);
    }
  };

  useEffect(() => {
    if (!parts || parts.length === 0) return;

    const newParts = parts.map((part) => {
      // Ép kiểu dữ liệu để đảm bảo cấu trúc receptive_...
      const questions = part.receptive_questions || part.questions || [];

      return {
        ...part,
        receptive_questions: questions.map((q) => ({
          ...q,
          receptive_answers: q.receptive_answers || q.answers || [],
        })),
      };
    });

    setReceptiveParts(newParts);
    // console.log('Mảng parts mới đã map:', newParts);
  }, [parts]);

  const renderPart = (part, index) => {
    // - 'A': Listening - Multiple choice images
    // - 'B': Listening - Multiple choice text (one audio per question)
    // - 'C': Listening - Multiple choice text (one audio for all question)
    // - 'D': Listening - Fill in the blank (text)
    // - 'E': Listening - Matching

    const isActive = indexPart === index;

    const commonProps = {
      dataPart: part,
      isActive: isActive,
      userAnswers: {},
      disabled: true,
    };

    switch (part.type) {
      case 'multichoice_images':
        return <MultipleChoiceImagePart key={part.id} {...commonProps} />;
      case 'multichoice_texts':
        if (part.audioFormat === 'onetomany') {
          return <MultipleChoiceQuestionAudio key={part.id} {...commonProps} />;
        } else {
          return <MultipleChoiceSingleAudio key={part.id} {...commonProps} />;
        }
      case 'fill_in_the_blanks':
        return <FillBlankPart key={part.id} {...commonProps} />;
      case 'matching':
        return <Matching key={part.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ ...listeningtestStyles.mainContainer, position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="lg">
        {/* -------- Test Heading Section --------- */}
        <Box sx={listeningtestStyles.testHeadingContainer}>
          <Typography
            sx={{ ...listeningtestStyles.backButton, fontSize: { xs: '0.8rem', md: '1rem' } }}
            onClick={onPreview}
          >
            <ExpandLessIcon
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.6rem', md: '1.8rem' },
                color: 'gray.main',
                transform: 'rotate(270deg)',
              }}
            />
            Back
          </Typography>
          <Box sx={listeningtestStyles.nameTestAndFormatPart}>
            <Typography sx={listeningtestStyles.nameTest}>{basicInfo?.testName}</Typography>
            <Typography sx={listeningtestStyles.formatName}>
              {`Part ${indexPart + 1}: `}
              {getListeningTestTypeLabel(parts[indexPart]?.format || parts[indexPart]?.type)}
            </Typography>
          </Box>
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            <Button sx={listeningtestStyles.submitButton} disabled>
              Submit Test
            </Button>
          </Box>
        </Box>
        <Box sx={listeningtestStyles.separatorLine}></Box>
        {/* -------- List Part Selection --------- */}
        <Box sx={listeningtestStyles.listPartContainer}>
          {parts.map((part, index) => (
            <Box
              sx={{
                ...listeningtestStyles.boxPart,
                ...(index === indexPart && {
                  backgroundColor: 'background.default',
                  borderColor: 'orange.light',
                  color: 'orange.dark',
                }),
                ...((index < indexPart - 1 || index > indexPart + 1) && {
                  display: { xs: 'none', sm: 'flex' },
                }),
                ...(((index === indexPart - 2 && indexPart === parts.length - 1) ||
                  (index === indexPart + 2 && indexPart === 0)) && {
                  display: 'flex',
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
      {/* -------- Part Content Section --------- */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}>
        {receptiveParts.map((part, index) => renderPart(part, index))}
      </Box>
      {/* -------- Stepper Section --------- */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}>
        <Container maxWidth="lg" sx={listeningtestStyles.stepperContainer}>
          <Typography
            sx={{
              ...listeningtestStyles.backButton,
              visibility: indexPart === 0 ? 'hidden' : 'visible',
            }}
            onClick={goPrevPart}
          >
            <ExpandLessIcon
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.6rem', md: '1.8rem' },
                color: 'gray.main',
                transform: 'rotate(270deg)',
              }}
            />
            Back
          </Typography>
          <Typography sx={{ fontSize: '1rem' }}>
            Section {indexPart + 1} of {parts.length}
          </Typography>
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            <Button sx={listeningtestStyles.nextButton} onClick={goNextPart}>
              Next
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
