export const heroSectionStyles = {
  mainContainer: {
    py: { xs: 6, md: 2 },
    backgroundColor: 'background.default',
  },

  mainTitle: {
    color: 'primary.main',
    mb: 2,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.5px',
    fontSize: { xs: '2.6rem', md: '4.0rem' },
    maxWidth: { xs: '100%', md: 470 },
    wordBreak: 'break-word',
    hyphens: 'auto',
  },

  titleContainer: {
    maxWidth: { xs: '100%', md: 1000 },
  },

  description: {
    color: 'text.primary',
    mb: 4,
    maxWidth: 520,
    fontSize: { xs: '1.05rem', md: '1.12rem' },
    lineHeight: 1.7,
  },

  startNowButton: {
    backgroundColor: 'yellow.main',
    color: 'primary.main',
    borderRadius: 9999,
    px: 3,
    py: 1.25,
    fontWeight: 600,
    textTransform: 'none',
    gap: 1.5,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'warning.dark',
      boxShadow: 'none',
    },
  },

  playCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'background.paper',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playTriangle: {
    width: 0,
    height: 0,
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    borderLeft: '10px solid',
    borderLeftColor: 'secondary.main',
    marginLeft: '2px',
  },

  imageContainer: {
    display: 'flex',
    justifyContent: { xs: 'center', md: 'flex-end' },
    alignItems: 'center',
    width: '100%',
  },
  heroImage: {
    width: { xs: 300, md: 560 },
    height: 'auto',
  },

  circularPaper: {
    width: 480,
    height: 420,
    borderRadius: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'background.default',
    overflow: 'hidden',
  },

  mainContentContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexDirection: { xs: 'column', md: 'row' },
  },

  flexBox: {
    flex: 1,
  },

  heroImageStyle: {
    width: '90%',
    height: 'auto',
    maxWidth: 560,
  },
};
