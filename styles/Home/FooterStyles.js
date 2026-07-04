export const footerStyles = {
  mainContainer: {
    backgroundColor: 'background.paper',
    color: 'text.primary',
    py: 3,
    borderTop: 1,
    borderTopColor: 'background.default',
  },

  columnsWrapper: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  columnWide: {
    flex: '1 1 320px',
    minWidth: 260,
  },
  columnNarrow: {
    flex: '1 1 160px',
    minWidth: 160,
  },

  logoLink: {
    textDecoration: 'none',
    color: 'inherit',
  },

  sectionTitle: {
    mb: 2,
    fontSize: '0.95rem',
    color: 'text.primary',
    fontWeight: 600,
  },

  linksContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  footerLink: {
    color: 'text.primary',
    textDecoration: 'none',
    fontSize: '0.9rem',
    '&:hover': {
      color: 'primary.main',
    },
  },

  socialLinksContainer: {
    display: 'flex',
    gap: 1,
  },

  socialLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,

    transition: 'background-color .2s ease, transform .1s ease',
    '&:hover': {
      backgroundColor: 'background.default',
      transform: 'translateY(-1px)',
    },
  },

  contactInfo: {
    mt: 2,
  },
};
