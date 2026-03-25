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
import PrintIcon from '@mui/icons-material/Print';

const PrintOnlyView = ({ basicInfo, parts }) => (
  <Box
    sx={{
      display: 'none',
      '@media print': {
        display: 'block !important',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        bgcolor: 'white',
        zIndex: 9999,
        p: 2,
        visibility: 'visible',
      },
      p: 0,
    }}
  >
    <style>
      {`
        @media print {
          body * {
            visibility: hidden;
            overflow: visible !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}
    </style>

    <Box id="print-area">
      <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 700, color: '#000' }}>
        {basicInfo?.testName || 'Reading Test'}
      </Typography>

      {parts?.map((part, index) => (
        <Box
          key={part.id || index}
          sx={{
            mb: 6,
            pageBreakAfter: 'always',
            '&:last-child': { pageBreakAfter: 'auto' },
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 600, color: '#000', borderBottom: '1px solid #000', pb: 1 }}
          >
            Part {index + 1}: {getListeningTestTypeLabel(part.format || part.type)}
          </Typography>

          {part.content && (
            <Box
              sx={{
                mb: 4,
                lineHeight: 1.8,
                fontSize: '1.1rem',
                textAlign: 'justify',
                color: '#000',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: part.content }} />
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            {(part.receptive_questions || part.questions || []).map((q, qIndex) => (
              <Box key={qIndex} sx={{ mb: 4, pageBreakInside: 'avoid' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: '#000' }}>
                    {q.question_number || qIndex + 1}.
                  </Typography>
                  <div
                    style={{ fontWeight: 600, color: '#000' }}
                    dangerouslySetInnerHTML={{
                      __html: q.content || `Question ${q.question_number || qIndex + 1}`,
                    }}
                  />
                </Box>

                <Box sx={{ ml: 4 }}>
                  {(q.receptive_answers || q.answers || []).map((ans, aIndex) => (
                    <Box key={aIndex} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {ans.option_label || String.fromCharCode(65 + aIndex)}.
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {ans.answer_text || ans.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

export default function PreviewReadingTest({
  basicInfo,
  parts,
  onPreview,
  showHeaderActions = true,
}) {
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
    <Box
      sx={{
        ...listeningtestStyles.mainContainer,
        position: 'relative',
        overflow: 'hidden',
        '@media print': {
          overflow: 'visible !important',
          height: 'auto !important',
          minHeight: 'auto !important',
        },
      }}
    >
      <Container maxWidth="lg" className="no-print">
        {/* -------- Test Heading Section --------- */}
        <Box sx={listeningtestStyles.testHeadingContainer}>
          {showHeaderActions ? (
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
          ) : (
            <Box sx={{ minWidth: 80 }} />
          )}
          <Box sx={listeningtestStyles.nameTestAndFormatPart}>
            <Typography sx={listeningtestStyles.nameTest}>{basicInfo?.testName}</Typography>
            <Typography sx={listeningtestStyles.formatName}>
              {`Part ${indexPart + 1}: `}
              {getListeningTestTypeLabel(parts[indexPart]?.format || parts[indexPart]?.type)}
            </Typography>
          </Box>
          {showHeaderActions ? (
            <Box sx={{ ...listeningtestStyles.summitButtonWrapper, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                sx={{
                  ...listeningtestStyles.submitButton,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                Print All
              </Button>
              <Button sx={listeningtestStyles.submitButton} disabled>
                Submit Test
              </Button>
            </Box>
          ) : (
            <Box sx={{ minWidth: 120 }} />
          )}
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
      <Box
        className="no-print"
        sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}
      >
        {receptiveParts.map((part, index) => renderPart(part, index))}
      </Box>

      {/* -------- Stepper Section --------- */}
      <Box
        className="no-print"
        sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}
      >
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

      <PrintOnlyView basicInfo={basicInfo} parts={receptiveParts} />
    </Box>
  );
}
