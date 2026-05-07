import { Box, Typography, Paper, Stack } from '@mui/material';
import {
  School as GraduationCapIcon,
  MenuBook as BookMarkedIcon,
  WarningAmber as AlertTriangleIcon,
} from '@mui/icons-material';
import { CopyButton, SectionCard } from './SharedComponents';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import {
  grammarStyles,
  getRichListItemSx,
  getRichListTextSx,
  getRichParagraphSx,
} from '../../styles/AIAssistant/GrammarStyles';

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
        <Box key={`c-${key++}`} component="span" sx={grammarStyles.inlineHighlight}>
          {raw.slice(2, -2)}
        </Box>,
      );
    } else if (raw.startsWith('~~')) {
      tokens.push(
        <Box key={`s-${key++}`} component="span" sx={grammarStyles.inlineStrike}>
          {raw.slice(2, -2)}
        </Box>,
      );
    } else if (raw.startsWith('**')) {
      tokens.push(<strong key={`b-${key++}`}>{raw.slice(2, -2)}</strong>);
    } else {
      tokens.push(
        <Box key={`i-${key++}`} component="span" sx={grammarStyles.inlineItalic}>
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

function normalizeTextList(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    const parsed = parseJsonSafely(value);

    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'string') return [parsed];

    return [value];
  }

  if (typeof value === 'object') {
    return Object.values(value);
  }

  return [value];
}

function normalizeGrammarAnswer(answer) {
  let source = answer;

  // Case 1: answer itself is JSON string
  if (typeof source === 'string') {
    source = parseJsonSafely(source) || {};
  }

  // Case 2: answer = { text: "{...}" }
  if (source && typeof source === 'object' && typeof source.text === 'string') {
    source = parseJsonSafely(source.text) || source;
  }

  // Case 3: nested content.text shape
  if (source && typeof source === 'object' && typeof source?.content?.text === 'string') {
    source = parseJsonSafely(source.content.text) || source;
  }

  const rawGrammarPoint = source?.grammar_point;

  const grammarPoint = typeof rawGrammarPoint === 'string' ? rawGrammarPoint.trim() : '';
  const explanation = typeof source?.explanation === 'string' ? source.explanation.trim() : '';
  const examples = normalizeTextList(source?.examples)
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  const rawCommonMistakes = source?.common_mistakes;
  const commonMistakes = normalizeTextList(rawCommonMistakes)
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  const englishTip = typeof source?.english_tip === 'string' ? source.english_tip.trim() : '';

  return {
    grammar_point: grammarPoint,
    explanation,
    examples,
    common_mistakes: commonMistakes,
    english_tip: englishTip,
  };
}

function RichText({ text }) {
  if (!text) return null;

  const raw = typeof text === 'string' ? text : String(text);
  const lines = raw.replace(/\r\n/g, '\n').split('\n');

  const blocks = [];
  let paragraphLines = [];
  let listItems = [];
  let listBaseIndent = null;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;

    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;

    blocks.push({ type: 'list', items: listItems });
    listItems = [];
    listBaseIndent = null;
  };

  lines.forEach((line) => {
    const trimmedRight = line.trimEnd();

    if (!trimmedRight.trim()) {
      flushParagraph();
      flushList();
      return;
    }

    const bulletMatch = trimmedRight.match(/^(\s*)[*-]\s+(.*)$/);

    if (bulletMatch) {
      flushParagraph();

      const indent = bulletMatch[1].length;

      if (listBaseIndent === null) {
        listBaseIndent = indent;
      }

      const level = Math.max(0, Math.floor((indent - listBaseIndent) / 2));

      listItems.push({ level, text: bulletMatch[2].trim() });
      return;
    }

    flushList();
    paragraphLines.push(trimmedRight.trim());
  });

  flushParagraph();
  flushList();

  const renderBullet = (item, itemIndex) => {
    const isNested = item.level > 0;
    const isHeading = /^\*\*.+\*\*$/.test(item.text);

    return (
      <Box key={`item-${itemIndex}`} sx={getRichListItemSx(item.level, isNested)}>
        <Typography fontSize={14} sx={getRichListTextSx(isNested, isHeading)}>
          {renderInline(item.text)}
        </Typography>
      </Box>
    );
  };

  return (
    <Stack spacing={grammarStyles.richTextRoot.spacing}>
      {blocks.map((block, i) => {
        if (block.type === 'list') {
          return (
            <Stack key={`list-${i}`} spacing={grammarStyles.richListStack.spacing}>
              {block.items.map((item, itemIndex) => renderBullet(item, itemIndex))}
            </Stack>
          );
        }

        const isStrongHeading = /^\*\*.+\*\*$/.test(block.text);

        return (
          <Typography key={`p-${i}`} fontSize={14} sx={getRichParagraphSx(isStrongHeading)}>
            {renderInline(block.text)}
          </Typography>
        );
      })}
    </Stack>
  );
}

function renderHighlightedExample(text) {
  if (typeof text !== 'string' || !text.trim()) return null;

  const trimmed = text.trim();
  const separatorIndex = trimmed.indexOf(' (');
  const english = separatorIndex >= 0 ? trimmed.slice(0, separatorIndex) : trimmed;
  const vietnamese = separatorIndex >= 0 ? trimmed.slice(separatorIndex) : '';

  return (
    <Stack spacing={0.5}>
      <Typography fontSize={14} sx={grammarStyles.highlightedExampleEnglish}>
        {renderInline(english)}
      </Typography>

      {vietnamese && (
        <Typography fontSize={14} sx={grammarStyles.highlightedExampleVietnamese}>
          {vietnamese}
        </Typography>
      )}
    </Stack>
  );
}

export function GrammarResult({ answer }) {
  const { grammar_point, explanation, examples, common_mistakes, english_tip } =
    normalizeGrammarAnswer(answer);

  return (
    <Box sx={grammarStyles.resultRoot}>
      <Stack spacing={2}>
        {grammar_point && (
          <Paper elevation={2} sx={grammarStyles.grammarPointPaper}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={grammarStyles.grammarPointIconWrap}>
                <GraduationCapIcon />
              </Box>

              <Box flex={1}>
                <Typography sx={grammarStyles.grammarPointLabel}>Điểm ngữ pháp</Typography>

                <Typography sx={grammarStyles.grammarPointTitle}>{grammar_point}</Typography>
              </Box>

              <CopyButton text={grammar_point} />
            </Stack>
          </Paper>
        )}

        {explanation && (
          <SectionCard icon={BookMarkedIcon} label="Giải thích" iconTone="blue">
            <Box sx={grammarStyles.resetPadding}>
              <RichText text={explanation} />
            </Box>
          </SectionCard>
        )}

        {examples.length > 0 && (
          <SectionCard icon={ChecklistRoundedIcon} label="Ví dụ" iconTone="violet">
            <Stack spacing={1.25}>
              {examples.map((ex, i) => (
                <Paper key={i} sx={grammarStyles.examplePaper}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={grammarStyles.exampleOrderBadge}>{i + 1}</Box>

                    <Box sx={grammarStyles.growMinWidth}>{renderHighlightedExample(ex)}</Box>
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
                <Paper key={i} sx={grammarStyles.commonMistakePaper}>
                  <RichText text={m} />
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        )}

        {english_tip && (
          <SectionCard icon={GraduationCapIcon} label="Mẹo tiếng Anh" iconTone="green">
            <Typography sx={grammarStyles.englishTip}>{english_tip}</Typography>
          </SectionCard>
        )}
      </Stack>
    </Box>
  );
}
