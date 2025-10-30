// WhatMakesUsDifferent component styles
export const whatMakesUsDifferentStyles = {
  // Main container styles
  mainContainer: {
    py: { xs: 6, md: 8 },
    backgroundColor: '#ffffff',
  },

  // Heading styles
  heading: {
    color: '#4a2c25',
    mb: 1.5,
    fontWeight: 700,
    fontSize: { xs: '1.5rem', md: '2.2rem' },
    lineHeight: 1.15,
    letterSpacing: '-0.3px',
    maxWidth: { xs: '100%', md: 420 },
  },

  // Description paragraph styles
  description: {
    color: '#6b7280',
    mb: 2,
    fontSize: '0.98rem',
    lineHeight: 1.52,
    maxWidth: { xs: '100%', md: 420 },
  },

  // List container styles
  listContainer: {
    mt: 1.5,
  },

  // List item styles
  listItem: {
    px: 0,
    py: 0.75,
  },

  // List item icon styles
  listItemIcon: {
    minWidth: 36,
    color: '#ff8a3d',
  },

  // List item text styles
  listItemText: {
    '& .MuiListItemText-primary': {
      color: '#6b7280',
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
  },

  // Image container styles
  imageContainer: {
    display: 'flex',
    justifyContent: { xs: 'center', md: 'flex-start' },
    alignItems: 'center',
    width: '100%',
  },

  // Image styles
  image: {
    width: '95%',
    maxWidth: 420,
  },
};
