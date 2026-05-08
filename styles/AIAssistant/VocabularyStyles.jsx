export const vocabularyStyles = {
  inlineItalic: {
    px: 0.5,
    py: 0.25,
    borderRadius: 1,
    bgcolor: 'warning.light',
    fontStyle: 'italic',
    fontWeight: 500,
  },
  richTextStack: {
    spacing: 1.1,
  },
  richTextLine: {
    fontSize: 14,
    lineHeight: 1.65,
  },
  resultRoot: {
    maxWidth: 600,
    mx: 'auto',
  },
  vocabHeaderPaper: {
    borderRadius: 5,
    p: 3,
    bgcolor: '#fbfbf4',
    border: '1px solid rgba(15, 23, 42, 0.07)',
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
  },
  vocabHeaderIcon: {
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
  vocabHeaderLabel: {
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'uppercase',
    color: 'rgb(16, 185, 129)',
    letterSpacing: 0.7,
  },
  vocabHeaderTitle: {
    mt: 0.5,
    fontSize: { xs: 20, md: 22 },
    lineHeight: 1.25,
    fontWeight: 800,
    color: 'rgb(15, 23, 42)',
  },
  pronunciationTip: {
    fontSize: 14,
    color: 'text.secondary',
    lineHeight: 1.75,
  },
  collocationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    p: 1.25,
    pl: 1.5,
    borderRadius: 3,
    bgcolor: '#ffffff',
    border: '1px solid rgba(15,23,42,0.04)',
  },
  collocationDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    bgcolor: 'black',
    flexShrink: 0,
    mt: 0.4,
  },
  collocationText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'text.primary',
    lineHeight: 1.6,
  },
  synAntContainer: {
    display: 'flex',
    gap: 2,
    flexWrap: 'nowrap',
  },
  synAntSingle: {
    display: 'flex',
    gap: 2,
    flexWrap: 'wrap',
  },
  synAntBox: {
    flex: 1,
    minWidth: 0,
  },
  synAntBoxSingle: {
    flex: 'unset',
    minWidth: 280,
  },
  examplePaper: {
    p: 1.25,
    borderRadius: 3,
    bgcolor: '#ffffff',
    border: '1px solid rgba(15,23,42,0.04)',
  },
  exampleBadge: {
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
  exampleText: {
    fontSize: 14,
    color: 'text.primary',
    lineHeight: 1.65,
  },
};

export const getSynAntContainerSx = (bothLists) =>
  bothLists ? vocabularyStyles.synAntContainer : vocabularyStyles.synAntSingle;

export const getSynAntBoxSx = (bothLists) =>
  bothLists ? vocabularyStyles.synAntBox : vocabularyStyles.synAntBoxSingle;
