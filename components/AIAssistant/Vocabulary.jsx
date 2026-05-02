import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import SyncAltRoundedIcon from '@mui/icons-material/SyncAltRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import { CopyButton, SectionCard } from './SharedComponents';

function renderInline(text) {
  const tokens = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    const raw = match[0];
    if (raw.startsWith('**')) {
      tokens.push(<strong key={`b-${key++}`}>{raw.slice(2, -2)}</strong>);
    } else {
      tokens.push(
        <Box
          key={`i-${key++}`}
          component="span"
          sx={{
            px: 0.5,
            py: 0.25,
            borderRadius: 1,
            bgcolor: 'warning.light',
            fontStyle: 'italic',
            fontWeight: 500,
          }}
        >
          {raw.slice(1, -1)}
        </Box>,
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

function RichText({ text }) {
  if (text == null) return null;

  const raw = Array.isArray(text)
    ? text.join('\n')
    : typeof text === 'string'
      ? text
      : String(text);

  const lines = raw.split(/\n+/).filter((line) => line.trim().length > 0);

  return (
    <Stack spacing={1.1}>
      {lines.map((line, index) => (
        <Typography key={index} fontSize={14} lineHeight={1.65}>
          {renderInline(line)}
        </Typography>
      ))}
    </Stack>
  );
}

function normalizeTextList(value) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function normalizeVocabularyEntry(entry = {}) {
  return {
    word: (entry.word || entry.term || entry.title || '').trim(),
    meaning: (entry.meaning || entry.definition || '').trim(),
    pronunciation_tip: (entry.pronunciation_tip || entry.pronunciationTip || '').trim(),
    collocations: normalizeTextList(entry.collocations),
    synonyms: normalizeTextList(entry.synonyms),
    antonyms: normalizeTextList(entry.antonyms),
    examples: normalizeTextList(entry.examples),
  };
}

function normalizeVocabularyAnswer(answer = {}) {
  const vocabularyList = answer?.content?.vocabulary_list || answer?.vocabulary_list;
  const vocabularyMap = answer?.content?.vocabulary || answer?.vocabulary;

  if (Array.isArray(vocabularyList)) {
    return vocabularyList.map((entry) => normalizeVocabularyEntry(entry));
  }

  if (vocabularyMap && typeof vocabularyMap === 'object' && !Array.isArray(vocabularyMap)) {
    return Object.entries(vocabularyMap)
      .map(([word, details]) =>
        normalizeVocabularyEntry({
          word,
          ...(details && typeof details === 'object' ? details : {}),
        }),
      )
      .filter(
        (entry) =>
          entry.word ||
          entry.meaning ||
          entry.pronunciation_tip ||
          entry.collocations.length > 0 ||
          entry.synonyms.length > 0 ||
          entry.antonyms.length > 0 ||
          entry.examples.length > 0,
      );
  }

  return [normalizeVocabularyEntry(answer?.content || answer)];
}

function VocabularyEntryCard({ entry, index, total }) {
  const { word, meaning, pronunciation_tip, collocations, synonyms, antonyms, examples } = entry;

  const title = word || null;
  const hasMainHeader = !!(word || meaning);

  const hasBoth = synonyms.length > 0 && antonyms.length > 0;

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 5,
        p: 3,
        bgcolor: '#f7fbff',
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0.03) 38%, rgba(255,255,255,0) 62%)',
        border: '1px solid rgba(59, 130, 246, 0.18)',
        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.055)',
      }}
    >
      {hasMainHeader && (
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="flex-start" flex={1}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: 'rgb(59, 130, 246)',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <MenuBookRoundedIcon />
            </Avatar>

            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Typography
                  fontSize={12}
                  fontWeight={800}
                  textTransform="uppercase"
                  color="rgb(59, 130, 246)"
                  letterSpacing={0.7}
                >
                  Từ vựng {total > 1 ? `${index + 1}/${total}` : ''}
                </Typography>
                {title && (
                  <Chip
                    label={title}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: 'rgba(59, 130, 246, 0.10)' }}
                  />
                )}
              </Stack>

              {meaning && (
                <Typography fontSize={14} color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.6 }}>
                  {renderInline(meaning)}
                </Typography>
              )}
            </Box>
          </Stack>

          {word && <CopyButton text={word} compact />}
        </Stack>
      )}

      {pronunciation_tip && (
        <Paper
          sx={{
            mt: 2,
            mb: 2,
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
                bgcolor: 'rgba(59, 130, 246, 0.08)',
                color: 'rgb(37, 99, 235)',
                mt: 0.25,
                flexShrink: 0,
              }}
            >
              <VolumeUpRoundedIcon sx={{ fontSize: 15 }} />
            </Box>

            <Box>
              <Typography
                fontSize={11}
                fontWeight={800}
                textTransform="uppercase"
                color="text.secondary"
                letterSpacing={0.6}
              >
                Mẹo phát âm
              </Typography>

              <Typography fontSize={14} color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.65 }}>
                {renderInline(pronunciation_tip)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {collocations.length > 0 && (
        <SectionCard icon={LayersRoundedIcon} label="Cụm từ thường đi kèm" iconTone="blue">
          <Paper
            sx={{
              p: 1.25,
              borderRadius: 3,
              border: '1px solid rgba(15,23,42,0.04)',
              bgcolor: 'transparent',
            }}
          >
            <Stack spacing={1}>
              {collocations.map((item, itemIndex) => {
                return (
                  <Paper
                    key={itemIndex}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.15,
                      pl: 1.35,
                      borderRadius: 3,
                      bgcolor: '#ffffff',
                      border: '1px solid rgba(15,23,42,0.04)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ flexShrink: 0 }}>
                      <Box
                        sx={{
                          bgcolor: 'rgb(234, 241, 255)',
                          color: 'rgb(37, 99, 235)',
                          px: 1.25,
                          py: 0.5,
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {item}
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </Paper>
        </SectionCard>
      )}

      {(synonyms.length > 0 || antonyms.length > 0) && (
        <Box display="flex" gap={2} sx={{ mt: 2, mb: 2 }}>
          {synonyms.length > 0 && (
            <Box flex={hasBoth ? 1 : 1}>
              <SectionCard
                icon={SyncAltRoundedIcon}
                label="Từ đồng nghĩa"
                iconTone="green"
                sx={{ flex: 1, p: 1.25 }}
              >
                <RichText text={synonyms} />
              </SectionCard>
            </Box>
          )}

          {antonyms.length > 0 && (
            <Box flex={hasBoth ? 1 : 1}>
              <SectionCard
                icon={BlockRoundedIcon}
                label="Từ trái nghĩa"
                iconTone="red"
                sx={{ flex: 1, p: 1.25 }}
              >
                <RichText text={antonyms} />
              </SectionCard>
            </Box>
          )}
        </Box>
      )}

      {examples.length > 0 && (
        <SectionCard icon={ChecklistRoundedIcon} label="Ví dụ" iconTone="violet">
          <Stack spacing={1.25}>
            {examples.map((example, exampleIndex) => {
              return (
                <Paper
                  key={exampleIndex}
                  sx={{
                    p: 1.25,
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    border: '1px solid rgba(15,23,42,0.04)',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'rgba(168,85,247,0.14)',
                        color: 'rgb(147,51,234)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {exampleIndex + 1}
                    </Box>
                    <Box>
                      <Typography fontSize={14} color="text.primary">
                        {example}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </SectionCard>
      )}
    </Paper>
  );
}

export function VocabularyResult({ answer = {} }) {
  const entries = normalizeVocabularyAnswer(answer).filter((entry) => {
    const hasMain = !!(entry.word || entry.meaning || entry.pronunciation_tip);
    const hasLists =
      entry.collocations.length > 0 ||
      entry.synonyms.length > 0 ||
      entry.antonyms.length > 0 ||
      entry.examples.length > 0;

    return hasMain || hasLists;
  });

  return (
    <Box maxWidth={600} mx="auto">
      <Stack spacing={2}>
        {entries.map((entry, index) => (
          <VocabularyEntryCard
            key={`${entry.word || 'entry'}-${index}`}
            entry={entry}
            index={index}
            total={entries.length}
          />
        ))}
      </Stack>
    </Box>
  );
}
