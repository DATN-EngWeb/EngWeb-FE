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
import {
  fetchHtmlContent,
  loadAudioSource,
  loadImageSource,
} from '../../api/teacher/upload-reading';

export default function ListeningPreview({
  basicInfo,
  parts,
  onPreview,
  showHeaderActions = true,
}) {
  const [indexPart, setIndexPart] = useState(0);
  const [receptiveParts, setReceptiveParts] = useState([]);
  const [mediaResources, setMediaResources] = useState({});

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
    if (!parts || parts.length === 0) {
      setReceptiveParts([]);
      setMediaResources({});
      return;
    }

    let mounted = true;
    let loadedResources = {};

    const buildPreviewData = async () => {
      const newParts = parts.map((part) => {
        const questions = part.receptive_questions || part.questions || [];

        return {
          ...part,
          receptive_questions: questions.map((q) => ({
            ...q,
            receptive_answers: q.receptive_answers || q.answers || [],
          })),
        };
      });

      const resourcesMap = {};

      await Promise.all(
        newParts.map(async (part) => {
          resourcesMap[part.id] = {
            audioSrc: null,
            imageSrcs: {},
            audioSrcs: {},
            passageSrc: '',
          };

          const res = resourcesMap[part.id];
          const partAudio = part.audio?.url || part.resources?.audio;
          if (partAudio) {
            res.audioSrc = partAudio.startsWith('blob:')
              ? partAudio
              : await loadAudioSource(partAudio);
          }

          if (part.content) {
            res.passageSrc = part.content.startsWith('http')
              ? await fetchHtmlContent(part.content)
              : part.content;
          }

          if (part.format === 'A' || part.type === 'multichoice_images') {
            const imageTasks = [];
            part.receptive_questions?.forEach((q) => {
              q.receptive_answers?.forEach((opt) => {
                const imageUrl = opt.image?.url || opt.resources?.image;
                if (imageUrl) {
                  imageTasks.push(async () => {
                    res.imageSrcs[opt.id] = imageUrl.startsWith('blob:')
                      ? imageUrl
                      : await loadImageSource(imageUrl);
                  });
                }
              });
            });
            await Promise.all(imageTasks.map((task) => task()));
          }

          if (part.format === 'B' || part.type === 'multichoice_texts') {
            const audioTasks = [];
            part.receptive_questions?.forEach((q) => {
              const qAudio = q.audio?.url || q.resources?.audio;
              if (qAudio) {
                audioTasks.push(async () => {
                  res.audioSrcs[q.id] = qAudio.startsWith('blob:')
                    ? qAudio
                    : await loadAudioSource(qAudio);
                });
              }
            });
            await Promise.all(audioTasks.map((task) => task()));
          }
        }),
      );

      loadedResources = resourcesMap;
      if (!mounted) return;

      setReceptiveParts(newParts);
      setMediaResources(resourcesMap);
    };

    buildPreviewData();

    return () => {
      mounted = false;
      Object.values(loadedResources).forEach((res) => {
        if (res.audioSrc?.startsWith('blob:')) URL.revokeObjectURL(res.audioSrc);
        Object.values(res.imageSrcs || {}).forEach((url) => {
          if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        Object.values(res.audioSrcs || {}).forEach((url) => {
          if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
        });
      });
    };
  }, [parts]);

  const renderPart = (part, index) => {
    const isActive = indexPart === index;

    const commonProps = {
      dataPart: part,
      isActive: isActive,
      userAnswers: {},
      disabled: true,
      media: mediaResources[part.id] || {},
    };

    switch (part.type) {
      case 'multichoice_images':
        return <MultipleChoiceImagePart key={part.id} {...commonProps} />;
      case 'multichoice_texts':
        if (part.audioFormat === 'onetomany') {
          return <MultipleChoiceQuestionAudio key={part.id} {...commonProps} />;
        }
        return <MultipleChoiceSingleAudio key={part.id} {...commonProps} />;
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
              <Button sx={listeningtestStyles.submitButton} disabled>
                Submit Test
              </Button>
            </Box>
          ) : (
            <Box sx={{ minWidth: 120 }} />
          )}
        </Box>
        <Box sx={listeningtestStyles.separatorLine}></Box>
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
      <Box
        className="no-print"
        sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}
      >
        {receptiveParts.map((part, index) => renderPart(part, index))}
      </Box>

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
    </Box>
  );
}
