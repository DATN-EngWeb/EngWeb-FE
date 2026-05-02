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

function splitVocab(item) {
  const paren = item.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (paren) return { main: paren[1].trim(), sub: paren[2].trim() };

  const hyphen = item.match(/^(.+?)\s*[-:]\s*(.+)$/);
  if (hyphen) return { main: hyphen[1].trim(), sub: hyphen[2].trim() };

  return { main: item };
}

function ChipList({ items = [], color = 'rgba(59,130,246,0.12)' }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {items.map((item, i) => {
        const { main, sub } = splitVocab(item);

        return (
          <Chip
            key={i}
            label={sub ? `${main} · ${sub}` : main}
            size="small"
            sx={{
              bgcolor: color,
              color: 'rgb(15, 23, 42)',
              fontWeight: 500,
              borderRadius: 999,
            }}
          />
        );
      })}
    </Stack>
  );
}

function OutlineBlock({ step, heading, points = [] }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, borderRadius: 3, borderColor: 'rgba(59, 130, 246, 0.2)', bgcolor: '#f8fbff' }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={step}
            size="small"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.15)',
              color: 'rgb(5, 150, 105)',
              fontWeight: 700,
            }}
          />
          <Typography fontWeight={600}>{heading}</Typography>
        </Stack>

        <Stack spacing={1}>
          {points.map((p, i) => (
            <Stack key={i} direction="row" spacing={1}>
              <ChevronRightIcon fontSize="small" />
              <Typography fontSize={14}>{p}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

const LINKING_LABELS = {
  adding_information: 'Bổ sung ý',
  cause_and_effect: 'Nguyên nhân – kết quả',
  contrast: 'Tương phản',
  emphasis: 'Nhấn mạnh',
  sequence: 'Trình tự',
  conclusion: 'Kết luận',
};

const LINKING_COLORS = {
  adding_information: 'rgba(56, 189, 248, 0.28)',
  cause_and_effect: 'rgba(250, 204, 21, 0.34)',
  contrast: 'rgba(196, 181, 253, 0.45)',
  emphasis: 'rgba(252, 165, 165, 0.4)',
  sequence: 'rgba(134, 239, 172, 0.42)',
  conclusion: 'rgba(125, 211, 252, 0.4)',
};

export function BrainstormResult({ answer }) {
  const {
    ideas = [],
    outline,
    useful_vocabulary,
    linking_words,
    sample_thesis,
    topic_sentences = [],
  } = answer || {};

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
    if (!outline) return null;

    const introPoints = (
      Array.isArray(outline.introduction)
        ? outline.introduction
        : outline.introduction?.points || []
    )
      .map((point) => (typeof point === 'string' ? point.trim() : ''))
      .filter(Boolean);

    let bodyParagraphs = [];
    if (Array.isArray(outline.body_paragraphs)) {
      bodyParagraphs = outline.body_paragraphs
        .map((bp) => ({
          heading:
            typeof (bp.heading || bp.title) === 'string' ? (bp.heading || bp.title).trim() : '',
          points: Array.isArray(bp.points)
            ? bp.points
            : bp.points
              ? [bp.points]
              : bp.body
                ? [bp.body]
                : [],
        }))
        .map((bp) => ({
          ...bp,
          points: bp.points
            .map((point) => (typeof point === 'string' ? point.trim() : ''))
            .filter(Boolean),
        }))
        .filter((bp) => bp.heading || bp.points.length > 0);
    } else if (Array.isArray(outline.body)) {
      bodyParagraphs = outline.body
        .map((b, i) => ({
          heading: `Thân bài ${i + 1}`,
          points: (Array.isArray(b) ? b : [b])
            .map((point) => (typeof point === 'string' ? point.trim() : ''))
            .filter(Boolean),
        }))
        .filter((bp) => bp.points.length > 0);
    }

    const conclusionPoints = (
      Array.isArray(outline.conclusion) ? outline.conclusion : outline.conclusion?.points || []
    )
      .map((point) => (typeof point === 'string' ? point.trim() : ''))
      .filter(Boolean);

    const hasOutlineContent =
      introPoints.length > 0 || bodyParagraphs.length > 0 || conclusionPoints.length > 0;

    if (!hasOutlineContent) return null;

    return {
      introduction: { points: introPoints },
      body_paragraphs: bodyParagraphs,
      conclusion: { points: conclusionPoints },
    };
  })();

  const normalizedUsefulVocab = (() => {
    if (!useful_vocabulary) return null;
    if (Array.isArray(useful_vocabulary)) {
      return {
        nouns: useful_vocabulary
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean),
      };
    }
    return useful_vocabulary;
  })();

  const normalizedLinking = (() => {
    if (!linking_words) return null;
    if (Array.isArray(linking_words)) {
      return {
        adding_information: linking_words
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean),
      };
    }
    return linking_words;
  })();

  const normalizedTopicSentences = (Array.isArray(topic_sentences) ? topic_sentences : [])
    .map((sentence) => (typeof sentence === 'string' ? sentence.trim() : ''))
    .filter(Boolean);

  const vocabGroups = [
    {
      key: 'nouns',
      label: 'Danh từ',
      items: normalizedUsefulVocab?.nouns || [],
      color: 'rgba(134, 239, 172, 0.45)',
    },
    {
      key: 'verbs',
      label: 'Động từ',
      items: normalizedUsefulVocab?.verbs || [],
      color: 'rgba(125, 211, 252, 0.45)',
    },
    {
      key: 'adjectives',
      label: 'Tính từ',
      items: normalizedUsefulVocab?.adjectives || [],
      color: 'rgba(250, 204, 21, 0.4)',
    },
  ].filter((g) => g.items.length > 0);

  return (
    <Box maxWidth={600} mx="auto">
      <Stack spacing={2}>
        {sampleThesis && (
          <Paper
            sx={{
              borderRadius: 4,
              p: 3,
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
              bgcolor: '#f9fbf7',
            }}
          >
            <Paper
              variant="outlined"
              sx={{ p: 1.5, borderRadius: 3, borderColor: 'rgba(15, 23, 42, 0.08)' }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <QuoteIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.25 }} />

                <Box flex={1}>
                  <Typography
                    fontSize={11}
                    fontWeight={800}
                    textTransform="uppercase"
                    color="text.secondary"
                    letterSpacing={0.5}
                  >
                    Luận điểm gợi ý
                  </Typography>

                  <Typography fontSize={18} fontWeight={700} lineHeight={1.45}>
                    {sampleThesis}
                  </Typography>
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
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    borderColor: 'rgba(59, 130, 246, 0.16)',
                    bgcolor: '#f8fbff',
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" mb={0.75}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'rgba(16,185,129,0.15)',
                        color: 'rgb(5,150,105)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </Box>

                    <Typography fontWeight={700} fontSize={18} lineHeight={1.35}>
                      {idea.subtopic}
                    </Typography>
                  </Stack>

                  {idea.points.length > 0 && (
                    <Stack mt={0.5} spacing={0.45} sx={{ pl: 3.5 }}>
                      {idea.points.map((p, j) => (
                        <Stack key={j} direction="row" spacing={1.25} alignItems="center">
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: 'rgb(16,185,129)',
                              flexShrink: 0,
                            }}
                          />
                          <Typography fontSize={15} lineHeight={1.5}>
                            {p}
                          </Typography>
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
          <SectionCard icon={ListTreeIcon} label="Dàn bài đề xuất">
            <Stack spacing={1.5}>
              <OutlineBlock
                step="MB"
                heading="Mở bài"
                points={normalizedOutline.introduction.points}
              />

              {(normalizedOutline.body_paragraphs || []).map((bp, i) => (
                <OutlineBlock
                  key={i}
                  step={`TB${i + 1}`}
                  heading={bp.heading || `Thân bài ${i + 1}`}
                  points={bp.points}
                />
              ))}

              <OutlineBlock
                step="KB"
                heading="Kết bài"
                points={normalizedOutline.conclusion.points}
              />
            </Stack>
          </SectionCard>
        )}

        {normalizedTopicSentences.length > 0 && (
          <SectionCard icon={PilcrowIcon} label="Câu chủ đề mẫu">
            <Stack spacing={1}>
              {normalizedTopicSentences.map((s, i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 1.25,
                    borderRadius: 3,
                    borderColor: 'rgba(59,130,246,0.15)',
                    bgcolor: '#f8fbff',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
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
                      {i + 1}
                    </Box>

                    <Typography flex={1} fontSize={13}>
                      {s}
                    </Typography>
                    <CopyButton text={s} compact />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        )}

        {/* Vocabulary */}
        {vocabGroups.length > 0 && (
          <SectionCard icon={BookMarkedIcon} label="Từ vựng gợi ý">
            <Stack spacing={1}>
              {vocabGroups.map((group) => (
                <Box key={group.key}>
                  <Typography
                    fontSize={11}
                    fontWeight={800}
                    textTransform="uppercase"
                    color="text.secondary"
                    letterSpacing={0.5}
                    mb={0.75}
                  >
                    {group.label}
                  </Typography>

                  <ChipList items={group.items} color={group.color} />
                </Box>
              ))}
            </Stack>
          </SectionCard>
        )}

        {normalizedLinking &&
          Object.entries(normalizedLinking).some(
            ([, words]) => Array.isArray(words) && words.filter(Boolean).length > 0,
          ) && (
            <SectionCard icon={LinkIcon} label="Từ nối hữu ích">
              <Stack spacing={1}>
                {Object.entries(normalizedLinking).map(([key, words]) => {
                  const normalizedWords = Array.isArray(words)
                    ? words
                        .map((item) => (typeof item === 'string' ? item.trim() : ''))
                        .filter(Boolean)
                    : [];

                  return normalizedWords.length > 0 ? (
                    <Box key={key}>
                      <Typography
                        fontSize={11}
                        fontWeight={800}
                        textTransform="uppercase"
                        color="text.secondary"
                        letterSpacing={0.5}
                        mb={0.75}
                      >
                        {LINKING_LABELS[key] || key}
                      </Typography>

                      <ChipList
                        items={normalizedWords}
                        color={LINKING_COLORS[key] || 'rgba(226,232,240,0.9)'}
                      />
                    </Box>
                  ) : null;
                })}
              </Stack>
            </SectionCard>
          )}
      </Stack>
    </Box>
  );
}
