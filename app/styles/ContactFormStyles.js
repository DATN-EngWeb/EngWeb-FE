// ContactForm component styles
export const contactFormStyles = {
  // Main container styles
  mainContainer: {
    py: 8,
    backgroundColor: 'background.paper',
  },

  // Circular paper styles
  circularPaper: {
    width: 300,
    height: 300,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '5rem',
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },

  // Question mark styles
  questionMark: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: '3rem',
    color: 'primary.main',
  },

  // Star styles
  star: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    fontSize: '2rem',
    color: 'secondary.main',
  },

  // Any Question button styles
  anyQuestionButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'secondary.main',
    '&:hover': {
      backgroundColor: 'secondary.dark',
    },
  },

  // Text content styles
  textContainer: {
    textAlign: 'center',
  },

  // Main title styles
  mainTitle: {
    color: 'primary.main',
    mb: 1,
    fontSize: { xs: '2rem', md: '2.5rem' },
  },

  // Subtitle styles
  subtitle: {
    color: 'text.secondary',
    mb: 4,
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
      borderRadius: 2,
    },
  },

  // Send Message button styles
  sendMessageButton: {
    backgroundColor: 'primary.main',
    alignSelf: 'flex-start',
    px: 4,
    py: 1.5,
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
  },
};
