import { Box, Typography, Paper, Stack } from '@mui/material';
import {
  Translate as LanguagesIcon,
  MenuBook as BookOpenIcon,
  Lightbulb as LightbulbIcon,
  School as GraduationCapIcon,
} from '@mui/icons-material';
import { CopyButton, SectionCard } from './SharedComponents';
import { getLiteralPaperSx, translationStyles } from '../../styles/AIAssistant/TranslationStyles';

export function TranslationResult({ answer = {} }) {
  const translation = typeof answer?.translation === 'string' ? answer.translation.trim() : '';
  const literalTranslation =
    typeof answer?.literal_translation === 'string' ? answer.literal_translation.trim() : '';
  const phrases = answer?.word_or_phrase || {};
  const rawExplanation = answer?.explanation;

  const explanation = typeof rawExplanation === 'string' ? rawExplanation.trim() : '';
  const rawEnglishTip = answer?.english_tip;

  const englishTip = typeof rawEnglishTip === 'string' ? rawEnglishTip.trim() : '';
  const phraseEntries = Object.entries(phrases).filter(([phrase, meaning]) => {
    const nextPhrase = typeof phrase === 'string' ? phrase.trim() : '';
    const nextMeaning = typeof meaning === 'string' ? meaning.trim() : '';
    return nextPhrase.length > 0 && nextMeaning.length > 0;
  });

  return (
    <Box sx={translationStyles.root}>
      <Stack spacing={2}>
        {(translation || literalTranslation) && (
          <Paper elevation={2} sx={translationStyles.translationPaper}>
            {translation && (
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start" flex={1}>
                  <Box sx={translationStyles.translationIconWrap}>
                    <LanguagesIcon fontSize="small" />
                  </Box>

                  <Box flex={1}>
                    <Typography sx={translationStyles.translationLabel}>
                      Bản dịch tự nhiên
                    </Typography>

                    <Typography sx={translationStyles.translationText}>{translation}</Typography>
                  </Box>
                </Stack>

                <CopyButton text={translation} />
              </Stack>
            )}

            {literalTranslation && (
              <Paper sx={getLiteralPaperSx(Boolean(translation))}>
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Box sx={translationStyles.literalIconWrap}>
                    <BookOpenIcon sx={translationStyles.literalIcon} />
                  </Box>

                  <Box>
                    <Typography sx={translationStyles.literalLabel}>Dịch sát nghĩa</Typography>
                    <Typography sx={translationStyles.literalText}>{literalTranslation}</Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Paper>
        )}

        {phraseEntries.length > 0 && (
          <SectionCard icon={BookOpenIcon} label="Từ & cụm khó">
            <Stack spacing={1.5}>
              {phraseEntries.map(([phrase, meaning]) => (
                <Paper key={phrase} sx={translationStyles.phrasePaper}>
                  <Typography sx={translationStyles.phraseTitle}>"{phrase}"</Typography>
                  <Typography sx={translationStyles.phraseMeaning}>{meaning}</Typography>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        )}

        {explanation && (
          <SectionCard icon={LightbulbIcon} label="Giải thích" iconTone="violet">
            <Typography sx={translationStyles.explanationText}>{explanation}</Typography>
          </SectionCard>
        )}

        {englishTip && (
          <SectionCard icon={GraduationCapIcon} label="Mẹo tiếng Anh" iconTone="green">
            <Typography sx={translationStyles.englishTipText}>{englishTip}</Typography>
          </SectionCard>
        )}
      </Stack>
    </Box>
  );
}
