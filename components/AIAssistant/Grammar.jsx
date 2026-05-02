import { Box, Typography, Paper, Stack } from '@mui/material';
import {
  School as GraduationCapIcon,
  MenuBook as BookMarkedIcon,
  WarningAmber as AlertTriangleIcon,
} from '@mui/icons-material';
import { CopyButton, SectionCard } from './SharedComponents';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';

function renderInline(text) {
  const tokens = [];
  const regex = /(==[^=]+==|~~[^~]+~~|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    const raw = match[0];

    if (raw.startsWith('==')) {
      tokens.push(
        <Box
          key={`c-${key++}`}
          component="span"
          sx={{
            px: 0.5,
            py: 0.25,
            borderRadius: 1,
            bgcolor: 'rgba(16, 185, 129, 0.14)',
            color: 'rgb(16, 185, 129)',
            fontWeight: 700,
          }}
        >
          {raw.slice(2, -2)}
        </Box>,
      );
    } else if (raw.startsWith('~~')) {
      tokens.push(
        <Box
          key={`s-${key++}`}
          component="span"
          sx={{
            color: 'rgb(239, 68, 68)',
            textDecoration: 'line-through',
            textDecorationColor: 'rgba(239, 68, 68, 0.9)',
            textDecorationThickness: 2,
          }}
        >
          {raw.slice(2, -2)}
        </Box>,
      );
    } else if (raw.startsWith('**')) {
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

function parseJsonSafely(value) {
  if (typeof value !== 'string') return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function decodeEscapedText(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function extractStringField(raw, key) {
  if (typeof raw !== 'string') return '';

  const pattern = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`);
  const match = raw.match(pattern);
  if (!match) return '';

  return decodeEscapedText(match[1]).trim();
}

function extractArrayField(raw, key) {
  if (typeof raw !== 'string') return [];

  const startPattern = new RegExp(`"${key}"\\s*:\\s*\\[`, 'm');
  const startMatch = startPattern.exec(raw);
  if (!startMatch) return [];

  const startIndex = startMatch.index + startMatch[0].length;
  let depth = 1;
  let inString = false;
  let escaped = false;
  let endIndex = -1;

  for (let i = startIndex; i < raw.length; i += 1) {
    const ch = raw[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex < 0) return [];

  const content = raw.slice(startIndex, endIndex);
  const values = [];
  const valueRegex = /"((?:\\.|[^"\\])*)"/g;
  let valueMatch;

  while ((valueMatch = valueRegex.exec(content)) !== null) {
    const text = decodeEscapedText(valueMatch[1]).trim();
    if (text) values.push(text);
  }

  return values;
}

function normalizeTextList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeGrammarAnswer(answer) {
  let source = answer;
  let rawTextPayload = '';

  // Case 1: answer itself is JSON string
  if (typeof source === 'string') {
    rawTextPayload = source;
    source = parseJsonSafely(source) || {};
  }

  // Case 2: answer = { text: "{...}" }
  if (source && typeof source === 'object' && typeof source.text === 'string') {
    rawTextPayload = source.text;
    source = parseJsonSafely(source.text) || source;
  }

  // Case 3: nested content.text shape
  if (source && typeof source === 'object' && typeof source?.content?.text === 'string') {
    rawTextPayload = source.content.text;
    source = parseJsonSafely(source.content.text) || source;
  }

  // Fallback: text is JSON-like but malformed, try extracting key fields directly
  if (
    rawTextPayload &&
    (typeof source !== 'object' ||
      !source ||
      (!source.grammar_point && !source.explanation && !source.examples && !source.common_mistakes))
  ) {
    source = {
      grammar_point: extractStringField(rawTextPayload, 'grammar_point'),
      explanation: extractStringField(rawTextPayload, 'explanation'),
      examples: extractArrayField(rawTextPayload, 'examples'),
      common_mistakes: extractArrayField(rawTextPayload, 'common_mistakes'),
    };
  }

  const rawGrammarPoint = source?.grammar_point ?? source?.title;

  const grammarPoint = typeof rawGrammarPoint === 'string' ? rawGrammarPoint.trim() : '';
  const explanation = typeof source?.explanation === 'string' ? source.explanation.trim() : '';
  const examples = normalizeTextList(source?.examples)
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  const commonMistakes = normalizeTextList(source?.common_mistakes)
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  return {
    grammar_point: grammarPoint,
    explanation,
    examples,
    common_mistakes: commonMistakes,
  };
}

function RichText({ text }) {
  if (!text) return null;

  const raw = typeof text === 'string' ? text : String(text);
  const lines = raw.split(/\n+/).filter((l) => l.trim().length > 0);

  return (
    <Stack spacing={1}>
      {lines.map((line, i) => (
        <Typography key={i} fontSize={14} sx={{ lineHeight: 1.7 }}>
          {renderInline(line)}
        </Typography>
      ))}
    </Stack>
  );
}

function renderHighlightedExample(text) {
  if (typeof text !== 'string' || !text.trim()) return null;

  const trimmed = text.trim();
  const separatorIndex = trimmed.indexOf(' (');
  const english = separatorIndex >= 0 ? trimmed.slice(0, separatorIndex) : trimmed;
  const vietnamese = separatorIndex >= 0 ? trimmed.slice(separatorIndex) : '';

  const tokens = english.split(/(\s+)/);

  return (
    <Stack spacing={0.5}>
      <Typography fontSize={14} sx={{ lineHeight: 1.7 }}>
        {tokens.map((token, index) => {
          const normalized = token.toLowerCase().replace(/[.,!?;:]/g, '');
          const isPrimaryGrammar =
            /^(has|have)$/.test(normalized) ||
            /^(since|for)$/.test(normalized) ||
            /^(worked|known|studied|lived)$/.test(normalized);

          if (token.trim().length === 0) {
            return <span key={index}>{token}</span>;
          }

          if (isPrimaryGrammar) {
            return (
              <Box
                key={index}
                component="span"
                sx={{
                  px: 0.45,
                  py: 0.15,
                  borderRadius: 1,
                  bgcolor: 'rgba(16, 185, 129, 0.14)',
                  color: 'rgb(16, 185, 129)',
                  fontWeight: 700,
                }}
              >
                {token}
              </Box>
            );
          }

          return <span key={index}>{token}</span>;
        })}
      </Typography>

      {vietnamese && (
        <Typography fontSize={14} sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
          {vietnamese}
        </Typography>
      )}
    </Stack>
  );
}

export function GrammarResult({ answer }) {
  const { grammar_point, explanation, examples, common_mistakes } = normalizeGrammarAnswer(answer);

  return (
    <Box maxWidth={760} mx="auto">
      <Stack spacing={2}>
        {grammar_point && (
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
            <Stack direction="row" spacing={2} alignItems="center">
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
                <GraduationCapIcon />
              </Box>

              <Box flex={1}>
                <Typography
                  fontSize={12}
                  fontWeight={800}
                  textTransform="uppercase"
                  color="rgb(16, 185, 129)"
                  letterSpacing={0.7}
                >
                  Điểm ngữ pháp
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: 20, md: 22 },
                    lineHeight: 1.25,
                    fontWeight: 800,
                    color: 'rgb(15, 23, 42)',
                  }}
                >
                  {grammar_point}
                </Typography>
              </Box>

              <CopyButton text={grammar_point} />
            </Stack>
          </Paper>
        )}

        {explanation && (
          <SectionCard icon={BookMarkedIcon} label="Giải thích" iconTone="blue">
            <Box sx={{ p: 0 }}>
              <RichText text={explanation} />
            </Box>
          </SectionCard>
        )}

        {examples.length > 0 && (
          <SectionCard icon={ChecklistRoundedIcon} label="Ví dụ" iconTone="violet">
            <Stack spacing={1.25}>
              {examples.map((ex, i) => (
                <Paper
                  key={i}
                  sx={{
                    p: 1.25,
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    border: '1px solid rgba(15,23,42,0.04)',
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

                    <Box sx={{ flex: 1, minWidth: 0 }}>{renderHighlightedExample(ex)}</Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        )}

        {common_mistakes.length > 0 && (
          <SectionCard icon={AlertTriangleIcon} label="Lỗi thường gặp" iconTone="red">
            <Stack spacing={1.25}>
              {common_mistakes.map((m, i) => (
                <Paper
                  key={i}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,238,240,0.9)',
                    border: '1px solid rgba(255,200,210,0.4)',
                  }}
                >
                  <RichText text={m} />
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        )}
      </Stack>
    </Box>
  );
}
