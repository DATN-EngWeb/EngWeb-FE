export const contactFormStyles = {
  mainContainer: {
    py: { xs: 6, md: 8 },
    backgroundColor: 'background.paper',
  },

  headerSection: {
    textAlign: 'center',
    mb: { xs: 4, md: 6 },
  },

  mainTitle: {
    color: 'primary.main',
    mb: 1,
    fontWeight: 700,
    fontSize: { xs: '1.75rem', md: '2.5rem' },
    lineHeight: 1.2,
    letterSpacing: '-0.3px',
  },

  subtitle: {
    color: 'text.primary',
    fontSize: '1rem',
    lineHeight: 1.6,
  },

  imageContainer: {
    display: 'flex',
    justifyContent: { xs: 'center', md: 'flex-start' },
    alignItems: 'center',
    width: '100%',
  },

  image: {
    width: '100%',
    maxWidth: { xs: '100%', md: 500 },
  },

  formContainer: {
    mt: { xs: 4, md: 0 },
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
  },

  formRow: {
    display: 'flex',
    gap: 2,
    flexDirection: { xs: 'column', md: 'row' },
  },

  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'background.default',
      '& fieldset': {
        borderColor: 'transparent',
      },
      '&:hover fieldset': {
        borderColor: 'background.default',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
      },
      '&.Mui-focused': {
        backgroundColor: 'background.paper',
      },
    },
    '& .MuiInputBase-input::placeholder': {
      color: 'text.primary',
      opacity: 1,
    },
  },

  sendMessageButton: {
    backgroundColor: 'primary.main',
    color: 'background.paper',
    borderRadius: 9999,
    alignSelf: { xs: 'center', md: 'flex-end' },
    px: 4,
    py: 1.25,
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'primary.dark',
      boxShadow: 'none',
    },
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
    width: '90%',
    height: 'auto',
  },
};
