export const selectMenuProps = {
  PaperProps: {
    sx: {
      mt: 1,
      borderRadius: 3,
      border: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: '0 18px 48px rgba(15, 23, 42, 0.12)',
    },
  },
};

export const chatAreaStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    bgcolor: 'background.default',
  },
  header: {
    p: { xs: 2, md: 3 },
    pb: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
  title: {
    fontWeight: 900,
    lineHeight: 1.1,
  },
  quotaCaption: {
    mt: 0.5,
    color: 'text.secondary',
  },
  quotaValue: {
    fontWeight: 700,
    color: 'primary.main',
  },
  quotaReset: {
    ml: 1,
  },
  messagesContainer: {
    px: { xs: 2, md: 3 },
    pt: 2,
    pb: 1,
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  loadMoreRow: {
    pb: 0.5,
  },
  loadMoreButton: {
    borderRadius: 999,
    textTransform: 'none',
    fontWeight: 800,
    px: 2,
  },
  emptyStatePaper: {
    p: 2.25,
    borderRadius: 4,
    border: '1px solid rgba(25, 118, 210, 0.14)',
    bgcolor: 'rgba(25, 118, 210, 0.04)',
  },
  emptyStateAvatar: {
    width: 36,
    height: 36,
    bgcolor: 'primary.main',
  },
  emptyStateTitle: {
    fontWeight: 900,
    lineHeight: 1.1,
  },
  emptyStateSubtitle: {
    color: 'text.secondary',
    mt: 0.25,
  },
  emptyStateHintTitle: {
    color: 'text.secondary',
    fontWeight: 700,
  },
  emptyStateHintText: {
    color: 'text.secondary',
  },
  thinkingAvatar: {
    width: 34,
    height: 34,
    bgcolor: 'primary.main',
  },
  thinkingPaper: {
    px: 2,
    py: 1.25,
    borderRadius: 4,
    border: '1px solid rgba(83, 40, 34, 0.10)',
    bgcolor: 'background.paper',
  },
  composerWrap: {
    p: { xs: 2, md: 3 },
    pt: 0,
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    bgcolor: 'background.default',
  },
  composerPaper: {
    p: 1.5,
    borderRadius: 3,
    bgcolor: 'background.paper',
    border: '1px solid rgba(0, 0, 0, 0.10)',
  },
  inputAdornment: {
    mr: 0.5,
  },
  sendButton: {
    color: 'primary.main',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      bgcolor: 'rgba(255,255,255,0.92)',
      py: 1,
    },
  },
  quotaErrorPaper: {
    px: 1.5,
    py: 1.1,
    pr: 5,
    borderRadius: 2.5,
    border: '1px solid rgba(237, 108, 2, 0.35)',
    bgcolor: 'rgba(237, 108, 2, 0.09)',
    position: 'relative',
  },
  sendErrorPaper: {
    px: 1.5,
    py: 1.1,
    pr: 5,
    borderRadius: 2.5,
    border: '1px solid rgba(211, 47, 47, 0.28)',
    bgcolor: 'rgba(211, 47, 47, 0.06)',
    position: 'relative',
  },
  minWidthRow: {
    minWidth: 0,
  },
  sendErrorStack: {
    minWidth: 0,
    pr: 1,
  },
  quotaTitle: {
    color: 'warning.dark',
    fontWeight: 800,
  },
  sendErrorTitle: {
    color: 'error.main',
    fontWeight: 800,
  },
  quotaBody: {
    mt: 0.25,
    color: 'text.primary',
  },
  mutedCaption: {
    mt: 0.25,
    display: 'block',
    color: 'text.secondary',
  },
  textPrimary: {
    color: 'text.primary',
  },
  closeErrorButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    color: 'text.secondary',
  },
  filtersRow: {
    color: 'text.secondary',
    lineHeight: 1.5,
    ml: 'auto',
  },
  modeSelect: {
    minWidth: 118,
    height: 30,
    borderRadius: 999,
    bgcolor: 'rgba(255,255,255,0.96)',
    color: 'primary.main',
    fontSize: 14,
    fontWeight: 700,
    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(25, 118, 210, 0.35)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
      borderWidth: '1px',
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      py: 0.75,
      pr: 3,
    },
    '& .MuiSvgIcon-root': {
      color: 'primary.main',
    },
  },
  levelSelect: {
    minWidth: 92,
    height: 30,
    borderRadius: 999,
    bgcolor: 'rgba(255,255,255,0.96)',
    color: 'primary.main',
    fontWeight: 700,
    fontSize: 14,
    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(25, 118, 210, 0.35)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
      borderWidth: '1px',
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      py: 0.75,
      pr: 3,
    },
    '& .MuiSvgIcon-root': {
      color: 'primary.main',
    },
  },
  menuItem: {
    fontSize: 14,
  },
};
