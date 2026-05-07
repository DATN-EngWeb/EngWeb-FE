export const getConversationItemPaperSx = (isActive) => ({
  p: 1.25,
  borderRadius: 3,
  cursor: 'pointer',
  border: '1px solid',
  borderColor: isActive ? 'primary.main' : 'rgba(83, 40, 34, 0.08)',
  bgcolor: isActive ? 'rgba(83, 40, 34, 0.05)' : 'background.paper',
});

export const conversationSidebarStyles = {
  root: {
    p: 2.25,
    borderRight: { md: '1px solid rgba(0, 0, 0, 0.08)' },
    bgcolor: 'background.paper',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 3,
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    boxShadow: '0 14px 28px rgba(83, 40, 34, 0.22)',
  },
  title: {
    fontWeight: 900,
    lineHeight: 1.1,
  },
  subtitle: {
    color: 'text.secondary',
  },
  closeButton: {
    bgcolor: 'background.paper',
  },
  createButtonRow: {
    mt: 2,
  },
  createButton: {
    py: 1.2,
    fontWeight: 800,
  },
  listWrap: {
    mt: 2.25,
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    pr: 0.5,
  },
  listLabel: {
    color: 'text.secondary',
    fontWeight: 900,
  },
  listStack: {
    mt: 1,
  },
  skeletonPaper: {
    p: 1.25,
    borderRadius: 3,
    bgcolor: 'rgba(0, 0, 0, 0.06)',
    border: 'none',
    display: 'flex',
    gap: 1.25,
    alignItems: 'center',
  },
  skeletonThumb: {
    width: 44,
    height: 44,
    borderRadius: 2,
    bgcolor: 'rgba(0, 0, 0, 0.08)',
    flexShrink: 0,
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
  },
  skeletonTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  skeletonLinePrimary: {
    height: 12,
    bgcolor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 1,
    mb: 0.75,
    width: '70%',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  skeletonLineSecondary: {
    height: 10,
    bgcolor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 1,
    width: '50%',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  emptyPaper: {
    p: 2,
    borderRadius: 3,
    bgcolor: 'rgba(83, 40, 34, 0.03)',
    border: '1px dashed rgba(83, 40, 34, 0.14)',
  },
  emptyText: {
    fontWeight: 700,
    color: 'text.secondary',
  },
  contentGrow: {
    minWidth: 0,
    flex: 1,
  },
  editStack: {
    width: '100%',
  },
  saveButton: {
    borderRadius: 1.5,
    fontWeight: 700,
    flex: 1,
  },
  cancelButton: {
    borderRadius: 1.5,
    fontWeight: 700,
    flex: 1,
  },
  conversationTitle: {
    fontWeight: 900,
  },
  optionsButton: {
    color: 'text.secondary',
    flexShrink: 0,
  },
  menuPaper: {
    borderRadius: 2,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
  },
  menuItem: {
    fontWeight: 600,
    fontSize: 14,
  },
  deleteMenuItem: {
    fontWeight: 600,
    fontSize: 14,
    color: 'error.dark',
  },
};
