import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import SyncAltRoundedIcon from '@mui/icons-material/SyncAltRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import { CopyButton, SectionCard } from './SharedComponents';
import {
  vocabularyStyles,
  getSynAntContainerSx,
  getSynAntBoxSx,
} from '../../styles/AIAssistant/VocabularyStyles';

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
        <Box key={`i-${key++}`} component="span" sx={vocabularyStyles.inlineItalic}>
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
    <Stack sx={vocabularyStyles.richTextStack}>
      {lines.map((line, index) => (
        <Typography key={index} sx={vocabularyStyles.richTextLine}>
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
    meaning: (entry.meaning || '').trim(),
    pronunciation_tip: (entry.pronunciation_tip || '').trim(),
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
        normalizeVocabularyEntry(details && typeof details === 'object' ? details : {}),
      )
      .filter(
        (entry) =>
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
  const { meaning, pronunciation_tip, collocations, synonyms, antonyms, examples } = entry;

  const hasMainHeader = !!meaning;
  const bothLists = synonyms.length > 0 && antonyms.length > 0;

  return (
    <Stack spacing={2}>
      {hasMainHeader && (
        <Paper elevation={2} sx={vocabularyStyles.vocabHeaderPaper}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={vocabularyStyles.vocabHeaderIcon}>
              <MenuBookRoundedIcon />
            </Box>

            <Box flex={1}>
              <Typography sx={vocabularyStyles.vocabHeaderLabel}>
                Từ vựng {total > 1 ? `${index + 1}/${total}` : ''}
              </Typography>

              <Typography sx={vocabularyStyles.vocabHeaderTitle}>
                {renderInline(meaning)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {pronunciation_tip && (
        <SectionCard icon={VolumeUpRoundedIcon} label="Mẹo phát âm" iconTone="violet">
          <Typography sx={vocabularyStyles.pronunciationTip}>
            {renderInline(pronunciation_tip)}
          </Typography>
        </SectionCard>
      )}

      {collocations.length > 0 && (
        <SectionCard icon={LayersRoundedIcon} label="Cụm từ thường đi kèm" iconTone="blue">
          <Stack spacing={1}>
            {collocations.map((item, itemIndex) => (
              <Paper key={itemIndex} sx={vocabularyStyles.collocationItem}>
                <Box sx={vocabularyStyles.collocationDot} />
                <Typography sx={vocabularyStyles.collocationText}>{item}</Typography>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      )}

      {(synonyms.length > 0 || antonyms.length > 0) && (
        <Box sx={getSynAntContainerSx(bothLists)}>
          {synonyms.length > 0 && (
            <Box sx={getSynAntBoxSx(bothLists)}>
              <SectionCard icon={SyncAltRoundedIcon} label="Từ đồng nghĩa" iconTone="green">
                <RichText text={synonyms} />
              </SectionCard>
            </Box>
          )}

          {antonyms.length > 0 && (
            <Box sx={getSynAntBoxSx(bothLists)}>
              <SectionCard icon={BlockRoundedIcon} label="Từ trái nghĩa" iconTone="red">
                <RichText text={antonyms} />
              </SectionCard>
            </Box>
          )}
        </Box>
      )}

      {examples.length > 0 && (
        <SectionCard icon={ChecklistRoundedIcon} label="Ví dụ" iconTone="violet">
          <Stack spacing={1.25}>
            {examples.map((example, exampleIndex) => (
              <Paper key={exampleIndex} sx={vocabularyStyles.examplePaper}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={vocabularyStyles.exampleBadge}>{exampleIndex + 1}</Box>

                  <Box>
                    <Typography sx={vocabularyStyles.exampleText}>{example}</Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      )}
    </Stack>
  );
}

export function VocabularyResult({ answer = {} }) {
  const entries = normalizeVocabularyAnswer(answer).filter((entry) => {
    const hasMain = !!(entry.meaning || entry.pronunciation_tip);
    const hasLists =
      entry.collocations.length > 0 ||
      entry.synonyms.length > 0 ||
      entry.antonyms.length > 0 ||
      entry.examples.length > 0;

    return hasMain || hasLists;
  });

  return (
    <Box sx={vocabularyStyles.resultRoot}>
      <Stack spacing={2}>
        {entries.map((entry, index) => (
          <VocabularyEntryCard
            key={`entry-${index}`}
            entry={entry}
            index={index}
            total={entries.length}
          />
        ))}
      </Stack>
    </Box>
  );
}
