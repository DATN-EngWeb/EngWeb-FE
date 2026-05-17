export const getRichListItemSx = (level, isNested) => ({
  ml: `${level * 1.5}rem`,
  pl: 1.5,
  py: 1,
  borderLeft: '3px solid',
  borderColor: isNested ? 'rgba(148, 163, 184, 0.5)' : 'rgba(16, 185, 129, 0.65)',
  borderRadius: 1,
  bgcolor: isNested ? 'rgba(248, 250, 252, 0.72)' : 'rgba(236, 253, 245, 0.85)',
});

export const getRichListTextSx = (isNested, isHeading) => ({
  lineHeight: 1.75,
  flex: 1,
  minWidth: 0,
  fontWeight: isHeading ? 700 : 400,
  color: isNested ? 'text.primary' : 'rgb(15, 23, 42)',
  '& strong': {
    color: 'rgb(15, 23, 42)',
  },
});

export const getRichParagraphSx = (isStrongHeading) => ({
  lineHeight: 1.8,
  color: 'text.primary',
  fontWeight: isStrongHeading ? 700 : 400,
  mt: isStrongHeading ? 0.25 : 0,
  '& strong': {
    color: 'rgb(15, 23, 42)',
  },
});

export const grammarStyles = {
  inlineHighlight: {
    px: 0.5,
    py: 0.25,
    borderRadius: 1,
    bgcolor: 'rgba(16, 185, 129, 0.14)',
    color: 'rgb(16, 185, 129)',
    fontWeight: 700,
  },
  inlineStrike: {
    color: 'rgb(239, 68, 68)',
    textDecoration: 'line-through',
    textDecorationColor: 'rgba(239, 68, 68, 0.9)',
    textDecorationThickness: 2,
  },
  inlineItalic: {
    fontStyle: 'italic',
    fontWeight: 500,
    color: 'inherit',
  },
  richListStack: {
    spacing: 0.65,
  },
  richTextRoot: {
    spacing: 1.15,
  },
  highlightedExampleEnglish: {
    lineHeight: 1.7,
  },
  highlightedExampleVietnamese: {
    lineHeight: 1.7,
    color: 'text.secondary',
  },
  resultRoot: {
    maxWidth: 760,
    mx: 'auto',
  },
  grammarPointPaper: {
    borderRadius: 5,
    p: 3,
    bgcolor: '#fbfbf4',
    border: '1px solid rgba(16, 185, 129, 0.18)',
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
  },
  grammarPointIconWrap: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'rgb(16, 185, 129)',
    color: '#fff',
    flexShrink: 0,
  },
  grammarPointLabel: {
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'uppercase',
    color: 'rgb(16, 185, 129)',
    letterSpacing: 0.7,
  },
  grammarPointTitle: {
    mt: 0.5,
    fontSize: { xs: 20, md: 22 },
    lineHeight: 1.25,
    fontWeight: 800,
    color: 'rgb(15, 23, 42)',
  },
  resetPadding: {
    p: 0,
  },
  examplePaper: {
    p: 1.25,
    borderRadius: 3,
    bgcolor: '#ffffff',
    border: '1px solid rgba(15,23,42,0.04)',
  },
  exampleOrderBadge: {
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
  },
  growMinWidth: {
    flex: 1,
    minWidth: 0,
  },
  commonMistakePaper: {
    p: 1.25,
    borderRadius: 2,
    bgcolor: 'rgba(255,238,240,0.9)',
    border: '1px solid rgba(255,200,210,0.4)',
  },
  englishTip: {
    fontSize: 14,
    color: 'text.secondary',
    lineHeight: 1.75,
  },
};
