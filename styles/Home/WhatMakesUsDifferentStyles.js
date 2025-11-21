export const whatMakesUsDifferentStyles = {
  mainContainer: {
    py: { xs: 6, md: 8 },
    backgroundColor: 'background.paper',
  },

  heading: {
    color: 'primary.main',
    mb: 1.5,
    fontWeight: 700,
    fontSize: { xs: '1.5rem', md: '2.2rem' },
    lineHeight: 1.15,
    letterSpacing: '-0.3px',
    maxWidth: { xs: '100%', md: 420 },
  },

  description: {
    color: 'text.primary',
    mb: 2,
    fontSize: '0.98rem',
    lineHeight: 1.52,
    maxWidth: { xs: '100%', md: 900 },
  },

  listContainer: {
    mt: 1.5,
  },

  listItem: {
    px: 0,
    py: 0.75,
  },

  listItemIcon: {
    minWidth: 36,
    color: 'secondary.main',
  },

  listItemText: {
    '& .MuiListItemText-primary': {
      color: 'text.primary',
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
  },

  imageContainer: {
    display: 'flex',
    justifyContent: { xs: 'center', md: 'flex-start' },
    alignItems: 'center',
    width: '100%',
  },

  image: {
    width: '95%',
    maxWidth: 420,
  },

  mainContentContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexDirection: { xs: 'column', md: 'row' },
  },

  flexBox: {
    flex: 1,
  },

  imageStyle: {
    width: '95%',
    maxWidth: 420,
    height: 'auto',
  },
};
