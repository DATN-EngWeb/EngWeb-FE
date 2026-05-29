export const messageBubbleStyles = {
  modeNoticeBox: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  modeNoticeText: {
    color: 'text.secondary',
    fontWeight: 700,
    textAlign: 'center',
    px: 2,
    py: 0.75,
  },
  userMessageStack: {
    flexDirection: 'row',
    gap: 0.5,
    justifyContent: 'flex-end',
  },
  userMessageBox: {
    maxWidth: { xs: '92%', md: '78%' },
  },
  userMessagePaper: {
    borderRadius: 4,
    px: 2,
    py: 1.5,
    color: 'text.primary',
    border: 'none',
  },
  userMessageText: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.8,
    fontSize: { xs: 15, md: 16 },
  },
  userTimestampBox: {
    display: 'block',
    mt: 0.75,
    color: 'text.disabled',
    textAlign: 'right',
  },
  userAvatar: {
    width: { xs: 30, sm: 34 },
    height: { xs: 30, sm: 34 },
    bgcolor: 'primary.main',
    boxShadow: '0 10px 24px rgba(255, 133, 75, 0.18)',
  },
  aiMessageStack: {
    flexDirection: 'row',
    gap: 0.5,
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: { xs: 30, sm: 34 },
    height: { xs: 30, sm: 34 },
    bgcolor: 'primary.main',
    boxShadow: '0 10px 24px rgba(83, 40, 34, 0.18)',
  },
  aiAvatarIcon: {
    fontSize: 18,
  },
  aiMessageBox: {
    maxWidth: { xs: '92%', md: '78%' },
  },
  aiMessagePaper: {
    borderRadius: 4,
    px: 2,
    py: 1.5,
    bgcolor: 'background.paper',
    color: 'text.primary',
    border: '1px solid rgba(83, 40, 34, 0.10)',
  },
  aiMessageText: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.8,
    fontSize: { xs: 15, md: 16 },
  },
  metaDataStack: {
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
    mt: 0.75,
    flexWrap: 'wrap',
  },
  timestampText: {
    variant: 'caption',
    fontSize: 12,
    color: 'text.disabled',
  },
  modeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    px: 0.75,
    py: 0.25,
    borderRadius: 1.5,
    bgcolor: 'rgba(83, 40, 34, 0.08)',
    border: '1px solid rgba(83, 40, 34, 0.15)',
    fontSize: 11,
    fontWeight: 600,
    color: 'text.secondary',
  },
};

export const getModeLabel = (mode) => {
  const modeLabels = {
    grammar: 'Grammar',
    translate: 'Translate',
    vocabulary: 'Vocabulary',
    brainstorm: 'Brainstorm',
    general: 'General',
  };
  return modeLabels[mode] || mode;
};

export const getUserMetaDataStackSx = () => ({
  ...messageBubbleStyles.metaDataStack,
  justifyContent: 'flex-end',
});

export const getTimestampTextSx = (isUserMessage = false) => ({
  ...messageBubbleStyles.timestampText,
  textAlign: isUserMessage ? 'right' : 'left',
});
