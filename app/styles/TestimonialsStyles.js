export const testimonialsStyles = {
  mainContainer: {
    py: 8,
    backgroundColor: 'background.paper',
    display: 'flex',
    justifyContent: 'center',
  },

  title: {
    color: 'primary.main',
    mb: 6,
    textAlign: 'center',
    fontSize: { xs: '2rem', md: '2.5rem' },
  },

  cardSectionContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
  },

  cardContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 800,
    height: 460,
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    flex: 1,
    backgroundColor: 'background.paper',
  },

  imageWrapper: {
    position: 'absolute',
    top: '-20%',
    left: '-40%',
    width: '180%',
    height: '170%',

    borderRadius: '16px',
    overflow: 'hidden',
  },

  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 48px',
    zIndex: 2,
  },

  userInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.5,
    mb: 3,
  },

  avatar: {
    width: 80,
    height: 80,
    mb: 1,
  },

  userName: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#383838',
    textAlign: 'center',
    lineHeight: 1.2,
  },

  userRole: {
    fontSize: '0.9rem',
    fontWeight: 400,
    color: '#383838',
    textAlign: 'center',
    lineHeight: 1.2,
  },

  text: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#383838',
    lineHeight: 1.6,
    textAlign: 'left',
    maxWidth: '75%',
    mx: 'auto',
    mt: 2,
  },

  navContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 2,
    mb: 2,
  },

  navButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    border: '1px solid #FFF4E9',
    borderRadius: '50%',
    flexShrink: 0,
    '&:hover': {
      backgroundColor: '#FFF4E9',
    },
    '& svg': {
      color: '#383838',
    },
  },

  cardImageStyle: {
    objectFit: 'cover',
  },
};
