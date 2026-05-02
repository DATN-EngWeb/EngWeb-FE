import { Box, Typography, Paper, Stack } from '@mui/material';
import {
  Translate as LanguagesIcon,
  MenuBook as BookOpenIcon,
  Lightbulb as LightbulbIcon,
  School as GraduationCapIcon,
} from '@mui/icons-material';
import { CopyButton, SectionCard } from './SharedComponents';

export function TranslationResult({ answer = {} }) {
  const translation = typeof answer?.translation === 'string' ? answer.translation.trim() : '';
  const literalTranslation =
    typeof answer?.literal_translation === 'string' ? answer.literal_translation.trim() : '';
  const phrases = answer?.word_or_phrase || answer?.notes?.difficult_words_phrases || {};
  const rawExplanation = answer?.explanation ?? answer?.notes?.explanation;

  const explanation = typeof rawExplanation === 'string' ? rawExplanation.trim() : '';
  const rawEnglishTip = answer?.english_tip ?? answer?.notes?.english_tip;

  const englishTip = typeof rawEnglishTip === 'string' ? rawEnglishTip.trim() : '';
  const phraseEntries = Object.entries(phrases).filter(([phrase, meaning]) => {
    const nextPhrase = typeof phrase === 'string' ? phrase.trim() : '';
    const nextMeaning = typeof meaning === 'string' ? meaning.trim() : '';
    return nextPhrase.length > 0 && nextMeaning.length > 0;
  });

  return (
    <Box maxWidth={760} mx="auto">
      <Stack spacing={2}>
        {(translation || literalTranslation) && (
          <Paper
            elevation={2}
            sx={{
              borderRadius: 5,
              p: 3,
              bgcolor: '#fbfbf4',
              border: '1px solid rgba(16, 185, 129, 0.18)',
              boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
            }}
          >
            {translation && (
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start" flex={1}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgb(16, 185, 129)',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <LanguagesIcon fontSize="small" />
                  </Box>

                  <Box flex={1}>
                    <Typography
                      fontSize={12}
                      fontWeight={800}
                      textTransform="uppercase"
                      color="rgb(16, 185, 129)"
                      letterSpacing={0.7}
                    >
                      Bản dịch tự nhiên
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: { xs: 22, md: 27 },
                        lineHeight: 1.3,
                        fontWeight: 800,
                        color: 'rgb(15, 23, 42)',
                      }}
                    >
                      {translation}
                    </Typography>
                  </Box>
                </Stack>

                <CopyButton text={translation} />
              </Stack>
            )}

            {literalTranslation && (
              <Paper
                sx={{
                  mt: translation ? 2 : 0,
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(15, 23, 42, 0.07)',
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(71, 85, 105, 0.08)',
                      color: 'rgb(71, 85, 105)',
                      mt: 0.25,
                      flexShrink: 0,
                    }}
                  >
                    <BookOpenIcon sx={{ fontSize: 15 }} />
                  </Box>

                  <Box>
                    <Typography
                      fontSize={11}
                      fontWeight={800}
                      textTransform="uppercase"
                      color="text.secondary"
                      letterSpacing={0.6}
                    >
                      Dịch sát nghĩa
                    </Typography>
                    <Typography
                      fontSize={14}
                      color="text.secondary"
                      sx={{ mt: 0.35, lineHeight: 1.65 }}
                    >
                      {literalTranslation}
                    </Typography>
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
                <Paper
                  key={phrase}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: 'rgba(59, 130, 246, 0.06)',
                    border: '1px solid rgba(59, 130, 246, 0.12)',
                  }}
                >
                  <Typography fontWeight={800} fontSize={14} color="rgb(15, 23, 42)">
                    "{phrase}"
                  </Typography>
                  <Typography
                    fontSize={14}
                    color="text.secondary"
                    sx={{ mt: 0.5, lineHeight: 1.6 }}
                  >
                    {meaning}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        )}

        {explanation && (
          <SectionCard icon={LightbulbIcon} label="Giải thích" iconTone="violet">
            <Typography
              fontSize={14}
              color="text.secondary"
              sx={{ lineHeight: 1.75, whiteSpace: 'pre-wrap' }}
            >
              {explanation}
            </Typography>
          </SectionCard>
        )}

        {englishTip && (
          <SectionCard icon={GraduationCapIcon} label="Mẹo tiếng Anh" iconTone="green">
            <Typography fontSize={14} color="text.secondary" sx={{ lineHeight: 1.75 }}>
              {englishTip}
            </Typography>
          </SectionCard>
        )}
      </Stack>
    </Box>
  );
}
