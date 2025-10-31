// HeroSection component styles
export const heroSectionStyles = {
  // Main container styles
  mainContainer: {
    py: { xs: 6, md: 2 },
    backgroundColor: '#fff4e9',
  },

  // Main title styles
  mainTitle: {
    color: '#4a2c25', // deep brown close to screenshot
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

  // Description text styles
  description: {
    color: '#6b7280',
    mb: 4,
    maxWidth: 520,
    fontSize: { xs: '1.05rem', md: '1.12rem' },
    lineHeight: 1.7,
  },

  // Start Now button styles
  startNowButton: {
    backgroundColor: '#f9c35d',
    color: '#4a2c25',
    borderRadius: 9999,
    px: 3,
    py: 1.25,
    fontWeight: 600,
    textTransform: 'none',
    gap: 1.5,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#e6ad3f',
      boxShadow: 'none',
    },
  },

  playCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playTriangle: {
    width: 0,
    height: 0,
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    borderLeft: '10px solid #f0a000',
    marginLeft: '2px',
  },

  // Image container styles
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

  // Circular paper styles
  circularPaper: {
    width: 480,
    height: 420,
    borderRadius: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#f1e6da',
    overflow: 'hidden',
  },
};
