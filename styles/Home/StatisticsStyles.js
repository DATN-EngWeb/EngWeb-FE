export const statisticsStyles = {
  mainContainer: {
    py: 8,
    backgroundColor: 'background.paper',
  },

  mainTitle: {
    fontSize: { xs: '1.45rem', md: '3rem' },
    color: 'primary.main',
    fontWeight: 700,
    mb: 2,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    maxWidth: 800,
  },

  statsContainer: {
    mb: 3,
  },

  statBox: {
    textAlign: 'center',
  },

  statNumber: {
    mb: 0,
    fontSize: { xs: '2.2rem', md: '3.4rem' },
    fontWeight: 700,
    color: 'secondary.main',
  },

  statLabel: {
    color: 'text.primary',
    fontSize: '1.25rem',
    lineHeight: 1.25,
  },

  description: {
    fontSize: '0.93rem',
    color: 'text.primary',
    maxWidth: 400,
    textAlign: 'right',
    lineHeight: 1.45,
    ml: 'auto',
    alignSelf: 'center',
  },

  rightImageContainer: {
    display: 'flex',
    justifyContent: { xs: 'center', md: 'flex-end' },
    alignItems: 'center',
    width: '100%',
  },

  topRowContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexDirection: { xs: 'column', md: 'row' },
  },

  flexBox: {
    flex: 1,
  },

  imageFlexBox: {
    flex: 1,
    display: 'flex',
    justifyContent: { xs: 'center', md: 'flex-end' },
    alignItems: 'center',
  },

  imageStyle: {
    width: '50%',
    height: 'auto',
    maxWidth: '100%',
  },

  bottomRowContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    mt: 2,
    flexWrap: 'wrap',
  },

  statBoxContainer: {
    minWidth: { xs: '45%', md: 'auto' },
  },

  descriptionContainer: {
    ml: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
};
