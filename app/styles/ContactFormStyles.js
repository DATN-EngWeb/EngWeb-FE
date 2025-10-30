// ContactForm component styles
export const contactFormStyles = {
  // Main container styles
  mainContainer: {
    py: { xs: 6, md: 8 },
    backgroundColor: '#ffffff',
  },

  // Header section styles (heading and subtitle at top)
  headerSection: {
    textAlign: 'center',
    mb: { xs: 4, md: 6 },
  },

  // Main title styles
  mainTitle: {
    color: '#4a2c25',
    mb: 1,
    fontWeight: 700,
    fontSize: { xs: '1.75rem', md: '2.5rem' },
    lineHeight: 1.2,
    letterSpacing: '-0.3px',
  },

  // Subtitle styles
  subtitle: {
    color: '#6b7280',
    fontSize: '1rem',
    lineHeight: 1.6,
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
    width: '100%',
    maxWidth: { xs: '100%', md: 500 },
  },

  // Form container styles
  formContainer: {
    mt: { xs: 4, md: 0 },
  },

  // Form styles
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },

  // TextField styles
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: '#f5f5f5',
      '& fieldset': {
        borderColor: 'transparent',
      },
      '&:hover fieldset': {
        borderColor: '#e0e0e0',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#d0d0d0',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
      },
    },
    '& .MuiInputBase-input::placeholder': {
      color: '#9e9e9e',
      opacity: 1,
    },
  },

  // Send Message button styles
  sendMessageButton: {
    backgroundColor: '#5a2b22',
    color: '#ffffff',
    borderRadius: 9999,
    alignSelf: 'flex-end',
    px: 4,
    py: 1.25,
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#4a231c',
      boxShadow: 'none',
    },
  },
};
