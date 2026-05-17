'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { listeningtestStyles } from '@/styles/Student/Listening/listeningTestStyles';
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
  const [loadingResources, setLoadingResources] = useState(true);

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
      setLoadingResources(false);
      return;
    }

    let mounted = true;
    let loadedResources = {};

    setLoadingResources(true);

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
            shouldRevokeAudioSrc: false,
            imageSrcs: {},
            shouldRevokeImageSrcs: {},
            audioSrcs: {},
            shouldRevokeAudioSrcs: {},
            passageSrc: '',
          };

          const res = resourcesMap[part.id];
          const partAudio = part.audio?.url || part.resources?.audio;
          if (partAudio) {
            if (partAudio.startsWith('blob:')) {
              res.audioSrc = partAudio;
            } else {
              const loadedAudio = await loadAudioSource(partAudio);
              res.audioSrc = loadedAudio;
              res.shouldRevokeAudioSrc = Boolean(loadedAudio?.startsWith('blob:'));
            }
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
                    if (imageUrl.startsWith('blob:')) {
                      res.imageSrcs[opt.id] = imageUrl;
                    } else {
                      const loadedImage = await loadImageSource(imageUrl);
                      res.imageSrcs[opt.id] = loadedImage;
                      res.shouldRevokeImageSrcs[opt.id] = Boolean(loadedImage?.startsWith('blob:'));
                    }
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
                  if (qAudio.startsWith('blob:')) {
                    res.audioSrcs[q.id] = qAudio;
                  } else {
                    const loadedQuestionAudio = await loadAudioSource(qAudio);
                    res.audioSrcs[q.id] = loadedQuestionAudio;
                    res.shouldRevokeAudioSrcs[q.id] = Boolean(
                      loadedQuestionAudio?.startsWith('blob:'),
                    );
                  }
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
      setLoadingResources(false);
    };

    buildPreviewData();

    return () => {
      mounted = false;
      Object.values(loadedResources).forEach((res) => {
        if (res.shouldRevokeAudioSrc && res.audioSrc?.startsWith('blob:')) {
          URL.revokeObjectURL(res.audioSrc);
        }
        Object.entries(res.imageSrcs || {}).forEach(([id, url]) => {
          if (res.shouldRevokeImageSrcs?.[id] && url?.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        Object.entries(res.audioSrcs || {}).forEach(([id, url]) => {
          if (res.shouldRevokeAudioSrcs?.[id] && url?.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
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
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'dark.main',
        boxShadow: '0 6px 16px rgba(61, 30, 25, 0.06)',
        '@media print': {
          overflow: 'visible !important',
          height: 'auto !important',
          minHeight: 'auto !important',
        },
      }}
    >
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
          <Box sx={{ minWidth: 120 }} />
        )}
        <Box sx={{ ...listeningtestStyles.nameTestAndFormatPart, order: 0 }}>
          <Typography sx={listeningtestStyles.nameTest}>{basicInfo?.testName}</Typography>
          <Typography sx={listeningtestStyles.formatName}>
            {`Part ${indexPart + 1}: `}
            {getListeningTestTypeLabel(parts[indexPart]?.format || parts[indexPart]?.type)}
          </Typography>
        </Box>
        {showHeaderActions ? (
          <Box
            sx={{ ...listeningtestStyles.summitButtonWrapper, display: 'flex', gap: 1, order: 0 }}
          >
            <Button sx={listeningtestStyles.submitButton} disabled>
              Submit Test
            </Button>
          </Box>
        ) : (
          <Box sx={{ minWidth: 120 }} />
        )}
      </Box>
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
      <Box
        className="no-print"
        sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}
      >
        {loadingResources ? (
          <Box
            sx={{
              minHeight: '40vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          receptiveParts.map((part, index) => renderPart(part, index))
        )}
      </Box>

      <Box
        className="no-print"
        sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}
      >
        <Container maxWidth="lg" sx={listeningtestStyles.stepperContainer}>
          <Typography
            sx={{
              ...listeningtestStyles.backButton,
              display: indexPart === -1 || indexPart === 0 ? { xs: 'none', md: 'flex' } : 'flex',
              visibility: indexPart === -1 || indexPart === 0 ? 'hidden' : 'visible',
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
            Prev
          </Typography>{' '}
          <Typography sx={{ fontSize: '1rem' }}>
            Section {indexPart + 1} of {parts.length}
          </Typography>
          <Box
            sx={{
              ...listeningtestStyles.summitButtonWrapper,
              display:
                indexPart === receptiveParts.length - 1 ? { xs: 'none', md: 'flex' } : 'flex',
            }}
          >
            {indexPart !== receptiveParts.length - 1 && (
              <Button sx={listeningtestStyles.nextButton} onClick={goNextPart}>
                Next
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
