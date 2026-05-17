export const testReleasesStyles = {
  mainContainer: {
    py: 6,
    backgroundColor: 'background.paper',
  },

  title: {
    color: 'primary.main',
    mb: 4,
    fontSize: { xs: '1.8rem', md: '2rem' },
  },

  cardBase: {
    color: 'background.paper',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-4px)',
      transition: 'transform 0.3s ease',
    },
  },

  cardContent: {
    p: 3,
    position: 'relative',
  },

  iconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: '2rem',
    opacity: 0.3,
  },

  cardTitle: {
    fontWeight: 'bold',
    mb: 2,
    fontSize: '1.2rem',
  },

  decorativeCircle: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
  },
};
