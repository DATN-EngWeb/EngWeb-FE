// Footer component styles
export const footerStyles = {
  // Main container styles
  mainContainer: {
    backgroundColor: '#ffffff',
    color: '#111827',
    py: 6,
    borderTop: '1px solid #f0f0f0',
  },

  // Columns wrapper
  columnsWrapper: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  // Column sizes
  columnWide: {
    flex: '1 1 320px',
    minWidth: 260,
  },
  columnNarrow: {
    flex: '1 1 160px',
    minWidth: 160,
  },

  // Logo link styles
  logoLink: {
    textDecoration: 'none',
    color: 'inherit',
  },

  // Section title styles
  sectionTitle: {
    mb: 2,
    fontSize: '0.95rem',
    color: '#6b7280',
    fontWeight: 600,
  },

  // Links container styles
  linksContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  // Footer link styles
  footerLink: {
    color: '#374151',
    textDecoration: 'none',
    fontSize: '0.9rem',
    '&:hover': {
      color: '#111827',
    },
  },

  // Social links container styles
  socialLinksContainer: {
    display: 'flex',
    gap: 1,
  },

  // Social link styles
  socialLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,

    transition: 'background-color .2s ease, transform .1s ease',
    '&:hover': {
      backgroundColor: '#e5e7eb',
      transform: 'translateY(-1px)',
    },
  },
};
