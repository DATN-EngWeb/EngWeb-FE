// HeroSection component styles
export const heroSectionStyles = {
  // Main container styles
  mainContainer: {
    py: 8,
    backgroundColor: 'background.default',
  },

  // Main title styles
  mainTitle: {
    color: 'primary.main',
    mb: 2,
    fontSize: { xs: '2.5rem', md: '3rem' },
  },

  // Description text styles
  description: {
    color: 'text.secondary',
    mb: 3,
    fontSize: '1.1rem',
    lineHeight: 1.6,
  },

  // Start Now button styles
  startNowButton: {
    backgroundColor: 'warning.main',
    color: 'text.primary',
    px: 4,
    py: 1.5,
    fontSize: '1rem',
    '&:hover': {
      backgroundColor: 'warning.dark',
    },
  },

  // Image container styles
  imageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },

  // Circular paper styles
  circularPaper: {
    width: 400,
    height: 400,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#E0E0E0',
  },
};
