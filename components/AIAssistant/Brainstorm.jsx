import { Box, Typography, Chip, Paper, Stack } from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  AccountTree as ListTreeIcon,
  MenuBook as BookMarkedIcon,
  Link as LinkIcon,
  FormatQuote as QuoteIcon,
  Subject as PilcrowIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { CopyButton, SectionCard } from './SharedComponents';
import { brainstormStyles } from '../../styles/AIAssistant/BrainstormStyles';

function splitVocab(item) {
  const paren = item.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (paren) return { main: paren[1].trim(), sub: paren[2].trim() };

  const hyphen = item.match(/^(.+?)\s*[-:]\s*(.+)$/);
  if (hyphen) return { main: hyphen[1].trim(), sub: hyphen[2].trim() };

  return { main: item };
}

function ChipList({ items = [], color = 'rgba(59,130,246,0.12)' }) {
  return (
    <Stack direction={brainstormStyles.chipList.direction} flexWrap="wrap" gap={1}>
      {items.map((item, i) => {
        const { main, sub } = splitVocab(item);

        return (
          <Chip
            key={i}
            label={sub ? `${main} · ${sub}` : main}
            size="small"
            sx={{
              ...brainstormStyles.chipItem,
              bgcolor: color,
            }}
          />
        );
      })}
    </Stack>
  );
}

function OutlineBlock({ step, heading, points = [] }) {
  return (
    <Paper variant="outlined" sx={brainstormStyles.outlineBlock}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={step} size="small" sx={brainstormStyles.outlineStepChip} />
          <Typography sx={brainstormStyles.outlineHeading}>{heading}</Typography>
        </Stack>

        <Stack spacing={1}>
          {points.map((p, i) => (
            <Stack key={i} direction="row" spacing={1}>
              <ChevronRightIcon fontSize="small" />
              <Typography sx={brainstormStyles.outlinePoint}>{p}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

export function BrainstormResult({ answer }) {
  const source =
    answer && typeof answer === 'object' && answer.content && typeof answer.content === 'object'
      ? answer.content
      : answer || {};

  const {
    ideas = [],
    outline,
    useful_vocabulary,
    linking_words,
    sample_thesis,
    topic_sentences = [],
  } = source;

  const sampleThesis = typeof sample_thesis === 'string' ? sample_thesis.trim() : '';

  const normalizedIdeas = (Array.isArray(ideas) ? ideas : [])
    .map((idea) => {
      const subtopic = typeof idea?.subtopic === 'string' ? idea.subtopic.trim() : '';
      const points = (Array.isArray(idea?.points) ? idea.points : [])
        .map((p) => (typeof p === 'string' ? p.trim() : ''))
        .filter(Boolean);

      return { subtopic, points };
    })
    .filter((idea) => idea.subtopic || idea.points.length > 0);

  const normalizedOutline = (() => {
    if (!outline || typeof outline !== 'object') return null;

    const introduction = (Array.isArray(outline.introduction) ? outline.introduction : [])
      .map((point) => (typeof point === 'string' ? point.trim() : ''))
      .filter(Boolean);

    const body = (Array.isArray(outline.body) ? outline.body : [])
      .map((point) => (typeof point === 'string' ? point.trim() : ''))
      .filter(Boolean);

    const conclusion = (Array.isArray(outline.conclusion) ? outline.conclusion : [])
      .map((point) => (typeof point === 'string' ? point.trim() : ''))
      .filter(Boolean);

    if (introduction.length === 0 && body.length === 0 && conclusion.length === 0) return null;

    return { introduction, body, conclusion };
  })();

  const normalizedUsefulVocab = (Array.isArray(useful_vocabulary) ? useful_vocabulary : [])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  const normalizedLinking = (Array.isArray(linking_words) ? linking_words : [])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  const normalizedTopicSentences = (Array.isArray(topic_sentences) ? topic_sentences : [])
    .map((sentence) => (typeof sentence === 'string' ? sentence.trim() : ''))
    .filter(Boolean);

  return (
    <Box sx={brainstormStyles.root}>
      <Stack spacing={2}>
        {sampleThesis && (
          <Paper sx={brainstormStyles.thesisWrapper}>
            <Paper variant="outlined" sx={brainstormStyles.thesisCard}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <QuoteIcon fontSize="small" sx={brainstormStyles.thesisQuoteIcon} />

                <Box flex={1}>
                  <Typography sx={brainstormStyles.thesisMeta}>Luận điểm gợi ý</Typography>

                  <Typography sx={brainstormStyles.thesisText}>{sampleThesis}</Typography>
                </Box>

                <CopyButton text={sampleThesis} compact />
              </Stack>
            </Paper>
          </Paper>
        )}

        {normalizedIdeas.length > 0 && (
          <SectionCard icon={LightbulbIcon} label="Ý tưởng theo chủ đề nhỏ">
            <Stack spacing={1.5}>
              {normalizedIdeas.map((idea, i) => (
                <Paper key={i} variant="outlined" sx={brainstormStyles.ideaCard}>
                  <Stack direction="row" spacing={1.25} alignItems="center" mb={0.75}>
                    <Box sx={brainstormStyles.ideaOrderBadge}>{i + 1}</Box>

                    <Typography sx={brainstormStyles.ideaHeading}>{idea.subtopic}</Typography>
                  </Stack>

                  {idea.points.length > 0 && (
                    <Stack mt={0.5} spacing={0.45} sx={brainstormStyles.ideaPointList}>
                      {idea.points.map((p, j) => (
                        <Stack key={j} direction="row" spacing={1.25} alignItems="center">
                          <Box sx={brainstormStyles.ideaPointDot} />
                          <Typography sx={brainstormStyles.ideaPointText}>{p}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        )}

        {normalizedOutline && (
          <SectionCard
            icon={ListTreeIcon}
            sx={brainstormStyles.outlineSection}
            label="Dàn bài đề xuất"
          >
            <Stack spacing={1.5}>
              <OutlineBlock step="MB" heading="Mở bài" points={normalizedOutline.introduction} />

              <OutlineBlock step="TB" heading="Thân bài" points={normalizedOutline.body} />

              <OutlineBlock step="KB" heading="Kết bài" points={normalizedOutline.conclusion} />
            </Stack>
          </SectionCard>
        )}

        {normalizedTopicSentences.length > 0 && (
          <SectionCard icon={PilcrowIcon} label="Câu chủ đề mẫu">
            <Stack spacing={1}>
              {normalizedTopicSentences.map((s, i) => (
                <Paper key={i} variant="outlined" sx={brainstormStyles.topicSentenceCard}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={brainstormStyles.topicSentenceBadge}>{i + 1}</Box>

                    <Typography sx={brainstormStyles.topicSentenceText}>{s}</Typography>
                    <CopyButton text={s} compact />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        )}

        {/* Vocabulary */}
        {normalizedUsefulVocab.length > 0 && (
          <SectionCard icon={BookMarkedIcon} label="Từ vựng gợi ý">
            <ChipList items={normalizedUsefulVocab} color="rgba(134, 239, 172, 0.45)" />
          </SectionCard>
        )}

        {normalizedLinking.length > 0 && (
          <SectionCard icon={LinkIcon} label="Từ nối hữu ích">
            <ChipList items={normalizedLinking} color="rgba(125, 211, 252, 0.4)" />
          </SectionCard>
        )}
      </Stack>
    </Box>
  );
}
